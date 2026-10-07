import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { MODALITY_TEXT, PHENOTYPE_TEXT } from '@/components/clinical/labels'
import { SurveillanceLabel } from '@/components/clinical/StatusLabels'
import { dueStateOn, type IsoDate } from '@/domain/time'
import { formatDisplayDate } from '@/lib/format'
import type { RelativeProfile } from '@/state/relative-profile'
import { recordAnchor } from './record-anchor'


function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-2 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Table({ caption, head, children }: { caption: string; head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2 font-medium first:pl-5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed px-5 py-3 text-sm text-muted-foreground">{children}</p>
}

const rowClass = 'scroll-mt-24 transition-colors target:bg-accent'

/** Highlights the record row named in the URL hash (evidence links). */
function useRowClass() {
  const { hash } = useLocation()
  return (id: string) => (hash === `#${recordAnchor(id)}` ? `${rowClass} bg-accent` : rowClass)
}
const cell = 'px-4 py-2.5 first:pl-5 align-top'

export function TestingHistory({ profile }: { profile: RelativeProfile }) {
  const rowCls = useRowClass()
  return (
    <Section id="testing-heading" title="Genetic testing">
      {profile.tests.length === 0 ? (
        <Empty>No genetic test recorded.</Empty>
      ) : (
        <Table caption="Genetic testing history" head={['Requested', 'Test', 'Status', 'Result']}>
          {profile.tests.map((t) => (
            <tr key={t.id} id={recordAnchor(t.id)} className={rowCls(t.id)}>
              <td className={cell}>{formatDisplayDate(t.requestedDate)}</td>
              <td className={cell}>
                {t.kind === 'diagnostic' ? 'Diagnostic test' : 'Cascade test (familial variant)'}
              </td>
              <td className={cell}>
                {t.status === 'resulted'
                  ? `Resulted ${formatDisplayDate(t.resultDate)}`
                  : t.status === 'declined'
                    ? 'Declined'
                    : `${t.status === 'offered' ? 'Offered' : 'Sample pending'}${t.expectedResultDate ? ` · expected ${formatDisplayDate(t.expectedResultDate)}` : ''}`}
              </td>
              <td className={cell}>
                {t.status === 'resulted' ? (
                  <span className="font-medium">
                    {t.outcome === 'detected' ? 'Familial variant detected' : 'Familial variant not detected'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Section>
  )
}

export function PhenotypeHistory({ profile }: { profile: RelativeProfile }) {
  const rowCls = useRowClass()
  return (
    <Section id="phenotype-heading" title="Phenotype assessments">
      {profile.assessments.length === 0 ? (
        <Empty>No phenotype assessment recorded.</Empty>
      ) : (
        <Table caption="Phenotype assessment history" head={['Date', 'Modality', 'Recorded finding']}>
          {profile.assessments.map((a) => (
            <tr key={a.id} id={recordAnchor(a.id)} className={rowCls(a.id)}>
              <td className={cell}>{formatDisplayDate(a.date)}</td>
              <td className={cell}>{MODALITY_TEXT[a.modality]}</td>
              <td className={cell}>{PHENOTYPE_TEXT[a.finding]}</td>
            </tr>
          ))}
        </Table>
      )}
    </Section>
  )
}

export function SurveillanceHistory({ profile, today }: { profile: RelativeProfile; today: IsoDate }) {
  const rowCls = useRowClass()
  return (
    <Section id="surveillance-heading" title="Surveillance">
      {profile.plans.length === 0 ? (
        <Empty>No surveillance plan recorded.</Empty>
      ) : (
        <Table caption="Surveillance plans" head={['Plan', 'Status', 'Last review', 'Next due']}>
          {profile.plans.map((p) => (
            <tr key={p.id} id={recordAnchor(p.id)} className={rowCls(p.id)}>
              <td className={cell}>{p.description}</td>
              <td className={cell}>
                {p.status === 'active' ? (
                  <SurveillanceLabel state={dueStateOn(p.nextDueDate, today)} />
                ) : (
                  <span className="text-muted-foreground">Ended</span>
                )}
              </td>
              <td className={cell}>{p.lastReviewDate ? formatDisplayDate(p.lastReviewDate) : '—'}</td>
              <td className={cell}>{formatDisplayDate(p.nextDueDate)}</td>
            </tr>
          ))}
        </Table>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Surveillance records come from synthetic seed data. Recording a workflow state does not change them.
      </p>
    </Section>
  )
}
