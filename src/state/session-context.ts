import { createContext, useContext } from 'react'
import type { ActionWorkflowEntry, ActionWorkflowState } from '@/domain/action-workflow'
import type { ReviewEntry, ReviewStatus } from '@/domain/review'

export interface DemoSession {
  /** Append-only reclassification impact review log (in memory only). */
  readonly reviews: readonly ReviewEntry[]
  /** Append-only action workflow log (in memory only). */
  readonly actionLog: readonly ActionWorkflowEntry[]
  recordReview(input: { subjectId: string; status: ReviewStatus; note?: string }): void
  recordActionState(input: { actionId: string; state: ActionWorkflowState; note?: string }): void
  /** Discards all session state, restoring the seeded demonstration. */
  resetDemo(): void
}

export const SessionContext = createContext<DemoSession | null>(null)

export function useDemoSession(): DemoSession {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useDemoSession must be used within <SessionProvider>')
  return session
}
