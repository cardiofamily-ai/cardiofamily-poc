import { ChevronRight, Network } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ActionDetail } from '@/components/clinical/ActionDetail'
import type { Evidence } from '@/domain/actions/types'
import { formatDisplayDate } from '@/lib/format'
import { useClock } from '@/state/clock-context'
import type { RelativeProfile } from '@/state/relative-profile'
import { useRelativeProfile } from '@/state/use-caseload'
import { ageText, fullName, relationshipText, sexText } from '../shared/person-text'
import { FamilyConnections } from './FamilyConnections'
import { PhenotypeHistory, SurveillanceHistory, TestingHistory } from './ProfileRecords'
import { recordAnchor } from './record-anchor'
import { ProfileSummary } from './ProfileSummary'

const LINKABLE: ReadonlySet<Evidence['source']['kind']> = new Set([
  'genetic-test',
  'phenotype-assessment',
  'surveillance-plan',
])

function evidenceLinker(profile: RelativeProfile) {
  const shown = new Set([
    ...profile.tests.map((t) => t.id),
    ...profile.assessments.map((a) => a.id),
    ...profile.plans.map((p) => p.id),
  ])
  return (source: Evidence['source']) =>
    LINKABLE.has(source.kind) && shown.has(source.id) ? `#${recordAnchor(source.id)}` : undefined
}

export function RelativeProfilePage() {
  const { familyId, personId } = useParams()
  const profile = useRelativeProfile(familyId, personId)
  const today = useClock().today()

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-10 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Person not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">No synthetic relative matches this address.</p>
        <Link to="/families" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to families
        </Link>
      </div>
    )
  }

  const { family, summary } = profile
  const { person } = summary
  const familyPath = `/families/${family.snapshot.family.id}`

  return (
    <div className="mx-auto max-w-[1400px] px-8 pt-6 pb-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/families" className="hover:text-foreground">Families</Link>
        <ChevronRight aria-hidden className="size-3" />
        <Link to={familyPath} className="hover:text-foreground">{family.snapshot.family.name}</Link>
        <ChevronRight aria-hidden className="size-3" />
        <span aria-current="page" className="text-foreground">{fullName(person)}</span>
      </nav>

      <header className="mt-2 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight">{fullName(person)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{relationshipText(summary)}</span>
            {' · '}
            {sexText(person)} · {ageText(person, today)} · born {formatDisplayDate(person.dateOfBirth)}
            {person.deceasedDate && ` · died ${formatDisplayDate(person.deceasedDate)}`}
          </p>
        </div>
        <Link
          to={`${familyPath}?person=${person.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Network aria-hidden className="size-4" />
          View in family workspace
        </Link>
      </header>

      <div className="mt-5">
        <ProfileSummary profile={profile} today={today} />
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_320px] gap-10">
        <div className="space-y-8">
          <section id="open-actions" aria-labelledby="actions-heading" className="scroll-mt-24">
            <h2 id="actions-heading" className="mb-1 text-sm font-semibold">
              Open actions · {profile.actions.length}
            </h2>
            {profile.actions.length === 0 ? (
              <p className="rounded-lg border border-dashed px-5 py-3 text-sm text-muted-foreground">
                No open actions for this person.
              </p>
            ) : (
              <div className="divide-y rounded-lg border bg-card px-5">
                {profile.actions.map((action) => (
                  <ActionDetail key={action.id} action={action} today={today} evidenceHref={evidenceLinker(profile)} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="review-heading">
            <h2 id="review-heading" className="mb-2 text-sm font-semibold">Review history</h2>
            <p className="rounded-lg border border-dashed px-5 py-3 text-sm text-muted-foreground">
              No clinician review recorded.
            </p>
          </section>

          <TestingHistory profile={profile} />
          <PhenotypeHistory profile={profile} />
          <SurveillanceHistory profile={profile} today={today} />
        </div>

        <aside>
          <FamilyConnections profile={profile} />
        </aside>
      </div>
    </div>
  )
}
