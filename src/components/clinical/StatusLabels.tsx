import { CircleCheck, CircleDot, CircleHelp, CircleMinus, CirclePlus, Clock, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GenotypeStatus } from '@/domain/genetics/genotype'
import type { PhenotypeStatus } from '@/domain/phenotype/phenotype'
import type { SurveillanceState } from '@/domain/surveillance/surveillance'
import { cn } from '@/lib/utils'
import { GENOTYPE_TEXT, PHENOTYPE_TEXT, SURVEILLANCE_TEXT } from './labels'

function Status({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      {icon}
      {children}
    </span>
  )
}

const iconClass = 'size-3.5 shrink-0'

export function GenotypeLabel({ status }: { status: GenotypeStatus }) {
  const icons: Record<GenotypeStatus, ReactNode> = {
    positive: <CirclePlus aria-hidden className={iconClass} />,
    negative: <CircleMinus aria-hidden className={iconClass} />,
    pending: <Clock aria-hidden className={iconClass} />,
    declined: <XCircle aria-hidden className={iconClass} />,
    untested: <CircleHelp aria-hidden className={iconClass} />,
  }
  return (
    <Status
      icon={icons[status]}
      className={cn(
        status === 'positive' && 'font-medium text-foreground',
        (status === 'untested' || status === 'declined') && 'text-muted-foreground',
        status === 'pending' && 'text-due',
      )}
    >
      {GENOTYPE_TEXT[status]}
    </Status>
  )
}

export function PhenotypeLabel({ status }: { status: PhenotypeStatus }) {
  const icon =
    status === 'present' ? (
      <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-pedigree" />
    ) : status === 'inconclusive' ? (
      <CircleDot aria-hidden className={iconClass} />
    ) : (
      <span aria-hidden className="size-2.5 shrink-0 rounded-full border border-muted-foreground" />
    )
  return (
    <Status icon={icon} className={cn(status === 'present' ? 'font-medium' : 'text-muted-foreground')}>
      {PHENOTYPE_TEXT[status]}
    </Status>
  )
}

export function SurveillanceLabel({ state, dueText }: { state: SurveillanceState; dueText?: string }) {
  const icon =
    state === 'overdue' ? (
      <XCircle aria-hidden className={iconClass} />
    ) : state === 'upcoming' ? (
      <CircleCheck aria-hidden className={iconClass} />
    ) : (
      <CircleDot aria-hidden className={cn(iconClass, 'opacity-50')} />
    )
  return (
    <Status
      icon={icon}
      className={cn(
        state === 'overdue' && 'font-medium text-overdue',
        state === 'upcoming' && 'text-settled',
        state === 'none' && 'text-muted-foreground',
      )}
    >
      {SURVEILLANCE_TEXT[state]}
      {dueText && <span className="font-normal text-muted-foreground">· {dueText}</span>}
    </Status>
  )
}

export function NotBloodRelativeLabel() {
  return <span className="text-muted-foreground">Not a blood relative</span>
}
