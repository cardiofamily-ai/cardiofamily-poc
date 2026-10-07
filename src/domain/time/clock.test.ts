import { createFixedClock } from './clock'
import { toIsoDate } from './iso-date'

describe('createFixedClock', () => {
  it('always returns the configured date, regardless of system time', () => {
    vi.useFakeTimers()
    try {
      const clock = createFixedClock(toIsoDate('2026-10-01'))
      vi.setSystemTime(new Date('2031-05-17T12:00:00Z'))
      expect(clock.today()).toBe('2026-10-01')
    } finally {
      vi.useRealTimers()
    }
  })
})
