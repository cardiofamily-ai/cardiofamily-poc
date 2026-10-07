import { ShieldAlert } from 'lucide-react'
import { ENVIRONMENT_NOTICE } from '@/domain/safety'

export function SafetyBanner() {
  return (
    <div
      role="note"
      aria-label="Environment notice"
      className="flex h-9 shrink-0 items-center justify-center gap-2 border-b border-notice-border bg-notice text-xs font-medium tracking-wide text-notice-foreground"
    >
      <ShieldAlert aria-hidden className="size-3.5" />
      <span>{ENVIRONMENT_NOTICE}</span>
    </div>
  )
}
