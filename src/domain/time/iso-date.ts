/**
 * Calendar dates are carried as ISO `YYYY-MM-DD` strings rather than `Date`
 * objects. Clinical dates in this POC are day-precision, and plain strings
 * avoid time-zone drift and compare correctly with `<` / `>`.
 */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function dateParts(value: string): [number, number, number] | null {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function isIsoDate(value: string): value is IsoDate {
  const parts = dateParts(value)
  if (!parts) return false
  const [year, month, day] = parts
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

/** Age in completed years on a given date. */
export function ageOn(dateOfBirth: IsoDate, on: IsoDate): number {
  const [birthYear, birthMonth, birthDay] = dateParts(dateOfBirth) as [number, number, number]
  const [year, month, day] = dateParts(on) as [number, number, number]
  const hadBirthday = month > birthMonth || (month === birthMonth && day >= birthDay)
  return year - birthYear - (hadBirthday ? 0 : 1)
}

/**
 * A seeded due date before today is overdue; today or later is upcoming.
 * This is workflow logic only: due dates come from seed data, never from
 * clinical intervals encoded here.
 */
export type DueState = 'overdue' | 'upcoming'

export function dueStateOn(dueDate: IsoDate, today: IsoDate): DueState {
  return dueDate < today ? 'overdue' : 'upcoming'
}
