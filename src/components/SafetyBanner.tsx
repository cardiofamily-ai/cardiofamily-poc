import { ShieldAlert } from 'lucide-react'
import { ENVIRONMENT_NOTICE } from '@/domain/safety'

export function SafetyBanner() {
  return (
    <div
      role="note"
      aria-label="Environment notice"
      className="sticky left-0 flex min-h-9 w-screen shrink-0 items-center justify-start gap-2 border-b border-notice-border bg-notice px-4 py-1.5 text-xs font-medium tracking-wide text-notice-foreground lg:static lg:h-9 lg:w-auto lg:justify-center lg:py-0"
    >
      <ShieldAlert aria-hidden className="size-3.5 shrink-0" />
      <span>{ENVIRONMENT_NOTICE}</span>
    </div>
  )
}
