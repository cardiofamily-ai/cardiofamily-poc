import { deepFreeze, miniFamily, TODAY } from '@/domain/__fixtures__/mini-family'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import { toIsoDate as d } from '@/domain/time'
import { evaluateFamilyActions, sortActions } from './engine'
import { DEMO_RULES, ENGINE_VERSION } from './rules'

describe('Family Action Engine', () => {
  const snapshot = miniFamily({
    surveillancePlans: [
      { id: 'sp-a', personId: 'proband', description: 'plan', status: 'active', nextDueDate: d('2026-08-01') },
    ],
  })

  it('is deterministic', () => {
    expect(evaluateFamilyActions(snapshot, { today: TODAY })).toEqual(
      evaluateFamilyActions(snapshot, { today: TODAY }),
    )
  })

  it('never mutates its input', () => {
    const frozen = deepFreeze(miniFamily())
    expect(() => evaluateFamilyActions(frozen, { today: TODAY })).not.toThrow()
  })

  it('depends on the supplied date, not the system clock', () => {
    const before = evaluateFamilyActions(snapshot, { today: d('2026-07-01') })
    expect(before.some((a) => a.ruleId === 'DEMO-R-003')).toBe(false)
    expect(evaluateFamilyActions(snapshot, { today: TODAY }).some((a) => a.ruleId === 'DEMO-R-003')).toBe(true)
  })

  it('exposes rule, WHO/WHAT/WHEN/WHY, status and safety flags on every action', () => {
    const actions = evaluateFamilyActions(snapshot, { today: TODAY })
    expect(actions.length).toBeGreaterThan(0)
    for (const action of actions) {
      expect(DEMO_RULES[action.ruleId].version).toBe(action.ruleVersion)
      expect(action.engineVersion).toBe(ENGINE_VERSION)
      expect(snapshot.people.some((p) => p.id === action.personId)).toBe(true)
      expect(action.what).not.toBe('')
      expect(action.when.kind).toMatch(/due|unscheduled/)
      expect(action.why.summary).not.toBe('')
      expect(action.why.evidence.length).toBeGreaterThan(0)
      expect(action.status).toBe('pending-clinician-review')
      expect(action.demonstrationOnly).toBe(true)
      expect(action.requiresClinicianReview).toBe(true)
      expect(action.disclaimer).toBe(DEMO_ACTION_DISCLAIMER)
    }
  })

  it('produces unique action ids', () => {
    const ids = evaluateFamilyActions(snapshot, { today: TODAY }).map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('sorts overdue first, then upcoming by date, then unscheduled', () => {
    const actions = evaluateFamilyActions(snapshot, { today: TODAY })
    expect(sortActions(actions.toReversed())).toEqual(actions)
    const ranks = actions.map((a) => (a.when.kind === 'due' ? (a.when.dueState === 'overdue' ? 0 : 1) : 2))
    expect(ranks).toEqual(ranks.toSorted())
  })
})

describe('DEMO rule registry', () => {
  it('defines six synthetic, versioned rules', () => {
    const rules = Object.values(DEMO_RULES)
    expect(rules.map((r) => r.id)).toEqual([
      'DEMO-R-001', 'DEMO-R-002', 'DEMO-R-003', 'DEMO-R-004', 'DEMO-R-005', 'DEMO-R-006',
    ])
    for (const rule of rules) {
      expect(rule.version).toMatch(/^\d+\.\d+$/)
      expect(rule.notice).toMatch(/not clinically validated/)
      expect(rule.trigger.length).toBeGreaterThan(20)
    }
  })
})
