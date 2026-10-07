import { Link } from 'react-router'
import { RELATIVE_STATUS_TEXT } from '@/components/clinical/labels'
import { kinship } from '@/domain/family/kinship'
import type { RelativeProfile } from '@/state/relative-profile'
import { fullName } from '../shared/person-text'

const DEGREE_TEXT: Record<number, string> = {
  1: 'First-degree relative of the proband',
  2: 'Second-degree relative of the proband',
}

export function FamilyConnections({ profile }: { profile: RelativeProfile }) {
  const { family, summary } = profile
  const { snapshot } = family
  const self = summary.person.id
  const kin = summary.relationshipToProband

  const others = family.people
    .filter((p) => p.person.id !== self)
    .map((p, order) => ({ p, k: kinship(snapshot.people, self, p.person.id), order }))
    .toSorted((a, b) => (a.k.degree ?? 99) - (b.k.degree ?? 99) || a.order - b.order)

  return (
    <div className="space-y-6">
      <section aria-labelledby="relationship-heading">
        <h2 id="relationship-heading" className="border-b pb-2 text-sm font-semibold">Relationship to proband</h2>
        <p className="mt-2 text-sm">
          {summary.isProband ? (
            'This person is the proband.'
          ) : kin.degree === null ? (
            kin.label
          ) : (
            <>
              {kin.label} of{' '}
              <Link to={`/families/${snapshot.family.id}/people/${family.proband.id}`} className="font-medium text-primary hover:underline">
                {fullName(family.proband)}
              </Link>
            </>
          )}
        </p>
        {!summary.isProband && (
          <p className="text-xs text-muted-foreground">
            {kin.degree === null ? 'Not a blood relative of the proband' : (DEGREE_TEXT[kin.degree] ?? `Degree ${kin.degree} relative`)}
          </p>
        )}
      </section>

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="border-b pb-2 text-sm font-semibold">
          {snapshot.family.name}
        </h2>
        <ul className="mt-1 divide-y">
          {others.map(({ p, k }) => (
            <li key={p.person.id}>
              <Link
                to={`/families/${snapshot.family.id}/people/${p.person.id}`}
                className="block py-2 text-sm hover:text-primary"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{fullName(p.person)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {p.isProband ? 'Proband' : k.label}
                  </span>
                </span>
                <span className="block text-xs text-muted-foreground">
                  {RELATIVE_STATUS_TEXT[family.relativeStatuses[p.person.id]!.category]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Relationship labels are relative to {fullName(summary.person)}.
        </p>
      </section>
    </div>
  )
}
