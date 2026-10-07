/**
 * Clinician review records. Reviews record a decision about a workflow item;
 * they never modify tests, surveillance plans, phenotype records or care.
 */
import type { IsoDate } from '@/domain/time'

export type ReviewDecision = 'reviewed' | 'deferred' | 'not-applicable'
export type ReviewStatus = 'pending-clinician-review' | ReviewDecision

/** Fictional reviewer identity used throughout the demonstration. */
export const DEMO_REVIEWER = 'Demo Clinician (fictional)'

export interface ReviewEntry {
  readonly id: string
  /** What was reviewed: a reclassification event id (or, later, an action id). */
  readonly subjectId: string
  readonly subjectKind: 'reclassification-event'
  /** A decision, or 'pending-clinician-review' when an item is returned to pending. */
  readonly status: ReviewStatus
  readonly note?: string
  readonly reviewer: string
  readonly date: IsoDate
}

export interface CurrentReview {
  readonly status: ReviewStatus
  /** The entry that set the current status, if any. */
  readonly latest?: ReviewEntry
  /** All entries for the subject, oldest first. */
  readonly history: readonly ReviewEntry[]
}

/** The latest entry for a subject decides its status; no entries means pending. */
export function currentReview(entries: readonly ReviewEntry[], subjectId: string): CurrentReview {
  const history = entries.filter((e) => e.subjectId === subjectId)
  const latest = history.at(-1)
  return latest ? { status: latest.status, latest, history } : { status: 'pending-clinician-review', history }
}

/**
 * Reclassifications whose impact review is recorded as 'Reviewed'. Only these
 * are applied to the demonstration workflow; 'Deferred' and 'Not applicable'
 * leave pathways unchanged.
 */
export function acknowledgedReclassificationIds(
  entries: readonly ReviewEntry[],
  eventIds: readonly string[],
): string[] {
  return eventIds.filter((id) => currentReview(entries, id).status === 'reviewed')
}

/** Whether an item still needs clinician attention in worklists. */
export function isOpenReviewStatus(status: ReviewStatus): boolean {
  return status === 'pending-clinician-review' || status === 'deferred'
}
