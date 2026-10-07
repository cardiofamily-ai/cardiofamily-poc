import { DEMO_RULES } from '@/domain/actions/rules'
import type { FamilyAction } from '@/domain/actions/types'
import type { IsoDate } from '@/domain/time'
import { formatDatesInText } from '@/lib/format'
import { DueLabel } from './DueLabel'
import { RuleTag } from './RuleTag'
import { SafetyNote } from './SafetyNote'

/** Full WHAT / WHEN / WHY presentation of one engine action. */
export function ActionDetail({ action, today }: { action: FamilyAction; today: IsoDate }) {
  return (
    <article aria-label={action.what} className="space-y-2.5 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm leading-snug font-medium">{action.what}</h4>
        <RuleTag ruleId={action.ruleId} className="mt-px shrink-0" />
      </div>
      <DueLabel when={action.when} today={today} className="text-xs" />
      <div className="rounded-md bg-muted/60 px-3 py-2.5">
        <p className="text-xs font-medium text-foreground">Why</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatDatesInText(action.why.summary)}</p>
        <ul className="mt-2 space-y-1 border-t border-border/70 pt-2">
          {action.why.evidence.map((e, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
              {formatDatesInText(e.statement)}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-[11px] text-muted-foreground">
          {DEMO_RULES[action.ruleId].title} · v{action.ruleVersion}
        </span>
        <SafetyNote />
      </div>
    </article>
  )
}
