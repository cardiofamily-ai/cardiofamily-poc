import { DEMO_TODAY } from '@/data/demo-config'
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import { buildCaseload } from './caseload'
import { buildRelativeProfile } from './relative-profile'

const caseload = buildCaseload(SYNTHETIC_FAMILIES, { today: DEMO_TODAY, acknowledgedReclassificationIds: [] })
const family = (id: string) => caseload.families.find((f) => f.snapshot.family.id === id)!
const profile = (familyId: string, personId: string) => buildRelativeProfile(family(familyId), personId)!

describe('relative profile read model', () => {
  it('builds a profile for every person in every family', () => {
    for (const f of caseload.families) {
      for (const p of f.snapshot.people) expect(buildRelativeProfile(f, p.id)?.summary.person.id).toBe(p.id)
    }
  })

  it('returns undefined for an unknown person', () => {
    expect(buildRelativeProfile(family('fam-janssens'), 'nobody')).toBeUndefined()
  })

  it.each([
    ['fam-janssens', 'p-janssens-pieter', 'DEMO-R-003'],
    ['fam-janssens', 'p-janssens-mila', 'DEMO-R-002'],
    ['fam-janssens', 'p-janssens-eline', 'DEMO-R-001'],
    ['fam-janssens', 'p-janssens-sarah', undefined],
    ['fam-peeters', 'p-peeters-bram', 'DEMO-R-003'],
    ['fam-peeters', 'p-peeters-maria', 'DEMO-R-006'],
    // Reclassification review shown ahead of the routine VUS review (display priority only)
    ['fam-peeters', 'p-peeters-koen', 'DEMO-R-006'],
  ])('%s %s: next action %s', (f, p, rule) => {
    expect(profile(f, p).nextAction?.ruleId).toBe(rule)
  })

  it('lists histories newest first', () => {
    const sarah = profile('fam-janssens', 'p-janssens-sarah')
    expect(sarah.assessments.map((a) => a.date)).toEqual(['2026-04-20', '2024-11-05'])
    expect(sarah.tests.map((t) => t.kind)).toEqual(['diagnostic'])
    expect(sarah.plans).toHaveLength(1)
  })

  it('attaches pending reclassification impact only to affected people', () => {
    expect(profile('fam-peeters', 'p-peeters-hilde').pendingImpacts[0]!.reasons.map((r) => r.kind)).toEqual([
      'action-raised',
      'surveillance-plan',
    ])
    expect(profile('fam-peeters', 'p-peeters-sofie').pendingImpacts).toEqual([])
    expect(profile('fam-janssens', 'p-janssens-pieter').pendingImpacts).toEqual([])
  })
})

describe('primaryAction (display priority)', () => {
  it('keeps dated items first', () => {
    expect(profile('fam-peeters', 'p-peeters-bram').nextAction?.ruleId).toBe('DEMO-R-003')
  })
  it('does not reorder the engine output', () => {
    expect(profile('fam-peeters', 'p-peeters-koen').actions.map((a) => a.ruleId)).toEqual(['DEMO-R-005', 'DEMO-R-006'])
  })
})
