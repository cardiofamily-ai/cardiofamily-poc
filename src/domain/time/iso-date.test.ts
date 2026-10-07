import { ageOn, compareIsoDate, daysBetween, dueStateOn, isIsoDate, toIsoDate } from './iso-date'

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

describe('ageOn', () => {
  it.each([
    ['1984-05-12', '2026-10-01', 42],
    ['1984-10-01', '2026-10-01', 42],
    ['1984-10-02', '2026-10-01', 41],
    ['2024-02-29', '2025-02-28', 0],
  ])('born %s is aged %i on %s', (dob, on, age) => {
    expect(ageOn(toIsoDate(dob), toIsoDate(on))).toBe(age)
  })
})

describe('dueStateOn', () => {
  const today = toIsoDate('2026-10-01')
  it('treats dates before today as overdue', () => {
    expect(dueStateOn(toIsoDate('2026-09-30'), today)).toBe('overdue')
  })
  it('treats today and later as upcoming', () => {
    expect(dueStateOn(today, today)).toBe('upcoming')
    expect(dueStateOn(toIsoDate('2026-10-02'), today)).toBe('upcoming')
  })
})

describe('daysBetween', () => {
  it('counts calendar days in either direction', () => {
    expect(daysBetween(toIsoDate('2026-06-30'), toIsoDate('2026-10-01'))).toBe(93)
    expect(daysBetween(toIsoDate('2026-10-01'), toIsoDate('2026-10-14'))).toBe(13)
    expect(daysBetween(toIsoDate('2026-10-01'), toIsoDate('2026-10-01'))).toBe(0)
    expect(daysBetween(toIsoDate('2026-03-29'), toIsoDate('2026-03-30'))).toBe(1)
  })
})
