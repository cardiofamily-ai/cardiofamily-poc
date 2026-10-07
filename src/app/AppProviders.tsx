import type { ReactNode } from 'react'
import { ClockProvider } from '@/state/ClockProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <ClockProvider>{children}</ClockProvider>
}
