/**
 * Calendar dates are carried as ISO `YYYY-MM-DD` strings rather than `Date`
 * objects. Clinical dates in this POC are day-precision, and plain strings
 * avoid time-zone drift and compare correctly with `<` / `>`.
 */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function isIsoDate(value: string): value is IsoDate {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return false
  const [, year, month, day] = match.map(Number) as [number, number, number, number]
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function toIsoDate(value: string): IsoDate {
  if (!isIsoDate(value)) {
    throw new Error(`Invalid ISO calendar date: "${value}"`)
  }
  return value
}

/** Negative if `a` is before `b`, positive if after, 0 if the same day. */
export function compareIsoDate(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** Midnight UTC for the given date; use only for display formatting. */
export function isoDateToUtcDate(date: IsoDate): Date {
  return new Date(`${date}T00:00:00Z`)
}
