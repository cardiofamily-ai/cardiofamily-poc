import { CircleCheck, CircleMinus, CirclePause, Clock } from 'lucide-react'
import type { ReviewStatus } from '@/domain/review'
import { cn } from '@/lib/utils'
import { REVIEW_STATUS_TEXT } from './labels'

const STYLE: Record<ReviewStatus, { icon: typeof Clock; className: string }> = {
  'pending-clinician-review': { icon: Clock, className: 'border-due/30 bg-due-soft text-due' },
  reviewed: { icon: CircleCheck, className: 'border-settled/30 bg-settled-soft text-settled' },
  deferred: { icon: CirclePause, className: 'border-border bg-muted text-foreground' },
  'not-applicable': { icon: CircleMinus, className: 'border-border bg-muted text-muted-foreground' },
}

/** Clinician review status, always as icon + text. */
export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  const { icon: Icon, className: style } = STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        style,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {REVIEW_STATUS_TEXT[status]}
    </span>
  )
}
