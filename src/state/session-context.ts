import { createContext, useContext } from 'react'
import type { ReviewEntry, ReviewStatus } from '@/domain/review'

export interface DemoSession {
  /** Append-only clinician review log for this browser session (in memory only). */
  readonly reviews: readonly ReviewEntry[]
  recordReview(input: { subjectId: string; status: ReviewStatus; note?: string }): void
  /** Discards all session state, restoring the seeded demonstration. */
  resetDemo(): void
}

export const SessionContext = createContext<DemoSession | null>(null)

export function useDemoSession(): DemoSession {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useDemoSession must be used within <SessionProvider>')
  return session
}
