import { useMemo, type ReactNode } from 'react'
import { DEMO_TODAY } from '@/data/demo-config'
import { createFixedClock, type IsoDate } from '@/domain/time'
import { ClockContext } from './clock-context'

interface ClockProviderProps {
  /** Override for tests; defaults to the configured demo date. */
  today?: IsoDate
  children: ReactNode
}

export function ClockProvider({ today = DEMO_TODAY, children }: ClockProviderProps) {
  const clock = useMemo(() => createFixedClock(today), [today])
  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>
}
