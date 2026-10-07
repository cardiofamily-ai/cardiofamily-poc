/**
 * Read models for the clinician screens. Pure functions that combine seed
 * snapshots with domain outputs (engine actions, person summaries, impact).
 * No clinical logic lives here: only grouping, counting and joining.
 */
import { evaluateFamilyActions } from '@/domain/actions/engine'
import type { FamilyAction } from '@/domain/actions/types'
import type { Person } from '@/domain/family/types'
import { currentInterpretation, interpretationHistory } from '@/domain/genetics/interpretation'
import type { Variant, VariantInterpretation } from '@/domain/genetics/types'
import { summarisePerson, type PersonSummary } from '@/domain/person-summary'
import { categoriseRelative, type RelativeStatus } from '@/domain/relative-status'
import {
  applyReclassifications,
  assessReclassificationImpact,
  type ReclassificationImpact,
} from '@/domain/reclassification/impact'
import type { ReclassificationEvent } from '@/domain/reclassification/types'
import {
  currentWorkflow,
  isOutstanding,
  type ActionWorkflowEntry,
  type CurrentWorkflow,
} from '@/domain/action-workflow'
import {
  acknowledgedReclassificationIds,
  currentReview,
  isOpenReviewStatus,
  type CurrentReview,
  type ReviewEntry,
  type ReviewStatus,
} from '@/domain/review'
import { getProband, type FamilySnapshot } from '@/domain/snapshot'
import type { IsoDate } from '@/domain/time'

export interface EvaluationContext {
  readonly today: IsoDate
  /** Clinician review log for reclassification impact reviews (session state). */
  readonly reviews: readonly ReviewEntry[]
  /** Action workflow log (session state). */
  readonly actionLog?: readonly ActionWorkflowEntry[]
}

export interface ReclassificationItem {
  readonly event: ReclassificationEvent
  readonly variant: Variant
  /** Impact relative to the family without this event applied. */
  readonly impact: ReclassificationImpact
  readonly review: CurrentReview
}

export interface FamilyOverview {
  readonly snapshot: FamilySnapshot
  readonly proband: Person
  readonly variant: Variant
  /**
   * Last acknowledged classification: the seeded interpretation plus any
   * reclassification a clinician has reviewed. RISK and actions use this.
   */
  readonly acknowledgedInterpretation: VariantInterpretation
  /** Latest laboratory classification received, whether or not it has been reviewed. */
  readonly latestLaboratoryInterpretation: VariantInterpretation
  /** True while a received laboratory reclassification awaits clinician review (pending or deferred). */
  readonly latestAwaitingReview: boolean
  /** All interpretations of the familial variant in force so far, oldest first. */
  readonly interpretationHistory: readonly VariantInterpretation[]
  /** Outstanding actions, in engine priority order. */
  readonly actions: readonly FamilyAction[]
  /** Engine actions no longer outstanding (workflow completed / not applicable, or impact review closed). */
  readonly closedActions: readonly FamilyAction[]
  /** DEMO-R-006 items: status of their reclassification impact review, by action id. */
  readonly actionReviewStatus: Readonly<Record<string, ReviewStatus>>
  /** All other actions: workflow state and history, by action id. */
  readonly actionWorkflow: Readonly<Record<string, CurrentWorkflow>>
  readonly people: readonly PersonSummary[]
  /** RISK categorisation per person id. */
  readonly relativeStatuses: Readonly<Record<string, RelativeStatus>>
  /** Every reclassification received on or before today, with its review state. */
  readonly reclassifications: readonly ReclassificationItem[]
  /** Reclassifications whose impact review is still open (pending or deferred). */
  readonly pendingReclassifications: readonly ReclassificationItem[]
  /** Distinct people with at least one open action. */
  readonly peopleNeedingAttention: number
  readonly overdueActions: number
  readonly cascadeTestingActions: number
  readonly reclassificationReviews: number
}

/** An action joined with who it concerns, for cross-family lists. */
export interface AttentionItem {
  readonly action: FamilyAction
  readonly person: PersonSummary
  readonly family: FamilyOverview
}

const isOverdue = (a: FamilyAction) => a.when.kind === 'due' && a.when.dueState === 'overdue'

export function buildFamilyOverview(snapshot: FamilySnapshot, ctx: EvaluationContext): FamilyOverview {
  const proband = getProband(snapshot)
  const diagnostic = snapshot.geneticTests.find((t) => t.personId === proband.id && t.kind === 'diagnostic')
  const variant = snapshot.variants.find((v) => v.id === diagnostic?.variantId) ?? snapshot.variants[0]
  const received = snapshot.reclassificationEvents.filter((e) => e.receivedDate <= ctx.today)
  const acknowledgedIds = acknowledgedReclassificationIds(ctx.reviews, received.map((e) => e.id))
  const acknowledged = received.filter((e) => acknowledgedIds.includes(e.id))
  const effective = applyReclassifications(snapshot, acknowledged)
  const interpretation = variant && currentInterpretation(effective.interpretations, variant.id, ctx.today)
  const latest = variant && currentInterpretation(applyReclassifications(snapshot, received).interpretations, variant.id, ctx.today)
  if (!variant || !interpretation || !latest) {
    throw new Error(`${snapshot.family.id}: no familial variant with an acknowledged interpretation`)
  }

  const reclassifications = received.map((event) => ({
    event,
    variant: snapshot.variants.find((v) => v.id === event.variantId) ?? variant,
    impact: assessReclassificationImpact(
      applyReclassifications(snapshot, acknowledged.filter((e) => e.id !== event.id)),
      event,
      ctx.today,
    ),
    review: currentReview(ctx.reviews, event.id),
  }))

  // Engine output is unchanged; review status is an overlay. DEMO-R-006 items
  // take the status of their reclassification event's impact review.
  const evaluated = evaluateFamilyActions(snapshot, {
    today: ctx.today,
    acknowledgedReclassificationIds: acknowledgedIds,
  })
  const actionReviewStatus = Object.fromEntries(
    evaluated.map((a) => [
      a.id,
      a.ruleId === 'DEMO-R-006' ? currentReview(ctx.reviews, a.subjectId).status : 'pending-clinician-review',
    ]),
  ) as Record<string, ReviewStatus>
  const actionWorkflow = Object.fromEntries(
    evaluated
      .filter((a) => a.ruleId !== 'DEMO-R-006')
      .map((a) => [a.id, currentWorkflow(ctx.actionLog ?? [], a.id)]),
  )
  const outstanding = (a: FamilyAction) =>
    a.ruleId === 'DEMO-R-006'
      ? isOpenReviewStatus(actionReviewStatus[a.id]!)
      : isOutstanding(actionWorkflow[a.id]!.state)
  const actions = evaluated.filter(outstanding)
  const people = snapshot.people.map((p) => summarisePerson(snapshot, p.id, ctx.today))
  return {
    snapshot,
    proband,
    variant,
    acknowledgedInterpretation: interpretation,
    latestLaboratoryInterpretation: latest,
    latestAwaitingReview: reclassifications.some((r) => isOpenReviewStatus(r.review.status)),
    interpretationHistory: interpretationHistory(effective.interpretations, variant.id).filter(
      (i) => i.effectiveDate <= ctx.today,
    ),
    actions,
    closedActions: evaluated.filter((a) => !outstanding(a)),
    actionReviewStatus,
    actionWorkflow,
    people,
    relativeStatuses: Object.fromEntries(
      people.map((p) => [p.person.id, categoriseRelative(p, variant.id, interpretation.classification)]),
    ),
    reclassifications,
    pendingReclassifications: reclassifications.filter((r) => isOpenReviewStatus(r.review.status)),
    peopleNeedingAttention: new Set(actions.map((a) => a.personId)).size,
    overdueActions: actions.filter(isOverdue).length,
    cascadeTestingActions: actions.filter((a) => a.category === 'cascade-testing').length,
    reclassificationReviews: actions.filter((a) => a.category === 'reclassification-review').length,
  }
}

export interface Caseload {
  /** Families ordered by urgency: overdue first, then by open actions. */
  readonly families: readonly FamilyOverview[]
  /** Every open action across families, in engine priority order. */
  readonly attention: readonly AttentionItem[]
  readonly totals: {
    readonly families: number
    readonly familiesNeedingAttention: number
    readonly openActions: number
    readonly overdueActions: number
    readonly cascadeTestingActions: number
    readonly reclassificationReviews: number
    readonly inProgressActions: number
    readonly deferredActions: number
  }
}

export function buildCaseload(snapshots: readonly FamilySnapshot[], ctx: EvaluationContext): Caseload {
  const overviews = snapshots.map((s) => buildFamilyOverview(s, ctx))
  const families = overviews.toSorted(
    (a, b) =>
      b.overdueActions - a.overdueActions ||
      b.pendingReclassifications.length - a.pendingReclassifications.length ||
      b.actions.length - a.actions.length,
  )

  const attention = overviews
    .flatMap((family) =>
      family.actions.map((action) => ({
        action,
        family,
        person: family.people.find((p) => p.person.id === action.personId) as PersonSummary,
      })),
    )
    .toSorted((a, b) => attentionRank(a.action) - attentionRank(b.action) || dueKey(a.action).localeCompare(dueKey(b.action)))

  const sum = (pick: (f: FamilyOverview) => number) => overviews.reduce((n, f) => n + pick(f), 0)
  return {
    families,
    attention,
    totals: {
      families: overviews.length,
      familiesNeedingAttention: overviews.filter((f) => f.actions.length > 0).length,
      openActions: sum((f) => f.actions.length),
      overdueActions: sum((f) => f.overdueActions),
      cascadeTestingActions: sum((f) => f.cascadeTestingActions),
      reclassificationReviews: sum((f) => f.reclassificationReviews),
      inProgressActions: sum((f) => f.actions.filter((a) => f.actionWorkflow[a.id]?.state === 'in-progress').length),
      deferredActions: sum((f) => f.actions.filter((a) => f.actionWorkflow[a.id]?.state === 'deferred').length),
    },
  }
}

// Same ordering as the engine (overdue → upcoming → unscheduled), applied across families.
function attentionRank(a: FamilyAction) {
  return a.when.kind === 'due' ? (a.when.dueState === 'overdue' ? 0 : 1) : 2
}
function dueKey(a: FamilyAction) {
  return a.when.kind === 'due' ? a.when.dueDate : ''
}

/** People with an active, upcoming surveillance date, soonest first. */
export function upcomingSurveillance(caseload: Caseload) {
  return caseload.families
    .flatMap((family) =>
      family.people
        .filter((p) => p.surveillance.state === 'upcoming' && p.surveillance.plan)
        .map((person) => ({ family, person, dueDate: person.surveillance.plan!.nextDueDate })),
    )
    .toSorted((a, b) => a.dueDate.localeCompare(b.dueDate))
}

/** Locates any engine action (outstanding or closed) with its family and person. */
export function findAction(caseload: Caseload, actionId: string) {
  for (const family of caseload.families) {
    const action =
      family.actions.find((a) => a.id === actionId) ?? family.closedActions.find((a) => a.id === actionId)
    if (action) {
      const person = family.people.find((p) => p.person.id === action.personId)!
      return { family, action, person, outstanding: family.actions.includes(action) }
    }
  }
  return undefined
}
