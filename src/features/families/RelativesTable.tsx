import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { testingText } from '@/components/clinical/labels'
import { GenotypeLabel, NotBloodRelativeLabel, PhenotypeLabel, SurveillanceLabel } from '@/components/clinical/StatusLabels'
import { isBloodRelative } from '@/domain/family/kinship'
import type { IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FamilyOverview } from '@/state/caseload'
import { primaryAction } from '@/state/display-priority'
import { ageText, fullName, relationshipText } from '../shared/person-text'

/** Every recorded person, those needing attention first. */
export function RelativesTable({
  family,
  today,
  selectedId,
  onSelect,
}: {
  family: FamilyOverview
  today: IsoDate
  selectedId: string | null
  onSelect: (personId: string) => void
}) {
  const rows = family.people
    .map((summary, order) => {
      const actions = family.actions.filter((a) => a.personId === summary.person.id)
      const overdue = actions.filter((a) => a.when.kind === 'due' && a.when.dueState === 'overdue').length
      return { summary, actions, overdue, order }
    })
    .toSorted((a, b) => b.overdue - a.overdue || b.actions.length - a.actions.length || a.order - b.order)

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Relatives of {family.snapshot.family.name}</caption>
        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="py-2.5 pr-4 pl-5 font-medium">Person</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Genotype</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Testing</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Phenotype</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Surveillance</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Open actions</th>
            <th scope="col" className="w-12"><span className="sr-only">Profile</span></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(({ summary, actions, overdue }) => {
            const { person } = summary
            const selected = selectedId === person.id
            const genotype = summary.genotypes[0]!
            const bloodRelative = isBloodRelative(summary.relationshipToProband)
            return (
              <tr
                key={person.id}
                onClick={() => onSelect(person.id)}
                aria-selected={selected}
                className={cn(
                  'cursor-pointer align-top transition-colors hover:bg-accent/40',
                  selected && 'bg-accent hover:bg-accent',
                  person.deceasedDate && 'text-muted-foreground',
                )}
              >
                <td className="py-3 pr-4 pl-5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(person.id)
                    }}
                    className="text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {fullName(person)}
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {relationshipText(summary)} · {ageText(person, today)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {bloodRelative ? <GenotypeLabel status={genotype.status} /> : <NotBloodRelativeLabel />}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {bloodRelative ? testingText(genotype) : '—'}
                </td>
                <td className="px-4 py-3">
                  <PhenotypeLabel status={summary.phenotype.status} />
                </td>
                <td className="px-4 py-3">
                  <SurveillanceLabel state={summary.surveillance.state} />
                  {summary.surveillance.plan && (
                    <div className="text-xs text-muted-foreground">
                      {formatDisplayDate(summary.surveillance.plan.nextDueDate)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {actions.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <div className="max-w-64">
                      <div className={cn('flex items-start gap-1.5', overdue > 0 && 'text-overdue')}>
                        {overdue > 0 && <AlertTriangle aria-label="Overdue" className="mt-0.5 size-3.5 shrink-0" />}
                        <span className="line-clamp-2">{primaryAction(actions)!.what}</span>
                      </div>
                      {actions.length > 1 && (
                        <div className="text-xs text-muted-foreground">+{actions.length - 1} more</div>
                      )}
                    </div>
                  )}
                </td>
                <td className="pr-3 py-3">
                  <Link
                    to={`/families/${family.snapshot.family.id}/people/${person.id}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open relative profile for ${fullName(person)}`}
                    className="inline-flex rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <ChevronRight aria-hidden className="size-4" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
