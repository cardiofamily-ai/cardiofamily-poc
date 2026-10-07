import type { ReactNode } from 'react'
import type { ActionWorkflowEntry } from '@/domain/action-workflow'
import type { ReviewEntry } from '@/domain/review'
import { ClockProvider } from '@/state/ClockProvider'
import { SessionProvider } from '@/state/SessionProvider'

export function AppProviders({
  children,
  initialReviews,
  initialActionLog,
}: {
  children: ReactNode
  initialReviews?: readonly ReviewEntry[]
  initialActionLog?: readonly ActionWorkflowEntry[]
}) {
  return (
    <ClockProvider>
      <SessionProvider
        {...(initialReviews ? { initialReviews } : {})}
        {...(initialActionLog ? { initialActionLog } : {})}
      >
        {children}
      </SessionProvider>
    </ClockProvider>
  )
}
