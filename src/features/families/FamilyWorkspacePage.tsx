import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { CLASSIFICATION_SHORT } from '@/components/clinical/labels'
import { Pedigree } from '@/components/pedigree/Pedigree'
import { PedigreeLegend } from '@/components/pedigree/PedigreeLegend'
import { variantLabel } from '@/domain/actions/rules'
import { useClock } from '@/state/clock-context'
import { useFamilyOverview } from '@/state/use-caseload'
import { ClassificationSummary } from '../shared/ClassificationSummary'
import { fullName } from '../shared/person-text'
import { FamilyAttentionPanel } from './FamilyAttentionPanel'
import { pedigreeNodeData } from './pedigree-data'
import { PersonPanel } from './PersonPanel'
import { ReclassificationNotice } from './ReclassificationNotice'
import { RelativesTable } from './RelativesTable'

export function FamilyWorkspacePage() {
  const { familyId } = useParams()
  const family = useFamilyOverview(familyId)
  const today = useClock().today()
  const [params, setParams] = useSearchParams()

  if (!family) {
    return (
      <div className="mx-auto max-w-5xl px-10 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Family not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">No synthetic family matches this address.</p>
        <Link to="/families" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to families
        </Link>
      </div>
    )
  }

  const { snapshot, proband, variant } = family
  const selectedId = params.get('person')
  const selected = family.people.find((p) => p.person.id === selectedId)
  const select = (personId: string | null) =>
    setParams(personId ? { person: personId } : {}, { replace: true })

  return (
    <div className="mx-auto max-w-[1400px] px-8 pt-6 pb-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/families" className="hover:text-foreground">Families</Link>
        <ChevronRight aria-hidden className="size-3" />
        <span aria-current="page" className="text-foreground">{snapshot.family.name}</span>
      </nav>

      <header className="mt-2 flex items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight">{snapshot.family.name}</h1>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {snapshot.family.displayCode}
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>
              Proband <span className="font-medium text-foreground">{fullName(proband)}</span>
            </span>
            <span aria-hidden>·</span>
            <span className="font-medium text-foreground">{variantLabel(variant)}</span>
            <ClassificationSummary family={family} />
            <span aria-hidden>·</span>
            <span>{snapshot.people.length} people recorded</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{snapshot.family.centre}</p>
        </div>
        <dl className="flex shrink-0 gap-6 text-right">
          <div>
            <dt className="text-xs text-muted-foreground">Need attention</dt>
            <dd className="text-xl font-semibold tabular-nums">
              {family.peopleNeedingAttention}
              <span className="text-sm font-normal text-muted-foreground"> / {snapshot.people.length}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Overdue</dt>
            <dd className={family.overdueActions > 0 ? 'flex items-center justify-end gap-1 text-xl font-semibold text-overdue' : 'text-xl font-semibold text-muted-foreground'}>
              {family.overdueActions > 0 && <AlertTriangle aria-hidden className="size-4" />}
              {family.overdueActions}
            </dd>
          </div>
        </dl>
      </header>

      {family.reclassifications.map((item) => (
        <div key={item.event.id} className="mt-4">
          <ReclassificationNotice item={item} />
        </div>
      ))}
      {family.latestAwaitingReview && (
        <p className="mt-2 text-xs text-muted-foreground">
          RISK and actions in this family are derived from the last acknowledged classification (
          {CLASSIFICATION_SHORT[family.acknowledgedInterpretation.classification]}) while the newer laboratory report
          awaits clinician review.
        </p>
      )}

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_384px] items-start gap-5">
        <section aria-labelledby="pedigree-heading" className="rounded-lg border bg-card">
          <header className="flex items-baseline justify-between border-b px-4 py-3">
            <h2 id="pedigree-heading" className="text-sm font-semibold">Family structure</h2>
            <p className="text-xs text-muted-foreground">Select a person to see their summary</p>
          </header>
          <div className="px-4 py-5">
            <Pedigree
              people={snapshot.people}
              data={pedigreeNodeData(family, today)}
              label={`Pedigree of the ${snapshot.family.name}`}
              selectedId={selected?.person.id ?? null}
              onSelect={(id) => select(id === selected?.person.id ? null : id)}
            />
          </div>
          <div className="border-t px-4 py-3">
            <PedigreeLegend />
          </div>
        </section>

        <aside className="rounded-lg border bg-card">
          {selected ? (
            <PersonPanel family={family} summary={selected} today={today} onClose={() => select(null)} />
          ) : (
            <FamilyAttentionPanel family={family} today={today} onSelect={select} />
          )}
        </aside>
      </div>

      <section aria-labelledby="relatives-heading" className="mt-6">
        <h2 id="relatives-heading" className="mb-2 text-sm font-semibold">Relatives</h2>
        <RelativesTable family={family} today={today} selectedId={selected?.person.id ?? null} onSelect={select} />
      </section>
    </div>
  )
}
