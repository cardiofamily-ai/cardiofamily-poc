import { ShieldAlert } from 'lucide-react'
import { DEMO_ACTION_DISCLAIMER } from '@/domain/safety'
import { cn } from '@/lib/utils'

/** "Demonstration only — requires clinician review." */
export function SafetyNote({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] text-muted-foreground', className)}>
      <ShieldAlert aria-hidden className="size-3 shrink-0" />
      {compact ? 'Demo only · requires clinician review' : DEMO_ACTION_DISCLAIMER}
    </span>
  )
}
