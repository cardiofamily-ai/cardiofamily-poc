import type { Classification } from '@/domain/genetics/types'
import { cn } from '@/lib/utils'
import { CLASSIFICATION_SHORT } from './labels'

const STYLE: Record<Classification, string> = {
  pathogenic: 'border-foreground/25 bg-foreground/[0.04] text-foreground',
  'likely-pathogenic': 'border-foreground/25 bg-foreground/[0.04] text-foreground',
  vus: 'border-dashed border-muted-foreground/50 text-muted-foreground',
  'likely-benign': 'border-border text-muted-foreground',
  benign: 'border-border text-muted-foreground',
}

/** Laboratory-reported classification; dashed outline marks uncertainty. */
export function ClassificationBadge({ classification, className }: { classification: Classification; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-px text-[11px] font-medium whitespace-nowrap',
        STYLE[classification],
        className,
      )}
    >
      {CLASSIFICATION_SHORT[classification]}
    </span>
  )
}
