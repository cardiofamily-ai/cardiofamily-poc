import { Info, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { DueLabel } from '@/components/clinical/DueLabel'
import { CLASSIFICATION_SHORT, RELATIVE_STATUS_TEXT, testingText } from '@/components/clinical/labels'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
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
  const { status, family } = profile
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
      {family.latestAwaitingReview && (
        <p className="mt-2 text-xs text-genetics">
          Derived from the last acknowledged classification (
          {CLASSIFICATION_SHORT[family.acknowledgedInterpretation.classification]}); a newer laboratory report awaits
          clinician review.
        </p>
      )}
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
        <p className="text-lg font-semibold text-muted-foreground">No outstanding actions</p>
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
        <Link to="#open-actions" className="mt-2 self-start text-xs text-primary hover:underline">
          +{more} more outstanding {more === 1 ? 'action' : 'actions'}
        </Link>
      )}
      <SafetyNote className="mt-auto pt-3" />
    </Panel>
  )
}

function GeneticInterpretationPanel({ profile }: { profile: RelativeProfile }) {
  const { family, summary, genotype, reclassificationImpacts } = profile
  const { variant, acknowledgedInterpretation: interpretation, latestLaboratoryInterpretation: latest } = family
  return (
    <Panel label="Genetic interpretation" id="panel-genetics">
      <p className="text-lg font-semibold">{variantLabel(variant)}</p>
      <dl className="mt-1 space-y-1.5 text-xs">
        <div>
          <dt className="text-muted-foreground">Last acknowledged classification</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <ClassificationBadge classification={interpretation.classification} />
            <span className="text-muted-foreground">
              {formatDisplayDate(interpretation.effectiveDate)} · {interpretation.reportReference}
            </span>
          </dd>
        </div>
        {family.reclassifications.length > 0 && (
          <div>
            <dt className="text-muted-foreground">Latest laboratory classification</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <ClassificationBadge classification={latest.classification} />
              <span className="text-muted-foreground">
                {formatDisplayDate(latest.effectiveDate)} · {latest.reportReference}
              </span>
              {family.latestAwaitingReview && <ReviewStatusBadge status="pending-clinician-review" className="py-0" />}
            </dd>
          </div>
        )}
        <div>
          <dt className="sr-only">Laboratory</dt>
          <dd className="text-muted-foreground">{interpretation.laboratory}</dd>
        </div>
      </dl>

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

      {reclassificationImpacts.map(({ item }) => (
        <div
          key={item.event.id}
          className="mt-3 rounded-md border border-genetics/25 bg-genetics-soft px-3 py-2 text-xs"
        >
          <p className="flex flex-wrap items-center gap-1.5">
            <RefreshCcw aria-hidden className="size-3.5 shrink-0 text-genetics" />
            <span className="font-medium text-genetics">Laboratory reclassification</span>
            <span className="text-muted-foreground">{formatDisplayDate(item.event.receivedDate)}</span>
            <ClassificationBadge classification={item.impact.from} />
            <span aria-label="to">→</span>
            <ClassificationBadge classification={item.impact.to} />
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2">
            <ReviewStatusBadge status={item.review.status} />
            <span className="text-muted-foreground">
              {item.review.status === 'reviewed'
                ? 'Impact reviewed; new classification applied to the demonstration workflow.'
                : item.review.status === 'not-applicable'
                  ? 'Marked not applicable; workflow unchanged.'
                  : 'May affect this person; workflow unchanged until reviewed.'}
            </span>
          </p>
          <Link to={`/reclassifications/${item.event.id}`} className="mt-1 inline-block font-medium text-primary hover:underline">
            Open impact review
          </Link>
        </div>
      ))}
    </Panel>
  )
}
