import type { ReactNode } from 'react'
import type { ReviewEntry } from '@/domain/review'
import { ClockProvider } from '@/state/ClockProvider'
import { SessionProvider } from '@/state/SessionProvider'

export function AppProviders({
  children,
  initialReviews,
}: {
  children: ReactNode
  initialReviews?: readonly ReviewEntry[]
}) {
  return (
    <ClockProvider>
      <SessionProvider {...(initialReviews ? { initialReviews } : {})}>{children}</SessionProvider>
    </ClockProvider>
  )
}
