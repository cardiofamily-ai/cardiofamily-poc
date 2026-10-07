import type { IsoDate } from './iso-date'

/**
 * Source of "today" for all due / overdue logic. Domain functions take a
 * Clock instead of reading the system time so the demonstration stays
 * deterministic.
 */
export interface Clock {
  today(): IsoDate
}

export function createFixedClock(today: IsoDate): Clock {
  return { today: () => today }
}
