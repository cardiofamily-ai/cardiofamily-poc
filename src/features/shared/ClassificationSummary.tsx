import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { cn } from '@/lib/utils'
import type { FamilyOverview } from '@/state/caseload'

/**
 * Last acknowledged vs latest laboratory classification. Families with no
 * received reclassification show a single classification.
 */
export function ClassificationSummary({ family, className }: { family: FamilyOverview; className?: string }) {
  const { acknowledgedInterpretation: acknowledged, latestLaboratoryInterpretation: latest } = family
  if (family.reclassifications.length === 0) {
    return <ClassificationBadge classification={acknowledged.classification} {...(className ? { className } : {})} />
  }
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Last acknowledged classification</span>
        <ClassificationBadge classification={acknowledged.classification} />
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Latest laboratory classification</span>
        <ClassificationBadge classification={latest.classification} />
        {family.latestAwaitingReview && <ReviewStatusBadge status="pending-clinician-review" className="py-0" />}
      </span>
    </span>
  )
}
