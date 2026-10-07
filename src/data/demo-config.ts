import { toIsoDate } from '@/domain/time'

/**
 * The frozen "today" of the demonstration. This is the ONLY place the demo
 * date is defined; everything else reads it through the Clock.
 */
export const DEMO_TODAY = toIsoDate('2026-10-01')
