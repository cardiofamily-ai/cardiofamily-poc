import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { WorkflowStateBadge } from '@/components/clinical/WorkflowStateBadge'
import type { FamilyAction } from '@/domain/actions/types'
import type { FamilyOverview } from '@/state/caseload'

/** Workflow state, or impact-review status for DEMO-R-006 items. */
export function ActionStatus({
  family,
  action,
  hideOpen = false,
  className,
}: {
  family: FamilyOverview
  action: FamilyAction
  /** Omit the badge for untouched Open / Pending items. */
  hideOpen?: boolean
  className?: string
}) {
  const workflow = family.actionWorkflow[action.id]
  const extra = className ? { className } : {}
  if (workflow) {
    if (hideOpen && workflow.state === 'open') return null
    return <WorkflowStateBadge state={workflow.state} {...extra} />
  }
  const status = family.actionReviewStatus[action.id]!
  if (hideOpen && status === 'pending-clinician-review') return null
  return <ReviewStatusBadge status={status} {...extra} />
}
