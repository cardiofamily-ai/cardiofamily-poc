import { ArrowRight, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import { variantLabel } from '@/domain/actions/rules'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ReclassificationItem } from '@/state/caseload'

export function ReclassificationNotice({ item }: { item: ReclassificationItem }) {
  const { event, variant, impact, review } = item
  const latest = review.latest
  const message = {
    'pending-clinician-review': `${impact.affectedPeople.length} people may need clinician review. Testing and surveillance pathways are unchanged until a clinician records the impact review.`,
    deferred: `Impact review deferred${latest?.note ? ` (“${latest.note}”)` : ''}. Pathways remain unchanged.`,
    reviewed: `Impact reviewed by ${latest?.reviewer} on ${latest ? formatDisplayDate(latest.date) : ''}. The demonstration workflow now uses the new classification; resulting items await clinician review. No care has been changed.`,
    'not-applicable': `Marked not applicable by ${latest?.reviewer}. Pathways unchanged; impact review items closed.`,
  }[review.status]

  return (
    <section
      aria-label="Variant reclassification"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3',
        review.status === 'reviewed' ? 'border-settled/30 bg-settled-soft' : 'border-genetics/25 bg-genetics-soft',
      )}
    >
      <RefreshCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-genetics" />
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-genetics">Laboratory reclassification</span>
          <span className="text-muted-foreground">{formatDisplayDate(event.receivedDate)} ·</span>
          <span className="font-medium">{variantLabel(variant)}</span>
          <ClassificationBadge classification={impact.from} />
          <span aria-label="to" className="text-muted-foreground">→</span>
          <ClassificationBadge classification={impact.to} />
          <ReviewStatusBadge status={review.status} />
        </div>
        <p className="mt-1 text-muted-foreground">
          Reported by {event.newInterpretation.laboratory} ({event.newInterpretation.reportReference}). {message}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Link
          to={`/reclassifications/${event.id}`}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {review.status === 'pending-clinician-review' || review.status === 'deferred' ? 'Open impact review' : 'View impact review'}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
        <span className="flex items-center gap-2">
          <RuleTag ruleId="DEMO-R-006" />
          <SafetyNote compact />
        </span>
      </div>
    </section>
  )
}
