import { DEMO_RULES } from '@/domain/actions/rules'
import type { DemoRuleId } from '@/domain/actions/types'
import { cn } from '@/lib/utils'

/** Demonstration rule identifier; the title attribute carries the rule name. */
export function RuleTag({ ruleId, className }: { ruleId: DemoRuleId; className?: string }) {
  const rule = DEMO_RULES[ruleId]
  return (
    <span
      title={`${rule.title} (v${rule.version}) — ${rule.notice}`}
      className={cn(
        'inline-flex items-center rounded bg-muted px-1.5 py-px font-mono text-[11px] text-muted-foreground',
        className,
      )}
    >
      {ruleId}
    </span>
  )
}
