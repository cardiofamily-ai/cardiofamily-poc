import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { DEMO_RULES } from '@/domain/actions/rules'
import type { Evidence, FamilyAction } from '@/domain/actions/types'
import type { IsoDate } from '@/domain/time'
import { formatDatesInText } from '@/lib/format'
import { DueLabel } from './DueLabel'
import { RuleTag } from './RuleTag'
import { SafetyNote } from './SafetyNote'

interface ActionDetailProps {
  action: FamilyAction
  today: IsoDate
  /** Shown beside the title, e.g. a workflow state badge. */
  status?: ReactNode
  /** Link to the full action page. */
  href?: string
  /** Returns a link target for evidence whose source record is shown on the page. */
  evidenceHref?: (source: Evidence['source']) => string | undefined
}

/** Full WHAT / WHEN / WHY presentation of one engine action. */
export function ActionDetail({ action, today, evidenceHref, status, href }: ActionDetailProps) {
  return (
    <article aria-label={action.what} className="space-y-2.5 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm leading-snug font-medium">
          {href ? (
            <Link to={href} className="hover:text-primary hover:underline">
              {action.what}
            </Link>
          ) : (
            action.what
          )}
        </h4>
        <span className="flex shrink-0 items-center gap-2">
          {status}
          <RuleTag ruleId={action.ruleId} className="mt-px" />
        </span>
      </div>
      <DueLabel when={action.when} today={today} className="text-xs" />
      <div className="rounded-md bg-muted/60 px-3 py-2.5">
        <p className="text-xs font-medium text-foreground">Why</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatDatesInText(action.why.summary)}</p>
        <ul className="mt-2 space-y-1 border-t border-border/70 pt-2">
          {action.why.evidence.map((e, i) => {
            const href = evidenceHref?.(e.source)
            return (
              <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                <span>
                  {formatDatesInText(e.statement)}
                  {href && (
                    <a href={href} className="ml-1 whitespace-nowrap text-primary hover:underline">
                      View record
                    </a>
                  )}
                </span>
              </li>
            )
          })}
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
