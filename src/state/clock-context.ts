import { createContext, useContext } from 'react'
import type { Clock } from '@/domain/time'

export const ClockContext = createContext<Clock | null>(null)

export function useClock(): Clock {
  const clock = useContext(ClockContext)
  if (!clock) throw new Error('useClock must be used within <ClockProvider>')
  return clock
}
