import { toIsoDate } from '@/domain/time'
import { formatDisplayDate } from './format'

describe('formatDisplayDate', () => {
  it('formats as day, short month, year', () => {
    expect(formatDisplayDate(toIsoDate('2026-10-01'))).toBe('1 Oct 2026')
  })
})
