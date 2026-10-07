/**
 * Clinician review workflow over the Peeters reclassification: review
 * decisions change only the demonstration read model, never the seed data.
 */
import { DEMO_TODAY } from '@/data/demo-config'
import { SYNTHETIC_FAMILIES } from '@/data/synthetic'
import type { ReviewEntry, ReviewStatus } from '@/domain/review'
import { buildCaseload, buildFamilyOverview } from './caseload'

const peeters = SYNTHETIC_FAMILIES.find((s) => s.family.id === 'fam-peeters')!
const entry = (n: number, status: ReviewStatus, note?: string): ReviewEntry => ({
  id: `rev-${n}`, subjectId: 'rc-peeters-1', subjectKind: 'reclassification-event', status,
  reviewer: 'Demo Clinician (fictional)', date: DEMO_TODAY, ...(note ? { note } : {}),
})
const overview = (reviews: ReviewEntry[]) => buildFamilyOverview(peeters, { today: DEMO_TODAY, reviews })
const rules = (reviews: ReviewEntry[]) => overview(reviews).actions.map((a) => `${a.ruleId} ${a.personId.replace('p-peeters-', '')}`)

describe('reclassification review workflow', () => {
  it('pending: impact review items are open and the workflow is unchanged', () => {
    const o = overview([])
    expect(o.reclassifications[0]!.review.status).toBe('pending-clinician-review')
    expect(o.interpretation.classification).toBe('vus')
    expect(rules([])).toEqual([
      'DEMO-R-003 bram', 'DEMO-R-005 koen', 'DEMO-R-006 bram', 'DEMO-R-006 hilde',
      'DEMO-R-006 koen', 'DEMO-R-006 lotte', 'DEMO-R-006 maria',
    ])
  })

  it('deferred: workflow unchanged; impact review stays open with Deferred status', () => {
    const o = overview([entry(1, 'deferred', 'MDT')])
    expect(o.interpretation.classification).toBe('vus')
    expect(o.pendingReclassifications).toHaveLength(1)
    expect(rules([entry(1, 'deferred')])).toEqual(rules([]))
    const r006 = o.actions.filter((a) => a.ruleId === 'DEMO-R-006')
    expect(r006.every((a) => o.actionReviewStatus[a.id] === 'deferred')).toBe(true)
  })

  it('reviewed: the new classification is applied and resulting items await clinician review', () => {
    const o = overview([entry(1, 'reviewed')])
    expect(o.interpretation.classification).toBe('likely-pathogenic')
    expect(o.pendingReclassifications).toEqual([])
    expect(rules([entry(1, 'reviewed')])).toEqual([
      'DEMO-R-003 bram', 'DEMO-R-001 bram', 'DEMO-R-001 hilde', 'DEMO-R-001 lotte', 'DEMO-R-001 maria',
    ])
    for (const a of o.actions) expect(a.status).toBe('pending-clinician-review')
    expect(o.relativeStatuses['p-peeters-koen']!.category).toBe('genotype-positive-phenotype-positive')
  })

  it('reviewed: the impact still reports what changed, relative to the previous classification', () => {
    const impact = overview([entry(1, 'reviewed')]).reclassifications[0]!.impact
    expect(impact.from).toBe('vus')
    expect(impact.affectedPeople).toHaveLength(5)
  })

  it('not applicable: workflow unchanged and impact review items closed', () => {
    const o = overview([entry(1, 'not-applicable')])
    expect(o.interpretation.classification).toBe('vus')
    expect(o.pendingReclassifications).toEqual([])
    expect(rules([entry(1, 'not-applicable')])).toEqual(['DEMO-R-003 bram', 'DEMO-R-005 koen'])
    expect(o.closedActions.map((a) => a.ruleId)).toEqual(Array(5).fill('DEMO-R-006'))
  })

  it('returning to pending restores the original state', () => {
    expect(rules([entry(1, 'reviewed'), entry(2, 'pending-clinician-review')])).toEqual(rules([]))
  })

  it('updates caseload totals', () => {
    const totals = (reviews: ReviewEntry[]) => buildCaseload(SYNTHETIC_FAMILIES, { today: DEMO_TODAY, reviews }).totals
    expect(totals([])).toMatchObject({ openActions: 14, reclassificationReviews: 5, cascadeTestingActions: 4 })
    expect(totals([entry(1, 'reviewed')])).toMatchObject({ openActions: 12, reclassificationReviews: 0, cascadeTestingActions: 8 })
    expect(totals([entry(1, 'not-applicable')])).toMatchObject({ openActions: 9, reclassificationReviews: 0 })
  })

  it('never modifies the synthetic seed data', () => {
    const before = structuredClone(peeters)
    overview([entry(1, 'reviewed', 'note')])
    overview([entry(1, 'not-applicable')])
    expect(peeters).toEqual(before)
  })
})
