import { useMemo, useReducer, type ReactNode } from 'react'
import type { ActionWorkflowEntry } from '@/domain/action-workflow'
import { DEMO_REVIEWER, type ReviewEntry } from '@/domain/review'
import type { IsoDate } from '@/domain/time'
import { useClock } from './clock-context'
import { SessionContext, type DemoSession } from './session-context'

interface SessionState {
  readonly reviews: readonly ReviewEntry[]
  readonly actionLog: readonly ActionWorkflowEntry[]
}

type Action =
  | { type: 'review'; entry: Omit<ReviewEntry, 'id'> }
  | { type: 'action-state'; entry: Omit<ActionWorkflowEntry, 'id'> }
  | { type: 'reset' }

const EMPTY: SessionState = { reviews: [], actionLog: [] }

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'review':
      return { ...state, reviews: [...state.reviews, { ...action.entry, id: `rev-${state.reviews.length + 1}` }] }
    case 'action-state':
      return {
        ...state,
        actionLog: [...state.actionLog, { ...action.entry, id: `act-${state.actionLog.length + 1}` }],
      }
    case 'reset':
      return EMPTY
  }
}

const withNote = (note: string | undefined) => {
  const trimmed = note?.trim()
  return trimmed ? { note: trimmed } : {}
}

interface SessionProviderProps {
  /** Seed session entries (tests only). */
  initialReviews?: readonly ReviewEntry[]
  initialActionLog?: readonly ActionWorkflowEntry[]
  children: ReactNode
}

/** In-memory demo session. Nothing is persisted; reload or Reset demo restores the seeded state. */
export function SessionProvider({ initialReviews = [], initialActionLog = [], children }: SessionProviderProps) {
  const today: IsoDate = useClock().today()
  const [state, dispatch] = useReducer(reducer, { reviews: initialReviews, actionLog: initialActionLog })

  const session = useMemo<DemoSession>(
    () => ({
      reviews: state.reviews,
      actionLog: state.actionLog,
      recordReview: ({ subjectId, status, note }) =>
        dispatch({
          type: 'review',
          entry: { subjectId, subjectKind: 'reclassification-event', status, reviewer: DEMO_REVIEWER, date: today, ...withNote(note) },
        }),
      recordActionState: ({ actionId, state: workflowState, note }) =>
        dispatch({
          type: 'action-state',
          entry: { actionId, state: workflowState, recordedBy: DEMO_REVIEWER, date: today, ...withNote(note) },
        }),
      resetDemo: () => dispatch({ type: 'reset' }),
    }),
    [state, today],
  )
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
