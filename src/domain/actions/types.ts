import type { FamilyId, PersonId } from '@/domain/family/types'
import type { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import type { DueState, IsoDate } from '@/domain/time'

export type DemoRuleId =
  | 'DEMO-R-001'
  | 'DEMO-R-002'
  | 'DEMO-R-003'
  | 'DEMO-R-004'
  | 'DEMO-R-005'
  | 'DEMO-R-006'

export interface DemoRule {
  readonly id: DemoRuleId
  readonly version: string
  readonly title: string
  /** Plain-language statement of exactly when the rule fires. */
  readonly trigger: string
  readonly notice: string
}

export type ActionCategory =
  | 'cascade-testing'
  | 'surveillance'
  | 'genetic-interpretation'
  | 'reclassification-review'

export type EvidenceSourceKind =
  | 'person'
  | 'variant-interpretation'
  | 'genetic-test'
  | 'phenotype-assessment'
  | 'surveillance-plan'
  | 'reclassification-event'
  | 'action'

/** One fact supporting WHY an action was raised, traceable to a record. */
export interface Evidence {
  readonly statement: string
  readonly source: { readonly kind: EvidenceSourceKind; readonly id: string }
}

/** WHEN: a seeded due date, or no date (at clinician discretion). */
export type ActionTiming =
  | { readonly kind: 'due'; readonly dueDate: IsoDate; readonly dueState: DueState }
  | { readonly kind: 'unscheduled' }

/** Review workflow states are added in the review phase; all actions start here. */
export type ActionStatus = 'pending-clinician-review'

export interface FamilyAction {
  /** Stable across re-evaluation: `${ruleId}:${personId}:${subjectId}`. */
  readonly id: string
  readonly ruleId: DemoRuleId
  readonly ruleVersion: string
  readonly engineVersion: string
  readonly familyId: FamilyId
  /** WHO */
  readonly personId: PersonId
  /** The record the action is about (variant, test, plan or reclassification event id). */
  readonly subjectId: string
  readonly category: ActionCategory
  /** WHAT — neutral, "consider"-style wording. */
  readonly what: string
  /** WHEN */
  readonly when: ActionTiming
  /** Date of the triggering evidence. */
  readonly raisedOn: IsoDate
  /** WHY */
  readonly why: { readonly summary: string; readonly evidence: readonly Evidence[] }
  readonly status: ActionStatus
  readonly demonstrationOnly: true
  readonly requiresClinicianReview: true
  readonly disclaimer: typeof DEMO_ACTION_DISCLAIMER
}
