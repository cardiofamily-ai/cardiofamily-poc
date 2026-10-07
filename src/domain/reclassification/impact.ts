import { runPathwayRules } from '@/domain/actions/rules'
import type { FamilyAction } from '@/domain/actions/types'
import { isBloodRelative, kinship } from '@/domain/family/kinship'
import type { PersonId } from '@/domain/family/types'
import type { Classification } from '@/domain/genetics/types'
import { isLiving, type FamilySnapshot } from '@/domain/snapshot'
import { activeSurveillancePlan } from '@/domain/surveillance/surveillance'
import type { IsoDate } from '@/domain/time'
import type { ReclassificationEvent } from './types'

/** Why a person may be affected by a reclassification. */
export type ImpactReason =
  | { readonly kind: 'action-raised'; readonly action: FamilyAction }
  | { readonly kind: 'action-resolved'; readonly action: FamilyAction }
  | { readonly kind: 'surveillance-plan'; readonly planId: string }
  | { readonly kind: 'test-result'; readonly testId: string }

export interface PersonImpact {
  readonly personId: PersonId
  readonly reasons: readonly ImpactReason[]
}

export interface ReclassificationImpact {
  readonly eventId: string
  readonly familyId: string
  readonly variantId: string
  readonly from: Classification
  readonly to: Classification
  readonly affectedPeople: readonly PersonImpact[]
}

/** Returns a snapshot with each event's new interpretation added to the history. */
export function applyReclassifications(
  snapshot: FamilySnapshot,
  events: readonly ReclassificationEvent[],
): FamilySnapshot {
  if (events.length === 0) return snapshot
  return {
    ...snapshot,
    interpretations: [...snapshot.interpretations, ...events.map((e) => e.newInterpretation)],
  }
}

/** Events received on or before today that a clinician has not yet acknowledged. */
export function pendingReclassifications(
  snapshot: FamilySnapshot,
  acknowledgedIds: readonly string[],
  today: IsoDate,
): ReclassificationEvent[] {
  return snapshot.reclassificationEvents.filter(
    (e) => e.receivedDate <= today && !acknowledgedIds.includes(e.id),
  )
}

/**
 * Impact = the difference between demonstration pathway actions before and
 * after the new interpretation is applied, plus surveillance plans and test
 * results that relate to the variant. Nothing is changed; this only reports.
 */
export function assessReclassificationImpact(
  snapshot: FamilySnapshot,
  event: ReclassificationEvent,
  today: IsoDate,
): ReclassificationImpact {
  const previous = snapshot.interpretations.find((i) => i.id === event.previousInterpretationId)
  if (!previous) {
    throw new Error(`Reclassification ${event.id}: previous interpretation not found`)
  }

  const before = runPathwayRules(snapshot, today)
  const after = runPathwayRules(applyReclassifications(snapshot, [event]), today)
  const beforeIds = new Set(before.map((a) => a.id))
  const afterIds = new Set(after.map((a) => a.id))

  const affectedPeople = snapshot.people.filter(isLiving).flatMap((person) => {
    const reasons: ImpactReason[] = [
      ...after
        .filter((a) => a.personId === person.id && !beforeIds.has(a.id))
        .map((action) => ({ kind: 'action-raised' as const, action })),
      ...before
        .filter((a) => a.personId === person.id && !afterIds.has(a.id))
        .map((action) => ({ kind: 'action-resolved' as const, action })),
    ]

    const related = isBloodRelative(kinship(snapshot.people, snapshot.family.probandId, person.id))
    const plan = activeSurveillancePlan(snapshot.surveillancePlans, person.id)
    if (related && plan) reasons.push({ kind: 'surveillance-plan', planId: plan.id })

    for (const test of snapshot.geneticTests) {
      if (test.personId === person.id && test.variantId === event.variantId && test.status === 'resulted') {
        reasons.push({ kind: 'test-result', testId: test.id })
      }
    }
    return reasons.length > 0 ? [{ personId: person.id, reasons }] : []
  })

  return {
    eventId: event.id,
    familyId: event.familyId,
    variantId: event.variantId,
    from: previous.classification,
    to: event.newInterpretation.classification,
    affectedPeople,
  }
}
