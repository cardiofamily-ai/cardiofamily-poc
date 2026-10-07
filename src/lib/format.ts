import { isIsoDate, isoDateToUtcDate, type IsoDate } from '@/domain/time'

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

/** Replaces ISO dates inside generated text with display dates. */
export function formatDatesInText(text: string): string {
  return text.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (match) =>
    isIsoDate(match) ? formatDisplayDate(match) : match,
  )
}
