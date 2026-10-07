/**
 * Action workflow over the Janssens family: workflow state changes the read
 * model only; seed data and engine output are untouched.
 */
import { DEMO_TODAY } from '@/data/demo-config'
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import type { ActionWorkflowEntry, ActionWorkflowState } from '@/domain/action-workflow'
import { buildCaseload } from './caseload'
import { buildRelativeProfile } from './relative-profile'
import { worklist } from './worklist'

const PIETER = 'DEMO-R-003:p-janssens-pieter:sp-janssens-pieter'
const ELINE = 'DEMO-R-001:p-janssens-eline:var-janssens-mybpc3'
const log = (...items: [string, ActionWorkflowState, string?][]): ActionWorkflowEntry[] =>
  items.map(([actionId, state, note], i) => ({
    id: `act-${i + 1}`, actionId, state, recordedBy: 'Demo Clinician (fictional)', date: DEMO_TODAY, ...(note ? { note } : {}),
  }))
const caseload = (actionLog: ActionWorkflowEntry[] = []) =>
  buildCaseload(SYNTHETIC_FAMILIES, { today: DEMO_TODAY, reviews: [], actionLog })
const janssens = (actionLog: ActionWorkflowEntry[] = []) =>
  caseload(actionLog).families.find((f) => f.snapshot.family.id === 'fam-janssens')!

describe('action workflow in the read model', () => {
  it('starts with every action Open', () => {
    const f = janssens()
    expect(f.actions.map((a) => f.actionWorkflow[a.id]!.state)).toEqual(['open', 'open', 'open'])
  })

  it('In progress remains outstanding and is counted separately', () => {
    const c = caseload(log([PIETER, 'in-progress']))
    expect(c.totals).toMatchObject({ openActions: 14, overdueActions: 4, inProgressActions: 1, deferredActions: 0 })
    expect(c.attention.find((i) => i.action.id === PIETER)).toBeDefined()
  })

  it('Deferred remains visible as unresolved', () => {
    const c = caseload(log([ELINE, 'deferred', 'Relative to be contacted next quarter']))
    expect(c.totals).toMatchObject({ openActions: 14, deferredActions: 1 })
    const f = c.families.find((x) => x.snapshot.family.id === 'fam-janssens')!
    expect(f.actions.map((a) => a.id)).toContain(ELINE)
    expect(f.actionWorkflow[ELINE]!.latest?.note).toBe('Relative to be contacted next quarter')
  })

  it.each(['completed', 'not-applicable'] as const)('%s closes the outstanding item without creating a new one', (state) => {
    const before = caseload()
    const after = caseload(log([PIETER, 'in-progress'], [PIETER, state]))
    expect(after.totals).toMatchObject({ openActions: 13, overdueActions: 3, inProgressActions: 0 })
    expect(after.attention.map((i) => i.action.id)).toEqual(before.attention.map((i) => i.action.id).filter((id) => id !== PIETER))
    const f = after.families.find((x) => x.snapshot.family.id === 'fam-janssens')!
    expect(f.closedActions.map((a) => a.id)).toEqual([PIETER])
    expect(f.peopleNeedingAttention).toBe(2)
    expect(f.overdueActions).toBe(0)
  })

  it('keeps an append-only history and can reopen', () => {
    const f = janssens(log([PIETER, 'in-progress'], [PIETER, 'completed', 'Recall letter sent'], [PIETER, 'open']))
    expect(f.actionWorkflow[PIETER]!.history.map((e) => e.state)).toEqual(['in-progress', 'completed', 'open'])
    expect(f.actions.map((a) => a.id)).toContain(PIETER)
  })

  it('exposes action history on the relative profile, including closed actions', () => {
    const f = janssens(log([PIETER, 'completed', 'Recall letter sent']))
    const profile = buildRelativeProfile(f, 'p-janssens-pieter')!
    expect(profile.actions).toEqual([])
    expect(profile.nextAction).toBeUndefined()
    expect(profile.actionHistory.map((h) => [h.action.id, h.history.map((e) => e.note)])).toEqual([[PIETER, ['Recall letter sent']]])
  })

  it('does not change surveillance plans, RISK or other derived state', () => {
    const before = janssens()
    const after = janssens(log([PIETER, 'completed']))
    expect(after.people).toEqual(before.people)
    expect(after.relativeStatuses).toEqual(before.relativeStatuses)
  })

  it('filters the worklist by workflow state', () => {
    const { counts } = worklist(caseload(log([PIETER, 'completed'], [ELINE, 'deferred'])), 'all')
    expect(counts).toEqual({ outstanding: 13, 'in-progress': 0, deferred: 1, closed: 1, all: 14 })
  })

  it('never modifies the synthetic seed data', () => {
    const seed = SYNTHETIC_FAMILIES.find((s) => s.family.id === 'fam-janssens')!
    const copy = structuredClone(seed)
    caseload(log([PIETER, 'completed'], [ELINE, 'not-applicable']))
    expect(seed).toEqual(copy)
  })
})
