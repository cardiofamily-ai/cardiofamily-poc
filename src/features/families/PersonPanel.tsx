import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ActionDetail } from '@/components/clinical/ActionDetail'
import { MODALITY_TEXT, testingText } from '@/components/clinical/labels'
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
