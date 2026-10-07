import { isoDateToUtcDate, type IsoDate } from '@/domain/time'

const displayDateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** e.g. "1 Oct 2026" */
export function formatDisplayDate(date: IsoDate): string {
  return displayDateFormat.format(isoDateToUtcDate(date))
}
