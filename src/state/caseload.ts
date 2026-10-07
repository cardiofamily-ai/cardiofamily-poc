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
  /** Clinician review log (session state). */
  readonly reviews: readonly ReviewEntry[]
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
  /** Current interpretation, including clinician-acknowledged reclassifications. */
  readonly interpretation: VariantInterpretation
  /** All interpretations of the familial variant in force so far, oldest first. */
  readonly interpretationHistory: readonly VariantInterpretation[]
  /** Open actions (pending or deferred clinician review), in engine priority order. */
  readonly actions: readonly FamilyAction[]
  /** Engine actions whose review is closed (reviewed / not applicable). */
  readonly closedActions: readonly FamilyAction[]
  /** Review status of every engine action, by action id. */
  readonly actionReviewStatus: Readonly<Record<string, ReviewStatus>>
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
  if (!variant || !interpretation) {
    throw new Error(`${snapshot.family.id}: no familial variant with a current interpretation`)
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
  const actions = evaluated.filter((a) => isOpenReviewStatus(actionReviewStatus[a.id]!))
  const people = snapshot.people.map((p) => summarisePerson(snapshot, p.id, ctx.today))
  return {
    snapshot,
    proband,
    variant,
    interpretation,
    interpretationHistory: interpretationHistory(effective.interpretations, variant.id).filter(
      (i) => i.effectiveDate <= ctx.today,
    ),
    actions,
    closedActions: evaluated.filter((a) => !isOpenReviewStatus(actionReviewStatus[a.id]!)),
    actionReviewStatus,
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
