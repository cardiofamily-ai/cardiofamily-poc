import type { FamilyAction } from '@/domain/actions/types'

/**
 * Which of a person's open actions to show first as NEXT ACTION.
 *
 * Display/workflow priority only — not clinical severity. Dated items
 * (overdue, then upcoming) keep the engine's order. Among items with no due
 * date, an unacknowledged reclassification review is shown ahead of routine
 * items so the clinician sees that genetic knowledge has changed.
 * The engine's own ordering and rule semantics are unchanged.
 */
export function primaryAction(actions: readonly FamilyAction[]): FamilyAction | undefined {
  const first = actions[0]
  if (!first || first.when.kind === 'due') return first
  return actions.find((a) => a.category === 'reclassification-review') ?? first
}
