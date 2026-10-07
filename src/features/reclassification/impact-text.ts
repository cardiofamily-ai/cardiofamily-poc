/**
 * Plain-language phrasing of domain impact reasons for the impact screen.
 * Presentation only: every statement is derived from a domain ImpactReason.
 */
import { CLASSIFICATION_SHORT } from '@/components/clinical/labels'
import type { DemoRuleId } from '@/domain/actions/types'
import { isBloodRelative } from '@/domain/family/kinship'
import type { ImpactReason } from '@/domain/reclassification/impact'
import { formatDatesInText, formatDisplayDate } from '@/lib/format'
import type { FamilyOverview, ReclassificationItem } from '@/state/caseload'

export interface ReviewPoint {
  /** Short state label, e.g. "Would be raised for clinician review". */
  readonly label: string
  readonly text: string
  readonly ruleId?: DemoRuleId
}

export interface PersonImpactView {
  readonly personId: string
  readonly why: readonly string[]
  readonly review: readonly ReviewPoint[]
}

export function describeImpact(
  family: FamilyOverview,
  item: ReclassificationItem,
  reasons: readonly ImpactReason[],
): Pick<PersonImpactView, 'why' | 'review'> {
  const applied = item.review.status === 'reviewed'
  const change = `${CLASSIFICATION_SHORT[item.impact.from]} → ${CLASSIFICATION_SHORT[item.impact.to]}`
  const why: string[] = []
  const review: ReviewPoint[] = []

  for (const reason of reasons) {
    switch (reason.kind) {
      case 'action-raised':
        why.push(formatDatesInText(reason.action.why.summary))
        review.push({
          label: applied ? 'Raised for clinician review' : 'Would be raised for clinician review',
          text: reason.action.what,
          ruleId: reason.action.ruleId,
        })
        break
      case 'action-resolved':
        why.push(`Has a workflow item that depends on the previous classification (${reason.action.what.toLowerCase()}).`)
        review.push({
          label: applied ? 'No longer raised' : 'Would no longer apply',
          text: reason.action.what,
          ruleId: reason.action.ruleId,
        })
        break
      case 'surveillance-plan': {
        const plan = family.snapshot.surveillancePlans.find((p) => p.id === reason.planId)
        why.push('Has an active surveillance plan arranged under the previous classification.')
        review.push({
          label: 'Surveillance pathway',
          text: `Plan next due ${plan ? formatDisplayDate(plan.nextDueDate) : '—'} may need review under the new classification. The plan itself is not changed.`,
        })
        break
      }
      case 'test-result':
        why.push('Has a recorded test result for this variant.')
        review.push({ label: 'Recorded result', text: `Interpretation of their result changes (${change}).` })
        break
    }
  }
  return { why, review }
}

/** Why a person does not appear among the potentially affected. */
export function exclusionReason(family: FamilyOverview, personId: string): string {
  const summary = family.people.find((p) => p.person.id === personId)!
  if (summary.person.deceasedDate) return 'Deceased'
  if (!isBloodRelative(summary.relationshipToProband)) return 'Not a blood relative of the proband'
  return 'No demonstration pathway, plan or result affected'
}
