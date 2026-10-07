import { toIsoDate as d } from '@/domain/time'
import {
  currentWorkflow,
  isOutstanding,
  nextWorkflowStates,
  type ActionWorkflowEntry,
  type ActionWorkflowState,
} from './action-workflow'

const entry = (n: number, actionId: string, state: ActionWorkflowState, note?: string): ActionWorkflowEntry => ({
  id: `act-${n}`, actionId, state, recordedBy: 'Demo Clinician (fictional)', date: d('2026-10-01'),
  ...(note ? { note } : {}),
})

describe('action workflow', () => {
  it('starts Open with no history', () => {
    expect(currentWorkflow([], 'a')).toEqual({ state: 'open', history: [] })
  })

  it('takes the latest entry and keeps the full history (append-only)', () => {
    const log = [entry(1, 'a', 'in-progress'), entry(2, 'b', 'completed'), entry(3, 'a', 'completed', 'Done')]
    const wf = currentWorkflow(log, 'a')
    expect(wf.state).toBe('completed')
    expect(wf.latest?.note).toBe('Done')
    expect(wf.history.map((e) => e.state)).toEqual(['in-progress', 'completed'])
  })

  it.each([
    [['in-progress'], 'in-progress'],
    [['in-progress', 'completed'], 'completed'],
    [['deferred'], 'deferred'],
    [['deferred', 'in-progress', 'completed'], 'completed'],
    [['not-applicable'], 'not-applicable'],
    [['completed', 'open'], 'open'],
  ] as const)('transitions %j → %s', (states, expected) => {
    const log = states.map((s, i) => entry(i + 1, 'a', s))
    expect(currentWorkflow(log, 'a').state).toBe(expected)
  })

  it('keeps Open, In progress and Deferred outstanding; Completed and Not applicable close the item', () => {
    expect(isOutstanding('open')).toBe(true)
    expect(isOutstanding('in-progress')).toBe(true)
    expect(isOutstanding('deferred')).toBe(true)
    expect(isOutstanding('completed')).toBe(false)
    expect(isOutstanding('not-applicable')).toBe(false)
  })

  it('offers every state except the current one', () => {
    expect(nextWorkflowStates('open')).toEqual(['in-progress', 'completed', 'deferred', 'not-applicable'])
    expect(nextWorkflowStates('completed')).toEqual(['open', 'in-progress', 'deferred', 'not-applicable'])
  })
})
