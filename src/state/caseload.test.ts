import { DEMO_TODAY } from '@/data/demo-config'
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import { buildCaseload, upcomingSurveillance } from './caseload'

const caseload = buildCaseload(SYNTHETIC_FAMILIES, { today: DEMO_TODAY, reviews: [] })

describe('caseload read model', () => {
  it('totals open work across the synthetic caseload', () => {
    expect(caseload.totals).toEqual({
      families: 5,
      familiesNeedingAttention: 4,
      openActions: 14,
      overdueActions: 4,
      cascadeTestingActions: 4,
      reclassificationReviews: 5,
    })
  })

  it('orders families by urgency', () => {
    expect(caseload.families.map((f) => f.snapshot.family.id)).toEqual([
      'fam-dubois', 'fam-peeters', 'fam-janssens', 'fam-maes', 'fam-wouters',
    ])
  })

  it('summarises each family', () => {
    const janssens = caseload.families.find((f) => f.snapshot.family.id === 'fam-janssens')!
    expect(janssens).toMatchObject({
      peopleNeedingAttention: 3,
      overdueActions: 1,
      cascadeTestingActions: 2,
      reclassificationReviews: 0,
    })
    expect(janssens.proband.id).toBe('p-janssens-sarah')
    expect(janssens.interpretation.classification).toBe('pathogenic')
    expect(janssens.pendingReclassifications).toEqual([])
  })

  it('exposes the pending Peeters reclassification with its impact', () => {
    const peeters = caseload.families.find((f) => f.snapshot.family.id === 'fam-peeters')!
    expect(peeters.interpretation.classification).toBe('vus')
    expect(peeters.pendingReclassifications).toHaveLength(1)
    expect(peeters.pendingReclassifications[0]!.impact.affectedPeople).toHaveLength(5)
  })

  it('lists attention items overdue first, joined to person and family', () => {
    const overdue = caseload.attention.filter(
      (i) => i.action.when.kind === 'due' && i.action.when.dueState === 'overdue',
    )
    expect(overdue.map((i) => i.person.person.givenName)).toEqual(['Thomas', 'Bram', 'Pieter', 'Claire'])
    expect(caseload.attention.slice(0, 4)).toEqual(overdue)
    for (const item of caseload.attention) expect(item.person.person.id).toBe(item.action.personId)
  })

  it('lists upcoming surveillance soonest first', () => {
    expect(upcomingSurveillance(caseload).slice(0, 3).map((u) => u.person.person.givenName)).toEqual([
      'Luc', 'Lucas', 'Koen',
    ])
  })

  it('does not change family actions compared with the engine', () => {
    const total = caseload.families.reduce((n, f) => n + f.actions.length, 0)
    expect(caseload.attention).toHaveLength(total)
  })
})
