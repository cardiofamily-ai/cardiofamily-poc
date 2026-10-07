import { deepFreeze, miniFamily, TODAY, VARIANT_ID } from '@/domain/__fixtures__/mini-family'
import { evaluateFamilyActions } from '@/domain/actions/engine'
import { toIsoDate as d } from '@/domain/time'
import { applyReclassifications, assessReclassificationImpact, pendingReclassifications } from './impact'
import type { ReclassificationEvent } from './types'

const event: ReclassificationEvent = {
  id: 'rc-1',
  familyId: 'fam-mini',
  variantId: VARIANT_ID,
  previousInterpretationId: 'int-1',
  newInterpretation: {
    id: 'int-2', variantId: VARIANT_ID, classification: 'likely-pathogenic',
    effectiveDate: d('2026-09-20'), laboratory: 'Test lab (fictional)', reportReference: 'SYN-T-2',
  },
  receivedDate: d('2026-09-24'),
}

/** Mini family whose variant is a VUS, with a pending upgrade to LP. */
function vusFamily() {
  const base = miniFamily()
  return miniFamily({
    interpretations: [{ ...base.interpretations[0]!, classification: 'vus' }],
    surveillancePlans: [
      ...base.surveillancePlans,
      { id: 'sp-sib', personId: 'sibling', description: 'plan', status: 'active', nextDueDate: d('2026-12-01') },
    ],
    reclassificationEvents: [event],
  })
}

describe('reclassification impact', () => {
  it('reports pathway changes, surveillance plans and test results per person', () => {
    const impact = assessReclassificationImpact(vusFamily(), event, TODAY)
    expect(impact).toMatchObject({ eventId: 'rc-1', from: 'vus', to: 'likely-pathogenic' })

    const byPerson = Object.fromEntries(
      impact.affectedPeople.map((p) => [p.personId, p.reasons.map((r) => r.kind)]),
    )
    expect(byPerson).toEqual({
      grandpa: ['action-raised'],
      grandma: ['action-raised'],
      proband: ['action-resolved', 'surveillance-plan', 'test-result'],
      sibling: ['action-raised', 'surveillance-plan'],
      child: ['action-raised'],
      child2: ['action-raised'],
    })
  })

  it('does not modify the snapshot', () => {
    const snapshot = deepFreeze(vusFamily())
    expect(() => assessReclassificationImpact(snapshot, event, TODAY)).not.toThrow()
    expect(snapshot.interpretations).toHaveLength(1)
  })

  it('applies a new interpretation only to a copy', () => {
    const snapshot = vusFamily()
    const applied = applyReclassifications(snapshot, [event])
    expect(applied.interpretations.map((i) => i.id)).toEqual(['int-1', 'int-2'])
    expect(snapshot.interpretations.map((i) => i.id)).toEqual(['int-1'])
  })

  it('ignores events received after today', () => {
    expect(pendingReclassifications(vusFamily(), [], d('2026-09-23'))).toEqual([])
    expect(pendingReclassifications(vusFamily(), [], TODAY)).toEqual([event])
    expect(pendingReclassifications(vusFamily(), ['rc-1'], TODAY)).toEqual([])
  })
})

describe('DEMO-R-006 within the engine', () => {
  it('holds pathway changes behind clinician review until acknowledged', () => {
    const pending = evaluateFamilyActions(vusFamily(), { today: TODAY })
    expect(pending.filter((a) => a.ruleId === 'DEMO-R-006').map((a) => a.personId).toSorted()).toEqual(
      ['child', 'child2', 'grandma', 'grandpa', 'proband', 'sibling'],
    )
    expect(pending.some((a) => a.ruleId === 'DEMO-R-001')).toBe(false)
    expect(pending.some((a) => a.ruleId === 'DEMO-R-005')).toBe(true)

    const acknowledged = evaluateFamilyActions(vusFamily(), {
      today: TODAY,
      acknowledgedReclassificationIds: ['rc-1'],
    })
    expect(acknowledged.some((a) => a.ruleId === 'DEMO-R-006')).toBe(false)
    expect(acknowledged.some((a) => a.ruleId === 'DEMO-R-005')).toBe(false)
    expect(acknowledged.filter((a) => a.ruleId === 'DEMO-R-001')).toHaveLength(5)
  })

  it('cites the event and each impact reason as evidence', () => {
    const action = evaluateFamilyActions(vusFamily(), { today: TODAY }).find(
      (a) => a.id === 'DEMO-R-006:sibling:rc-1',
    )
    expect(action?.why.evidence.map((e) => e.source.kind)).toEqual([
      'reclassification-event',
      'variant-interpretation',
      'action',
      'surveillance-plan',
    ])
  })
})
