import type { IsoDate } from './iso-date'

/**
 * Source of "today" for all due / overdue logic. Nothing reads the system
 * time: callers take today from the Clock and pass it into pure domain
 * functions, so the demonstration stays deterministic.
 */
export interface Clock {
  today(): IsoDate
}

export function createFixedClock(today: IsoDate): Clock {
  return { today: () => today }
}
