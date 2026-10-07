/**
 * Golden tests for the demonstration story. If a seed or rule change alters
 * what the demo shows, these fail and the change must be made deliberately.
 */
import { DEMO_TODAY } from '@/data/demo-config'
import { evaluateFamilyActions } from '@/domain/actions/engine'
import type { FamilyAction } from '@/domain/actions/types'
import { summarisePerson } from '@/domain/person-summary'
import { assessReclassificationImpact } from '@/domain/reclassification/impact'
import type { FamilySnapshot } from '@/domain/snapshot'
import { ageOn } from '@/domain/time'
import { SYNTHETIC_FAMILIES } from '.'
import { duboisFamily, maesFamily, woutersFamily } from './dashboard-families'
import { janssensFamily } from './janssens'
import { peetersFamily } from './peeters'

const today = DEMO_TODAY
const brief = (a: FamilyAction) =>
  `${a.ruleId} ${a.personId} ${a.when.kind === 'due' ? `${a.when.dueState} ${a.when.dueDate}` : 'unscheduled'}`

function statusTable(s: FamilySnapshot) {
  return Object.fromEntries(
    s.people.map((p) => {
      const summary = summarisePerson(s, p.id, today)
      return [
        p.givenName,
        [
          summary.relationshipToProband.label,
          summary.genotypes[0]!.status,
          summary.phenotype.status,
          summary.surveillance.state,
        ].join(' / '),
      ]
    }),
  )
}

describe('Janssens family (primary cascade-care story)', () => {
  it('derives the intended status for each relative', () => {
    expect(statusTable(janssensFamily)).toEqual({
      Marc: 'Father / positive / present / upcoming',
      Annick: 'Mother / negative / not-assessed / none',
      Pieter: 'Brother / positive / absent / overdue',
      Sarah: 'Self / positive / present / upcoming',
      Eline: 'Sister / untested / not-assessed / none',
      Jonas: 'Partner / untested / not-assessed / none',
      Lucas: 'Son / positive / absent / upcoming',
      Mila: 'Daughter / pending / absent / none',
    })
  })

  it('matches the demo-story ages', () => {
    const age = (id: string) => ageOn(janssensFamily.people.find((p) => p.id === id)!.dateOfBirth, today)
    expect(age('p-janssens-sarah')).toBe(42)
    expect(age('p-janssens-lucas')).toBeLessThan(18)
    expect(age('p-janssens-mila')).toBeLessThan(18)
  })

  it('raises exactly the expected actions', () => {
    expect(evaluateFamilyActions(janssensFamily, { today }).map(brief)).toEqual([
      'DEMO-R-003 p-janssens-pieter overdue 2026-06-30',
      'DEMO-R-002 p-janssens-mila upcoming 2026-10-14',
      'DEMO-R-001 p-janssens-eline unscheduled',
    ])
  })

  it('explains Eline’s cascade-testing action with traceable evidence', () => {
    const action = evaluateFamilyActions(janssensFamily, { today }).find((a) => a.ruleId === 'DEMO-R-001')!
    const recordIds = new Set([
      ...janssensFamily.people.map((p) => p.id),
      ...janssensFamily.interpretations.map((i) => i.id),
      ...janssensFamily.geneticTests.map((t) => t.id),
    ])
    for (const e of action.why.evidence) expect(recordIds.has(e.source.id)).toBe(true)
    expect(action.why.evidence.map((e) => e.statement)).toContain(
      'Sister of Sarah Janssens (proband), who is genotype positive.',
    )
  })
})

describe('Peeters family (reclassification story)', () => {
  const event = peetersFamily.reclassificationEvents[0]!

  it('starts with a VUS and relatives on clinical screening only', () => {
    expect(statusTable(peetersFamily)).toEqual({
      Jozef: 'Father / untested / not-assessed / none',
      Maria: 'Mother / untested / absent / none',
      Hilde: 'Sister / untested / absent / upcoming',
      Koen: 'Self / positive / present / upcoming',
      Sofie: 'Partner / untested / not-assessed / none',
      Bram: 'Son / untested / absent / overdue',
      Lotte: 'Daughter / untested / absent / upcoming',
    })
  })

  it('before acknowledgement: raises DEMO-R-006 reviews instead of changing pathways', () => {
    expect(evaluateFamilyActions(peetersFamily, { today }).map(brief)).toEqual([
      'DEMO-R-003 p-peeters-bram overdue 2026-05-27',
      'DEMO-R-005 p-peeters-koen unscheduled',
      'DEMO-R-006 p-peeters-bram unscheduled',
      'DEMO-R-006 p-peeters-hilde unscheduled',
      'DEMO-R-006 p-peeters-koen unscheduled',
      'DEMO-R-006 p-peeters-lotte unscheduled',
      'DEMO-R-006 p-peeters-maria unscheduled',
    ])
  })

  it('after acknowledgement: cascade testing is considered for first-degree relatives', () => {
    expect(
      evaluateFamilyActions(peetersFamily, { today, acknowledgedReclassificationIds: [event.id] }).map(brief),
    ).toEqual([
      'DEMO-R-003 p-peeters-bram overdue 2026-05-27',
      'DEMO-R-001 p-peeters-bram unscheduled',
      'DEMO-R-001 p-peeters-hilde unscheduled',
      'DEMO-R-001 p-peeters-lotte unscheduled',
      'DEMO-R-001 p-peeters-maria unscheduled',
    ])
  })

  it('identifies the affected relatives and why', () => {
    const impact = assessReclassificationImpact(peetersFamily, event, today)
    expect(impact.from).toBe('vus')
    expect(impact.to).toBe('likely-pathogenic')
    expect(
      Object.fromEntries(impact.affectedPeople.map((p) => [p.personId, p.reasons.map((r) => r.kind)])),
    ).toEqual({
      'p-peeters-maria': ['action-raised'],
      'p-peeters-hilde': ['action-raised', 'surveillance-plan'],
      'p-peeters-koen': ['action-resolved', 'surveillance-plan', 'test-result'],
      'p-peeters-bram': ['action-raised', 'surveillance-plan'],
      'p-peeters-lotte': ['action-raised', 'surveillance-plan'],
    })
  })

  it('excludes the deceased father and the partner from impact', () => {
    const affected = assessReclassificationImpact(peetersFamily, event, today).affectedPeople.map((p) => p.personId)
    expect(affected).not.toContain('p-peeters-jozef')
    expect(affected).not.toContain('p-peeters-sofie')
  })
})

describe('dashboard families', () => {
  it('Maes: untested child and a carrier without a surveillance plan', () => {
    expect(evaluateFamilyActions(maesFamily, { today }).map(brief)).toEqual([
      'DEMO-R-001 p-maes-wout unscheduled',
      'DEMO-R-004 p-maes-fien unscheduled',
    ])
  })

  it('Dubois: overdue surveillance and an overdue pending result', () => {
    expect(evaluateFamilyActions(duboisFamily, { today }).map(brief)).toEqual([
      'DEMO-R-003 p-dubois-thomas overdue 2026-03-03',
      'DEMO-R-002 p-dubois-claire overdue 2026-09-08',
    ])
  })

  it('Wouters: no open actions', () => {
    expect(evaluateFamilyActions(woutersFamily, { today })).toEqual([])
  })
})

describe('whole dataset', () => {
  it('exercises every demonstration rule at least once', () => {
    const rules = new Set(
      SYNTHETIC_FAMILIES.flatMap((s) => evaluateFamilyActions(s, { today })).map((a) => a.ruleId),
    )
    expect([...rules].toSorted()).toEqual([
      'DEMO-R-001', 'DEMO-R-002', 'DEMO-R-003', 'DEMO-R-004', 'DEMO-R-005', 'DEMO-R-006',
    ])
  })

  it('cites only records that exist in the family', () => {
    for (const s of SYNTHETIC_FAMILIES) {
      const known = new Set([
        ...s.people.map((p) => p.id),
        ...s.interpretations.map((i) => i.id),
        ...s.reclassificationEvents.flatMap((e) => [e.id, e.newInterpretation.id]),
        ...s.geneticTests.map((t) => t.id),
        ...s.phenotypeAssessments.map((a) => a.id),
        ...s.surveillancePlans.map((p) => p.id),
      ])
      const actions = evaluateFamilyActions(s, { today })
      const acknowledged = evaluateFamilyActions(s, {
        today,
        acknowledgedReclassificationIds: s.reclassificationEvents.map((e) => e.id),
      })
      for (const action of [...actions, ...acknowledged]) {
        for (const e of action.why.evidence) {
          // 'action' evidence refers to a hypothetical post-reclassification action.
          if (e.source.kind !== 'action') expect(known.has(e.source.id), `${action.id} → ${e.source.id}`).toBe(true)
        }
      }
    }
  })
})
