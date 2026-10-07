import { AlertTriangle, CalendarClock, CircleDashed } from 'lucide-react'
import type { ActionTiming } from '@/domain/actions/types'
import { daysBetween, type IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? '' : 's'}`
}

/** WHEN, as icon + text: overdue, due date, or no due date. */
export function DueLabel({ when, today, className }: { when: ActionTiming; today: IsoDate; className?: string }) {
  if (when.kind === 'unscheduled') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground', className)}>
        <CircleDashed aria-hidden className="size-3.5 shrink-0" />
        No due date
      </span>
    )
  }
  const days = daysBetween(today, when.dueDate)
  if (when.dueState === 'overdue') {
    return (
      <span className={cn('inline-flex flex-col', className)}>
        <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-overdue">
          <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
          Overdue · {plural(-days, 'day')}
        </span>
        <span className="pl-5 text-xs text-muted-foreground">Due {formatDisplayDate(when.dueDate)}</span>
      </span>
    )
  }
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-due">
        <CalendarClock aria-hidden className="size-3.5 shrink-0" />
        {days === 0 ? 'Due today' : `Due in ${plural(days, 'day')}`}
      </span>
      <span className="pl-5 text-xs text-muted-foreground">{formatDisplayDate(when.dueDate)}</span>
    </span>
  )
}
