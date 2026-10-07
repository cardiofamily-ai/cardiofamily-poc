import { useMemo, useReducer, type ReactNode } from 'react'
import { DEMO_REVIEWER, type ReviewEntry } from '@/domain/review'
import type { IsoDate } from '@/domain/time'
import { useClock } from './clock-context'
import { SessionContext, type DemoSession } from './session-context'

type Action =
  | { type: 'record'; entry: Omit<ReviewEntry, 'id'> }
  | { type: 'reset' }

function reducer(reviews: readonly ReviewEntry[], action: Action): readonly ReviewEntry[] {
  switch (action.type) {
    case 'record':
      return [...reviews, { ...action.entry, id: `rev-${reviews.length + 1}` }]
    case 'reset':
      return []
  }
}

interface SessionProviderProps {
  /** Seed review entries (tests only). */
  initialReviews?: readonly ReviewEntry[]
  children: ReactNode
}

/** In-memory demo session. Nothing is persisted; reload restores the seeded state. */
export function SessionProvider({ initialReviews = [], children }: SessionProviderProps) {
  const today: IsoDate = useClock().today()
  const [reviews, dispatch] = useReducer(reducer, initialReviews)

  const session = useMemo<DemoSession>(
    () => ({
      reviews,
      recordReview: ({ subjectId, status, note }) => {
        const trimmed = note?.trim()
        dispatch({
          type: 'record',
          entry: {
            subjectId,
            subjectKind: 'reclassification-event',
            status,
            reviewer: DEMO_REVIEWER,
            date: today,
            ...(trimmed ? { note: trimmed } : {}),
          },
        })
      },
      resetDemo: () => dispatch({ type: 'reset' }),
    }),
    [reviews, today],
  )
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
