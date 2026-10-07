import type { ActionWorkflowState, CurrentWorkflow } from '@/domain/action-workflow'
import { sortActions } from '@/domain/actions/engine'
import type { FamilyAction } from '@/domain/actions/types'
import type { PersonSummary } from '@/domain/person-summary'
import type { ReviewStatus } from '@/domain/review'
import type { Caseload, FamilyOverview } from './caseload'

export type WorklistFilter = 'outstanding' | 'in-progress' | 'deferred' | 'closed' | 'all'

export interface WorklistRow {
  readonly action: FamilyAction
  readonly family: FamilyOverview
  readonly person: PersonSummary
  readonly outstanding: boolean
  /** Workflow state (all actions except DEMO-R-006). */
  readonly workflow?: CurrentWorkflow
  /** Impact-review status for DEMO-R-006 items. */
  readonly reviewStatus: ReviewStatus
}

/** All engine actions across the caseload, filtered by workflow state, with counts per filter. */
export function worklist(caseload: Caseload, filter: WorklistFilter) {
  const all: WorklistRow[] = caseload.families.flatMap((family) =>
    [...family.actions, ...family.closedActions].map((action) => {
      const workflow = family.actionWorkflow[action.id]
      return {
        action,
        family,
        person: family.people.find((p) => p.person.id === action.personId)!,
        outstanding: family.actions.includes(action),
        ...(workflow ? { workflow } : {}),
        reviewStatus: family.actionReviewStatus[action.id]!,
      }
    }),
  )
  // Engine priority order across families (overdue → upcoming → no due date).
  const byId = new Map(all.map((r) => [r.action.id, r]))
  const sorted = sortActions(all.map((r) => r.action)).map((a) => byId.get(a.id)!)
  const isState = (state: ActionWorkflowState | ReviewStatus) => (r: WorklistRow) =>
    r.workflow ? r.workflow.state === state : r.reviewStatus === state

  const filters: Record<WorklistFilter, (r: WorklistRow) => boolean> = {
    outstanding: (r) => r.outstanding,
    'in-progress': isState('in-progress'),
    deferred: isState('deferred'),
    closed: (r) => !r.outstanding,
    all: () => true,
  }
  return {
    rows: sorted.filter(filters[filter]),
    counts: Object.fromEntries(
      (Object.keys(filters) as WorklistFilter[]).map((f) => [f, sorted.filter(filters[f]).length]),
    ) as Record<WorklistFilter, number>,
  }
}
