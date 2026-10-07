import { toIsoDate as d } from '@/domain/time'
import { acknowledgedReclassificationIds, currentReview, isOpenReviewStatus, type ReviewEntry, type ReviewStatus } from './review'

const entry = (n: number, subjectId: string, status: ReviewStatus, note?: string): ReviewEntry => ({
  id: `rev-${n}`, subjectId, subjectKind: 'reclassification-event', status, reviewer: 'Demo Clinician (fictional)',
  date: d('2026-10-01'), ...(note ? { note } : {}),
})

describe('clinician review records', () => {
  it('is pending with no entries', () => {
    expect(currentReview([], 'rc-1')).toEqual({ status: 'pending-clinician-review', history: [] })
  })

  it('uses the latest entry and keeps the full history', () => {
    const log = [entry(1, 'rc-1', 'deferred', 'Discuss at MDT'), entry(2, 'rc-2', 'reviewed'), entry(3, 'rc-1', 'reviewed')]
    const review = currentReview(log, 'rc-1')
    expect(review.status).toBe('reviewed')
    expect(review.latest?.id).toBe('rev-3')
    expect(review.history.map((e) => e.id)).toEqual(['rev-1', 'rev-3'])
  })

  it('can return an item to pending', () => {
    const log = [entry(1, 'rc-1', 'reviewed'), entry(2, 'rc-1', 'pending-clinician-review')]
    expect(currentReview(log, 'rc-1').status).toBe('pending-clinician-review')
  })

  it('acknowledges only events whose current decision is Reviewed', () => {
    const log = [entry(1, 'a', 'reviewed'), entry(2, 'b', 'deferred'), entry(3, 'c', 'not-applicable'), entry(4, 'd', 'reviewed'), entry(5, 'd', 'pending-clinician-review')]
    expect(acknowledgedReclassificationIds(log, ['a', 'b', 'c', 'd', 'e'])).toEqual(['a'])
  })

  it('treats pending and deferred as still open', () => {
    expect(isOpenReviewStatus('pending-clinician-review')).toBe(true)
    expect(isOpenReviewStatus('deferred')).toBe(true)
    expect(isOpenReviewStatus('reviewed')).toBe(false)
    expect(isOpenReviewStatus('not-applicable')).toBe(false)
  })
})
