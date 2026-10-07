import { ShieldAlert } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { REVIEW_STATUS_TEXT } from '@/components/clinical/labels'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { DEMO_REVIEWER, type ReviewDecision } from '@/domain/review'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import type { IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ReclassificationItem } from '@/state/caseload'

const DECISIONS: { value: ReviewDecision; description: string }[] = [
  {
    value: 'reviewed',
    description:
      'I have reviewed the impact. The demonstration workflow is re-evaluated with the new classification; any resulting items are raised for clinician review.',
  },
  {
    value: 'deferred',
    description: 'Keep this impact review open for later. The workflow is unchanged.',
  },
  {
    value: 'not-applicable',
    description: 'No workflow change is needed for this family. The workflow is unchanged and the impact review items are closed.',
  },
]

interface ImpactReviewPanelProps {
  item: ReclassificationItem
  today: IsoDate
  onRecord: (decision: ReviewDecision, note: string) => void
  onReturnToPending: () => void
}

export function ImpactReviewPanel({ item, today, onRecord, onReturnToPending }: ImpactReviewPanelProps) {
  const [decision, setDecision] = useState<ReviewDecision | null>(null)
  const [note, setNote] = useState('')
  const noteId = useId()
  const { status, history } = item.review
  const decided = status === 'reviewed' || status === 'not-applicable'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!decision) return
    onRecord(decision, note)
    setDecision(null)
    setNote('')
  }

  return (
    <section aria-labelledby="clinician-review-heading" className="rounded-lg border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 id="clinician-review-heading" className="text-sm font-semibold">Clinician review</h2>
        <ReviewStatusBadge status={status} />
      </header>

      {decided ? (
        <div className="space-y-3 px-4 py-4 text-sm">
          <p>
            Recorded as <span className="font-semibold">{REVIEW_STATUS_TEXT[status]}</span> by{' '}
            {item.review.latest!.reviewer} on {formatDisplayDate(item.review.latest!.date)}.
          </p>
          <button
            type="button"
            onClick={onReturnToPending}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Return to pending clinician review
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 px-4 py-4">
          <fieldset>
            <legend className="text-sm font-medium">Record a review decision</legend>
            <div className="mt-2 space-y-2">
              {DECISIONS.map(({ value, description }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-md border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    decision === value ? 'border-primary/50 bg-accent' : 'hover:bg-accent/40',
                  )}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={value}
                    checked={decision === value}
                    onChange={() => setDecision(value)}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium">{REVIEW_STATUS_TEXT[value]}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={noteId} className="text-sm font-medium">
              Review note <span className="font-normal text-muted-foreground">(optional, synthetic)</span>
            </label>
            <textarea
              id={noteId}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g. Discussed at cardiogenetics MDT"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Reviewer: {DEMO_REVIEWER} · {formatDisplayDate(today)}
          </p>

          <button
            type="submit"
            disabled={!decision}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Record decision
          </button>
        </form>
      )}

      <div className="flex gap-2 border-t bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <ShieldAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Recording a decision never changes tests, surveillance plans or treatment. {DEMO_ACTION_DISCLAIMER}
        </p>
      </div>

      {history.length > 0 && (
        <div className="border-t px-4 py-3">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Review history</h3>
          <ol className="mt-2 space-y-2">
            {history.toReversed().map((entry) => (
              <li key={entry.id} className="text-xs">
                <span className="font-medium">{REVIEW_STATUS_TEXT[entry.status]}</span>
                <span className="text-muted-foreground"> · {entry.reviewer} · {formatDisplayDate(entry.date)}</span>
                {entry.note && <p className="mt-0.5 text-muted-foreground">“{entry.note}”</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
