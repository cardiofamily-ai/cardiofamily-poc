import { toIsoDate } from '@/domain/time'
import { formatDatesInText, formatDisplayDate } from './format'

describe('formatDisplayDate', () => {
  it('formats as day, short month, year', () => {
    expect(formatDisplayDate(toIsoDate('2026-10-01'))).toBe('1 Oct 2026')
  })
})

describe('formatDatesInText', () => {
  it('formats ISO dates embedded in text and leaves other text alone', () => {
    expect(formatDatesInText('due 2026-06-30, ref SYN-LAB-2025-0142')).toBe('due 30 Jun 2026, ref SYN-LAB-2025-0142')
  })
})
