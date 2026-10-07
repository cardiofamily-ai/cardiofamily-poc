import { compareIsoDate, isIsoDate, toIsoDate } from './iso-date'

describe('IsoDate', () => {
  it.each(['2026-10-01', '2024-02-29', '1955-12-31'])('accepts %s', (value) => {
    expect(isIsoDate(value)).toBe(true)
  })

  it.each(['2026-02-29', '2026-13-01', '2026-10-1', '01/10/2026', '2026-10-01T00:00:00Z', ''])(
    'rejects %s',
    (value) => {
      expect(isIsoDate(value)).toBe(false)
    },
  )

  it('throws when constructing an invalid date', () => {
    expect(() => toIsoDate('2026-02-30')).toThrow(/Invalid ISO calendar date/)
  })

  it('orders dates chronologically', () => {
    const a = toIsoDate('2026-09-30')
    const b = toIsoDate('2026-10-01')
    expect(compareIsoDate(a, b)).toBeLessThan(0)
    expect(compareIsoDate(b, a)).toBeGreaterThan(0)
    expect(compareIsoDate(b, toIsoDate('2026-10-01'))).toBe(0)
  })
})
