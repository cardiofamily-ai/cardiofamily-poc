import { CircleCheck, CircleDashed, CircleDot, CircleMinus, CirclePause } from 'lucide-react'
import type { ActionWorkflowState } from '@/domain/action-workflow'
import { cn } from '@/lib/utils'
import { WORKFLOW_STATE_TEXT } from './labels'

const STYLE: Record<ActionWorkflowState, { icon: typeof CircleDot; className: string }> = {
  open: { icon: CircleDashed, className: 'border-border bg-card text-muted-foreground' },
  'in-progress': { icon: CircleDot, className: 'border-primary/30 bg-accent text-primary' },
  completed: { icon: CircleCheck, className: 'border-settled/30 bg-settled-soft text-settled' },
  deferred: { icon: CirclePause, className: 'border-due/30 bg-due-soft text-due' },
  'not-applicable': { icon: CircleMinus, className: 'border-border bg-muted text-muted-foreground' },
}

/** Action workflow state as icon + text. */
export function WorkflowStateBadge({ state, className }: { state: ActionWorkflowState; className?: string }) {
  const { icon: Icon, className: style } = STYLE[state]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        style,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {WORKFLOW_STATE_TEXT[state]}
    </span>
  )
}
