import { Monitor } from 'lucide-react'
import { SMALL_SCREEN_NOTICE } from '@/domain/safety'

/** Visible only below 1024px (the intended minimum viewport). Does not block the app. */
export function SmallScreenNotice() {
  return (
    <div
      role="note"
      aria-label="Screen size notice"
      className="sticky left-0 flex w-screen items-center gap-2 border-b bg-muted px-4 py-2 text-xs text-foreground lg:hidden"
    >
      <Monitor aria-hidden className="size-3.5 shrink-0" />
      <span>{SMALL_SCREEN_NOTICE}</span>
    </div>
  )
}
