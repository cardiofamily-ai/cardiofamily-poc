import { ArrowRight, Info, X } from 'lucide-react'
import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { ActionDetail } from '@/components/clinical/ActionDetail'
import { MODALITY_TEXT, RELATIVE_STATUS_TEXT, testingText } from '@/components/clinical/labels'
import { DEMO_CATEGORISATION_NOTICE } from '@/domain/safety'
import { GenotypeLabel, NotBloodRelativeLabel, PhenotypeLabel, SurveillanceLabel } from '@/components/clinical/StatusLabels'
import { isBloodRelative } from '@/domain/family/kinship'
import type { PersonSummary } from '@/domain/person-summary'
import type { IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import type { FamilyOverview } from '@/state/caseload'
import { ageText, fullName, relationshipText, sexText } from '../shared/person-text'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 py-2 text-sm">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

/** Lightweight summary of the selected person (not the full Relative Profile). */
export function PersonPanel({
  family,
  summary,
  today,
  onClose,
}: {
  family: FamilyOverview
  summary: PersonSummary
  today: IsoDate
  onClose: () => void
}) {
  const { person, phenotype, surveillance } = summary
  const genotype = summary.genotypes[0]!
  const actions = family.actions.filter((a) => a.personId === person.id)

  return (
    <section aria-label={`Summary for ${fullName(person)}`}>
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-base font-semibold">{fullName(person)}</h2>
          <p className="text-xs text-muted-foreground">
            {relationshipText(summary)} · {sexText(person)} · {ageText(person, today)}
          </p>
          <Link
            to={`/families/${family.snapshot.family.id}/people/${person.id}`}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Open relative profile
            <ArrowRight aria-hidden className="size-3" />
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close person summary"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X aria-hidden className="size-4" />
        </button>
      </header>

      <dl className="divide-y px-4">
        <Row label="Risk">
          <span className="font-medium">{RELATIVE_STATUS_TEXT[family.relativeStatuses[person.id]!.category]}</span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Info aria-hidden className="size-3 shrink-0" />
            {DEMO_CATEGORISATION_NOTICE}
          </div>
        </Row>
        <Row label="Genotype">
          {isBloodRelative(summary.relationshipToProband) ? (
            <>
              <GenotypeLabel status={genotype.status} />
              <div className="text-xs text-muted-foreground">{testingText(genotype)}</div>
            </>
          ) : (
            <NotBloodRelativeLabel />
          )}
        </Row>
        <Row label="Phenotype">
          <PhenotypeLabel status={phenotype.status} />
          {phenotype.latest && (
            <div className="text-xs text-muted-foreground">
              {MODALITY_TEXT[phenotype.latest.modality]} · {formatDisplayDate(phenotype.latest.date)}
            </div>
          )}
        </Row>
        <Row label="Surveillance">
          <SurveillanceLabel state={surveillance.state} />
          {surveillance.plan && (
            <div className="text-xs text-muted-foreground">
              Next due {formatDisplayDate(surveillance.plan.nextDueDate)}
              {surveillance.plan.lastReviewDate && ` · last ${formatDisplayDate(surveillance.plan.lastReviewDate)}`}
            </div>
          )}
        </Row>
      </dl>

      <div className="border-t px-4 pt-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Open actions · {actions.length}
        </h3>
        {actions.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No open actions for this person.</p>
        ) : (
          <div className="divide-y">
            {actions.map((action) => (
              <ActionDetail key={action.id} action={action} today={today} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
