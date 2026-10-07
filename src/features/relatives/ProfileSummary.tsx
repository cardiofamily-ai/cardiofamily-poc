import { Info, RefreshCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { DueLabel } from '@/components/clinical/DueLabel'
import { CLASSIFICATION_SHORT, RELATIVE_STATUS_TEXT, testingText } from '@/components/clinical/labels'
import { RuleTag } from '@/components/clinical/RuleTag'
import { SafetyNote } from '@/components/clinical/SafetyNote'
import { GenotypeLabel } from '@/components/clinical/StatusLabels'
import { DEMO_RULES, variantLabel } from '@/domain/actions/rules'
import { isBloodRelative } from '@/domain/family/kinship'
import { DEMO_CATEGORISATION_NOTICE } from '@/domain/safety'
import type { IsoDate } from '@/domain/time'
import { formatDatesInText, formatDisplayDate } from '@/lib/format'
import type { RelativeProfile } from '@/state/relative-profile'

function Panel({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col px-5 py-4">
      <h2 id={id} className="text-[11px] font-semibold tracking-wider text-primary uppercase">
        {label}
      </h2>
      <div className="mt-2 flex flex-1 flex-col">{children}</div>
    </section>
  )
}

/** The three concepts every relevant relative exposes: RISK, NEXT ACTION, GENETIC INTERPRETATION. */
export function ProfileSummary({ profile, today }: { profile: RelativeProfile; today: IsoDate }) {
  return (
    <div className="grid grid-cols-3 divide-x rounded-lg border bg-card">
      <RiskPanel profile={profile} />
      <NextActionPanel profile={profile} today={today} />
      <GeneticInterpretationPanel profile={profile} />
    </div>
  )
}

function RiskPanel({ profile }: { profile: RelativeProfile }) {
  const { status } = profile
  return (
    <Panel label="Risk" id="panel-risk">
      <p className="text-lg leading-snug font-semibold">{RELATIVE_STATUS_TEXT[status.category]}</p>
      <ul aria-label="Basis for this categorisation" className="mt-2 space-y-1">
        {status.basis.map((line) => (
          <li key={line} className="flex gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
            {formatDatesInText(line)}
          </li>
        ))}
      </ul>
      <p className="mt-auto flex items-center gap-1 pt-3 text-[11px] text-muted-foreground">
        <Info aria-hidden className="size-3 shrink-0" />
        {DEMO_CATEGORISATION_NOTICE}
      </p>
    </Panel>
  )
}

function NextActionPanel({ profile, today }: { profile: RelativeProfile; today: IsoDate }) {
  const action = profile.nextAction
  if (!action) {
    return (
      <Panel label="Next action" id="panel-next">
        <p className="text-lg font-semibold text-muted-foreground">No open actions</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nothing is currently raised for this person by the demonstration rules.
        </p>
      </Panel>
    )
  }
  const more = profile.actions.length - 1
  return (
    <Panel label="Next action" id="panel-next">
      <p className="text-lg leading-snug font-semibold">{action.what}</p>
      <DueLabel when={action.when} today={today} className="mt-1.5 text-sm" />
      <p className="mt-2 text-xs text-muted-foreground">{formatDatesInText(action.why.summary)}</p>
      <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
        <RuleTag ruleId={action.ruleId} />
        {DEMO_RULES[action.ruleId].title}
      </p>
      {more > 0 && (
        <a href="#open-actions" className="mt-2 self-start text-xs text-primary hover:underline">
          +{more} more open {more === 1 ? 'action' : 'actions'}
        </a>
      )}
      <SafetyNote className="mt-auto pt-3" />
    </Panel>
  )
}

function GeneticInterpretationPanel({ profile }: { profile: RelativeProfile }) {
  const { family, summary, genotype, pendingImpacts } = profile
  const { variant, interpretation, interpretationHistory } = family
  const previous = interpretationHistory.at(-2)
  return (
    <Panel label="Genetic interpretation" id="panel-genetics">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg font-semibold">{variantLabel(variant)}</span>
        <ClassificationBadge classification={interpretation.classification} />
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Laboratory classification · {formatDisplayDate(interpretation.effectiveDate)}
        {previous && ` (previously ${CLASSIFICATION_SHORT[previous.classification]})`}
      </p>
      <p className="text-xs text-muted-foreground">
        {interpretation.laboratory} · {interpretation.reportReference}
      </p>

      <div className="mt-3 border-t pt-3 text-sm">
        {isBloodRelative(summary.relationshipToProband) ? (
          <>
            <GenotypeLabel status={genotype.status} />
            <p className="text-xs text-muted-foreground">{testingText(genotype)}</p>
          </>
        ) : (
          <p className="text-muted-foreground">Familial variant testing not applicable — not a blood relative of the proband.</p>
        )}
      </div>

      {pendingImpacts.map(({ pending }) => (
        <div
          key={pending.event.id}
          className="mt-3 flex gap-2 rounded-md border border-genetics/25 bg-genetics-soft px-3 py-2 text-xs"
        >
          <RefreshCcw aria-hidden className="mt-0.5 size-3.5 shrink-0 text-genetics" />
          <p>
            <span className="font-medium text-genetics">New laboratory report received</span>{' '}
            {formatDisplayDate(pending.event.receivedDate)}:{' '}
            <ClassificationBadge classification={pending.impact.from} /> →{' '}
            <ClassificationBadge classification={pending.impact.to} />. May affect this person; awaiting clinician
            impact review.
          </p>
        </div>
      ))}
    </Panel>
  )
}
