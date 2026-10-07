import { RefreshCcw } from 'lucide-react'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import { variantLabel } from '@/domain/actions/rules'
import { formatDisplayDate } from '@/lib/format'
import type { PendingReclassification } from '@/state/caseload'

export function ReclassificationNotice({ pending }: { pending: PendingReclassification }) {
  const { event, variant, impact } = pending
  return (
    <section
      aria-label="Variant reclassification received"
      className="flex items-start gap-3 rounded-lg border border-genetics/25 bg-genetics-soft px-4 py-3"
    >
      <RefreshCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-genetics" />
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-genetics">Reclassification received</span>
          <span className="text-muted-foreground">{formatDisplayDate(event.receivedDate)} ·</span>
          <span className="font-medium">{variantLabel(variant)}</span>
          <ClassificationBadge classification={impact.from} />
          <span aria-label="to" className="text-muted-foreground">→</span>
          <ClassificationBadge classification={impact.to} />
        </div>
        <p className="mt-1 text-muted-foreground">
          Reported by {event.newInterpretation.laboratory} ({event.newInterpretation.reportReference}).{' '}
          <span className="text-foreground">
            {impact.affectedPeople.length} people may need clinician review.
          </span>{' '}
          Testing and surveillance pathways are unchanged until a clinician acknowledges the impact review.
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <RuleTag ruleId="DEMO-R-006" />
        <SafetyNote compact />
      </div>
    </section>
  )
}
