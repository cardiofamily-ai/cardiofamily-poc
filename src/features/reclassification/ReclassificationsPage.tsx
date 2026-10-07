import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { ClassificationBadge } from '@/components/clinical/ClassificationBadge'
import { ReviewStatusBadge } from '@/components/clinical/ReviewStatusBadge'
import { variantLabel } from '@/domain/actions/rules'
import { formatDisplayDate } from '@/lib/format'
import { useCaseload } from '@/state/use-caseload'

export function ReclassificationsPage() {
  const { families } = useCaseload()
  const items = families
    .flatMap((family) => family.reclassifications.map((item) => ({ family, item })))
    .toSorted((a, b) => b.item.event.receivedDate.localeCompare(a.item.event.receivedDate))

  return (
    <div className="mx-auto max-w-[1280px] px-10 pt-8 pb-16">
      <header>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight">Reclassifications</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Laboratory changes to variant interpretation received for synthetic families, and the status of each
          family-impact review.
        </p>
      </header>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Received reclassification events</caption>
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="py-2.5 pr-4 pl-5 font-medium">Received</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Family</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Variant</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Change</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Potentially affected</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Impact review</th>
              <th scope="col" className="w-10"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(({ family, item }) => (
              <tr key={item.event.id} className="group relative transition-colors hover:bg-accent/40">
                <td className="py-3.5 pr-4 pl-5">{formatDisplayDate(item.event.receivedDate)}</td>
                <td className="px-4 py-3.5">
                  <Link
                    to={`/reclassifications/${item.event.id}`}
                    className="font-medium after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline"
                  >
                    {family.snapshot.family.name}
                  </Link>
                </td>
                <td className="px-4 py-3.5">{variantLabel(item.variant)}</td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <ClassificationBadge classification={item.impact.from} />
                    <span aria-label="to">→</span>
                    <ClassificationBadge classification={item.impact.to} />
                  </span>
                </td>
                <td className="px-4 py-3.5">{item.impact.affectedPeople.length} people</td>
                <td className="px-4 py-3.5"><ReviewStatusBadge status={item.review.status} /></td>
                <td className="pr-4 text-muted-foreground">
                  <ChevronRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Synthetic laboratory reports only. CardioFamily does not classify variants. Demonstration only — requires
        clinician review.
      </p>
    </div>
  )
}
