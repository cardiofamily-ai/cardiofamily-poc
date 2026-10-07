import { Activity, ListChecks, RefreshCcw, Smartphone, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Implementation phase in which the screen is delivered. */
  plannedPhase: number
  summary: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    to: '/',
    label: 'Command Centre',
    icon: Activity,
    plannedPhase: 3,
    summary: 'Who needs attention now — overdue surveillance, testing gaps and open clinician reviews.',
  },
  {
    to: '/families',
    label: 'Families',
    icon: Users,
    plannedPhase: 3,
    summary: 'Each family as a connected care unit: pedigree, genotype, phenotype and surveillance state.',
  },
  {
    to: '/actions',
    label: 'Actions',
    icon: ListChecks,
    plannedPhase: 4,
    summary: 'Family Action Engine worklist — who, what, when and why, each subject to clinician review.',
  },
  {
    to: '/reclassifications',
    label: 'Reclassifications',
    icon: RefreshCcw,
    plannedPhase: 5,
    summary: 'Variant interpretation changes and their potential impact across the family.',
  },
  {
    to: '/portal',
    label: 'Relative Portal',
    icon: Smartphone,
    plannedPhase: 6,
    summary: 'Preview of what an invited relative could eventually see. UI simulation only.',
  },
]
