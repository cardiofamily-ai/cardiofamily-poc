/**
 * Workflow state of a CardioFamily action. These are workflow states, not
 * medical conclusions: recording one never changes tests, surveillance,
 * diagnosis, risk or treatment, and never creates new actions.
 */
import type { IsoDate } from '@/domain/time'

export type ActionWorkflowState = 'open' | 'in-progress' | 'completed' | 'deferred' | 'not-applicable'

export const ACTION_WORKFLOW_STATES: readonly ActionWorkflowState[] = [
  'open',
  'in-progress',
  'completed',
  'deferred',
  'not-applicable',
]

export interface ActionWorkflowEntry {
  readonly id: string
  readonly actionId: string
  readonly state: ActionWorkflowState
  readonly note?: string
  readonly recordedBy: string
  readonly date: IsoDate
}

export interface CurrentWorkflow {
  readonly state: ActionWorkflowState
  readonly latest?: ActionWorkflowEntry
  /** All entries for the action, oldest first. */
  readonly history: readonly ActionWorkflowEntry[]
}

/** Latest entry decides the state; an action with no entries is Open. */
export function currentWorkflow(entries: readonly ActionWorkflowEntry[], actionId: string): CurrentWorkflow {
  const history = entries.filter((e) => e.actionId === actionId)
  const latest = history.at(-1)
  return latest ? { state: latest.state, latest, history } : { state: 'open', history }
}

/** Outstanding work: Open, In progress and Deferred. Completed and Not applicable close the item. */
export function isOutstanding(state: ActionWorkflowState): boolean {
  return state === 'open' || state === 'in-progress' || state === 'deferred'
}

/** States that can be recorded next: any state other than the current one. */
export function nextWorkflowStates(current: ActionWorkflowState): ActionWorkflowState[] {
  return ACTION_WORKFLOW_STATES.filter((s) => s !== current)
}
