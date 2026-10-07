import { miniFamily, TODAY, VARIANT_ID } from '@/domain/__fixtures__/mini-family'
import { toIsoDate as d } from '@/domain/time'
import { evaluateFamilyActions } from './engine'

const actions = (snapshot = miniFamily()) => evaluateFamilyActions(snapshot, { today: TODAY })
const ids = (snapshot = miniFamily()) => actions(snapshot).map((a) => a.id)
const resulted = (id: string, personId: string, outcome: 'detected' | 'not-detected') => ({
  id, personId, variantId: VARIANT_ID, kind: 'cascade' as const, requestedDate: d('2025-02-01'),
  status: 'resulted' as const, resultDate: d('2025-03-01'), outcome,
})
const base = miniFamily()

describe('DEMO-R-001 cascade testing consideration', () => {
  it('is raised for untested first-degree blood relatives of a P/LP carrier', () => {
    expect(ids()).toEqual(
      expect.arrayContaining([
        'DEMO-R-001:grandpa:var-mini',
        'DEMO-R-001:grandma:var-mini',
        'DEMO-R-001:sibling:var-mini',
        'DEMO-R-001:child:var-mini',
        'DEMO-R-001:child2:var-mini',
      ]),
    )
  })

  it('is not raised for a parent who married in, even when first-degree to a carrier child', () => {
    const snapshot = miniFamily({ geneticTests: [...base.geneticTests, resulted('gt-child', 'child', 'detected')] })
    expect(ids(snapshot)).not.toContain('DEMO-R-001:partner:var-mini')
  })

  it('is not raised for second-degree relatives', () => {
    // The only carrier is 'child': grandparents and uncle are second-degree to them;
    // both parents and the sibling are first-degree.
    const snapshot = miniFamily({
      family: { ...base.family, probandId: 'child' },
      geneticTests: [resulted('gt-child', 'child', 'detected')],
    })
    expect(ids(snapshot).filter((id) => id.startsWith('DEMO-R-001')).toSorted()).toEqual([
      'DEMO-R-001:child2:var-mini',
      'DEMO-R-001:partner:var-mini',
      'DEMO-R-001:proband:var-mini',
    ])
  })

  it('is not raised once any test is recorded', () => {
    const snapshot = miniFamily({
      geneticTests: [
        ...base.geneticTests,
        resulted('gt-sib', 'sibling', 'not-detected'),
        { id: 'gt-gm', personId: 'grandma', variantId: VARIANT_ID, kind: 'cascade', requestedDate: d('2026-01-01'), status: 'declined' },
      ],
    })
    expect(ids(snapshot)).not.toContain('DEMO-R-001:sibling:var-mini')
    expect(ids(snapshot)).not.toContain('DEMO-R-001:grandma:var-mini')
  })

  it('is not raised for deceased relatives', () => {
    const snapshot = miniFamily({
      people: base.people.map((p) => (p.id === 'grandpa' ? { ...p, deceasedDate: d('2020-01-01') } : p)),
    })
    expect(ids(snapshot)).not.toContain('DEMO-R-001:grandpa:var-mini')
  })

  it('is not raised when the variant is a VUS', () => {
    const snapshot = miniFamily({ interpretations: [{ ...base.interpretations[0]!, classification: 'vus' }] })
    expect(ids(snapshot).some((id) => id.startsWith('DEMO-R-001'))).toBe(false)
  })
})

describe('DEMO-R-002 pending cascade test follow-up', () => {
  const pending = (expectedResultDate?: string) =>
    miniFamily({
      geneticTests: [
        ...base.geneticTests,
        {
          id: 'gt-sib', personId: 'sibling', variantId: VARIANT_ID, kind: 'cascade',
          requestedDate: d('2026-09-01'), status: 'sample-pending',
          ...(expectedResultDate ? { expectedResultDate: d(expectedResultDate) } : {}),
        },
      ],
    })
  const r002 = (snapshot: ReturnType<typeof miniFamily>) =>
    actions(snapshot).find((a) => a.id === 'DEMO-R-002:sibling:gt-sib')

  it('uses the seeded expected result date as the due date', () => {
    expect(r002(pending('2026-10-14'))?.when).toEqual({ kind: 'due', dueDate: '2026-10-14', dueState: 'upcoming' })
    expect(r002(pending('2026-09-08'))?.when).toEqual({ kind: 'due', dueDate: '2026-09-08', dueState: 'overdue' })
  })

  it('is unscheduled when no expected date is recorded', () => {
    expect(r002(pending())?.when).toEqual({ kind: 'unscheduled' })
  })

  it('replaces DEMO-R-001 for that person', () => {
    expect(ids(pending())).not.toContain('DEMO-R-001:sibling:var-mini')
  })
})

describe('DEMO-R-003 overdue surveillance', () => {
  const withPlan = (nextDueDate: string, status: 'active' | 'ended' = 'active') =>
    miniFamily({
      surveillancePlans: [...base.surveillancePlans, { id: 'sp-sib', personId: 'sibling', description: 'plan', status, nextDueDate: d(nextDueDate) }],
    })

  it('is raised when an active plan’s seeded due date is before the demo date', () => {
    const action = actions(withPlan('2026-06-30')).find((a) => a.ruleId === 'DEMO-R-003')
    expect(action?.id).toBe('DEMO-R-003:sibling:sp-sib')
    expect(action?.when).toEqual({ kind: 'due', dueDate: '2026-06-30', dueState: 'overdue' })
  })

  it('is not raised for upcoming or ended plans', () => {
    expect(ids(withPlan('2026-10-01')).some((id) => id.startsWith('DEMO-R-003'))).toBe(false)
    expect(ids(withPlan('2026-06-30', 'ended')).some((id) => id.startsWith('DEMO-R-003'))).toBe(false)
  })
})

describe('DEMO-R-004 genotype-positive without surveillance plan', () => {
  it('is raised for a P/LP carrier with no active plan', () => {
    expect(ids(miniFamily({ surveillancePlans: [] }))).toContain('DEMO-R-004:proband:var-mini')
  })

  it('is not raised when an active plan exists', () => {
    expect(ids()).not.toContain('DEMO-R-004:proband:var-mini')
  })
})

describe('DEMO-R-005 variant of uncertain significance', () => {
  it('is raised for carriers of a VUS', () => {
    const snapshot = miniFamily({ interpretations: [{ ...base.interpretations[0]!, classification: 'vus' }] })
    expect(ids(snapshot)).toContain('DEMO-R-005:proband:var-mini')
  })

  it('is not raised for P/LP variants', () => {
    expect(ids().some((id) => id.startsWith('DEMO-R-005'))).toBe(false)
  })
})
