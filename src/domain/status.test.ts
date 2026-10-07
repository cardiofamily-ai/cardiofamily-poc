import { phenotypeStatus } from '@/domain/phenotype/phenotype'
import { surveillanceStatus } from '@/domain/surveillance/surveillance'
import { toIsoDate as d } from '@/domain/time'

const today = d('2026-10-01')

describe('phenotypeStatus', () => {
  it('is not-assessed without assessments', () => {
    expect(phenotypeStatus([], 'p').status).toBe('not-assessed')
  })

  it('reflects the most recent recorded finding', () => {
    const summary = phenotypeStatus(
      [
        { id: 'a', personId: 'p', date: d('2024-01-01'), modality: 'echocardiogram', finding: 'absent' },
        { id: 'b', personId: 'p', date: d('2026-01-01'), modality: 'cardiac-mri', finding: 'present' },
      ],
      'p',
    )
    expect(summary.status).toBe('present')
    expect(summary.latest?.id).toBe('b')
  })
})

describe('surveillanceStatus', () => {
  const plan = (id: string, nextDueDate: string, status: 'active' | 'ended' = 'active') => ({
    id, personId: 'p', description: 'plan', status, nextDueDate: d(nextDueDate),
  })

  it('is none without an active plan', () => {
    expect(surveillanceStatus([plan('x', '2026-01-01', 'ended')], 'p', today).state).toBe('none')
  })

  it('is overdue when the seeded due date has passed', () => {
    expect(surveillanceStatus([plan('x', '2026-09-30')], 'p', today).state).toBe('overdue')
  })

  it('is upcoming when the seeded due date is today or later', () => {
    expect(surveillanceStatus([plan('x', '2026-10-01')], 'p', today).state).toBe('upcoming')
  })
})
