import { AlertTriangle, ChevronRight, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { variantLabel } from '@/domain/actions/rules'
import { formatDisplayDate } from '@/lib/format'
import type { FamilyOverview } from '@/state/caseload'
import { useCaseload } from '@/state/use-caseload'
import { fullName } from '../shared/person-text'

export function FamiliesPage() {
  const { families } = useCaseload()
  return (
    <div className="mx-auto max-w-[1280px] px-10 pt-8 pb-16">
      <header>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight">Families</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {families.length} synthetic HCM families, most urgent first. Open a family to see who needs attention.
        </p>
      </header>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="py-2.5 pr-4 pl-5 font-medium">Family</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Proband · familial variant<span className="block font-normal">last acknowledged classification</span></th>
              <th scope="col" className="px-4 py-2.5 font-medium">Needs attention</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Overdue</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Cascade testing</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Genetic interpretation</th>
              <th scope="col" className="w-10"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {families.map((family) => (
              <FamilyRow key={family.snapshot.family.id} family={family} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Counts are derived from synthetic demonstration rules. Demonstration only — requires clinician review.
      </p>
    </div>
  )
}

function FamilyRow({ family }: { family: FamilyOverview }) {
  const { snapshot, proband, variant, acknowledgedInterpretation } = family
  const latest = family.reclassifications.at(-1)
  return (
    <tr className="group relative transition-colors hover:bg-accent/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-inset">
      <td className="py-3.5 pr-4 pl-5 align-top">
        <Link
          to={`/families/${snapshot.family.id}`}
          className="font-medium whitespace-nowrap after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline"
        >
          {snapshot.family.name}
        </Link>
        <div className="font-mono text-[11px] text-muted-foreground">{snapshot.family.displayCode}</div>
      </td>
      <td className="px-4 py-3.5 align-top">
        <div>{fullName(proband)}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {variantLabel(variant)}
          <ClassificationBadge classification={acknowledgedInterpretation.classification} />
        </div>
      </td>
      <td className="px-4 py-3.5 align-top">
        {family.peopleNeedingAttention > 0 ? (
          <>
            <span className="font-medium tabular-nums">{family.peopleNeedingAttention}</span>
            <span className="text-muted-foreground"> of {snapshot.people.length} people</span>
            <div className="text-xs text-muted-foreground">{family.actions.length} outstanding actions</div>
          </>
        ) : (
          <span className="text-settled">Up to date</span>
        )}
      </td>
      <td className="px-4 py-3.5 align-top">
        {family.overdueActions > 0 ? (
          <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-overdue">
            <AlertTriangle aria-hidden className="size-3.5" />
            {family.overdueActions} overdue
          </span>
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </td>
      <td className="px-4 py-3.5 align-top">
        {family.cascadeTestingActions > 0 ? (
          <span>{family.cascadeTestingActions} to follow up</span>
        ) : (
          <span className="text-muted-foreground">None open</span>
        )}
      </td>
      <td className="px-4 py-3.5 align-top">
        {latest ? (
          <div>
            <span className="inline-flex items-center gap-1.5 font-medium text-genetics">
              <RefreshCcw aria-hidden className="size-3.5" />
              Reclassification received
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClassificationBadge classification={latest.impact.from} />
              <span aria-label="to">→</span>
              <ClassificationBadge classification={latest.impact.to} />
              <span className="whitespace-nowrap">· {formatDisplayDate(latest.event.receivedDate)}</span>
            </div>
            <ReviewStatusBadge status={latest.review.status} className="mt-1.5" />
          </div>
        ) : (
          <span className="text-muted-foreground">No new events</span>
        )}
      </td>
      <td className="pr-4 align-middle text-muted-foreground">
        <ChevronRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </td>
    </tr>
  )
}
