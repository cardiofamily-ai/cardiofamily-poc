import {
  applyReclassifications,
  pendingReclassifications,
} from '@/domain/reclassification/impact'
import type { FamilySnapshot } from '@/domain/snapshot'
import type { IsoDate } from '@/domain/time'
import { reclassificationReviewActions } from './reclassification-review'
import { runPathwayRules } from './rules'
import type { FamilyAction } from './types'

export interface EvaluationOptions {
  readonly today: IsoDate
  /** Reclassification events a clinician has acknowledged (session state, supplied by the caller). */
  readonly acknowledgedReclassificationIds?: readonly string[]
}

/**
 * Family Action Engine. Pure and deterministic: the same snapshot and options
 * always produce the same actions, and the snapshot is never modified.
 *
 * Pathway rules (DEMO-R-001…005) see only acknowledged reclassifications.
 * Unacknowledged ones produce DEMO-R-006 clinician-review actions instead.
 */
export function evaluateFamilyActions(
  snapshot: FamilySnapshot,
  { today, acknowledgedReclassificationIds = [] }: EvaluationOptions,
): FamilyAction[] {
  const acknowledged = snapshot.reclassificationEvents.filter(
    (e) => e.receivedDate <= today && acknowledgedReclassificationIds.includes(e.id),
  )
  const effective = applyReclassifications(snapshot, acknowledged)

  const actions = [
    ...runPathwayRules(effective, today),
    ...pendingReclassifications(effective, acknowledgedReclassificationIds, today).flatMap(
      (event) => reclassificationReviewActions(effective, event, today),
    ),
  ]
  return sortActions(actions)
}

const DUE_RANK = { overdue: 0, upcoming: 1 } as const

/** Overdue first (oldest first), then upcoming by date, then unscheduled; ties by rule then person. */
export function sortActions(actions: readonly FamilyAction[]): FamilyAction[] {
  const rank = (a: FamilyAction) => (a.when.kind === 'due' ? DUE_RANK[a.when.dueState] : 2)
  const date = (a: FamilyAction) => (a.when.kind === 'due' ? a.when.dueDate : '')
  return actions.toSorted(
    (a, b) =>
      rank(a) - rank(b) ||
      date(a).localeCompare(date(b)) ||
      a.ruleId.localeCompare(b.ruleId) ||
      a.id.localeCompare(b.id),
  )
}
