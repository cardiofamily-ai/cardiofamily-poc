import { miniFamily, TODAY, VARIANT_ID } from '@/domain/__fixtures__/mini-family'
import type { Classification } from '@/domain/genetics/types'
import { summarisePerson } from '@/domain/person-summary'
import type { FamilySnapshot } from '@/domain/snapshot'
import { toIsoDate as d } from '@/domain/time'
import { categoriseRelative } from './relative-status'

const base = miniFamily()
const common = (personId: string) => ({
  id: `gt-${personId}`, personId, variantId: VARIANT_ID, kind: 'cascade' as const, requestedDate: d('2025-02-01'),
})
const snapshot = miniFamily({
  geneticTests: [
    ...base.geneticTests,
    { ...common('sibling'), status: 'resulted', resultDate: d('2025-03-01'), outcome: 'not-detected' },
    { ...common('child'), status: 'sample-pending' },
    { ...common('child2'), status: 'resulted', resultDate: d('2025-03-01'), outcome: 'detected' },
    { ...common('grandma'), status: 'declined' },
  ],
  phenotypeAssessments: [
    { id: 'ph-1', personId: 'proband', date: d('2025-01-10'), modality: 'echocardiogram', finding: 'present' },
    { id: 'ph-2', personId: 'child2', date: d('2025-04-01'), modality: 'echocardiogram', finding: 'absent' },
  ],
})
const categorise = (id: string, classification: Classification = 'pathogenic', s: FamilySnapshot = snapshot) =>
  categoriseRelative(summarisePerson(s, id, TODAY), VARIANT_ID, classification)

describe('categoriseRelative', () => {
  it.each([
    ['proband', 'genotype-positive-phenotype-positive'],
    ['child2', 'genotype-positive-no-phenotype'],
    ['grandpa', 'at-risk-not-tested'],
    ['grandma', 'at-risk-testing-declined'],
    ['child', 'at-risk-result-pending'],
    ['sibling', 'familial-variant-not-detected'],
    ['partner', 'not-blood-relative'],
  ])('%s → %s', (id, category) => {
    expect(categorise(id).category).toBe(category)
  })

  it('uses the VUS category for a genotype-positive person when the variant is a VUS', () => {
    expect(categorise('proband', 'vus').category).toBe('vus-detected')
    expect(categorise('child2', 'vus').category).toBe('vus-detected')
  })

  it('does not categorise a genotype-positive person when the variant is (likely) benign', () => {
    expect(categorise('proband', 'benign').category).toBe('not-categorised')
  })

  it('does not categorise deceased relatives', () => {
    const withDeath = miniFamily({
      people: base.people.map((p) => (p.id === 'grandpa' ? { ...p, deceasedDate: d('2020-05-05') } : p)),
    })
    expect(categorise('grandpa', 'pathogenic', withDeath).category).toBe('not-categorised')
  })

  it('explains the categorisation using recorded facts only', () => {
    expect(categorise('child2').basis).toEqual([
      'Son of the proband (first-degree relative).',
      'Last acknowledged classification of the familial variant: Pathogenic.',
      'Familial variant detected (result 2025-03-01).',
      'No phenotype recorded (latest assessment 2025-04-01).',
    ])
    expect(categorise('partner').basis).toEqual(['Father of child and child2; not a blood relative of the proband.'])
  })

  it('never produces numbers that could read as a risk estimate', () => {
    for (const id of ['proband', 'child', 'child2', 'grandpa', 'sibling']) {
      for (const line of categorise(id).basis) expect(line).not.toMatch(/%|percent|probab|penetran|likelihood/i)
    }
  })
})
