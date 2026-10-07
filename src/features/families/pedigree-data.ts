import type { PedigreeNodeData } from '@/components/pedigree/Pedigree'
import { GENOTYPE_TEXT, PHENOTYPE_TEXT } from '@/components/clinical/labels'
import { isBloodRelative } from '@/domain/family/kinship'
import type { IsoDate } from '@/domain/time'
import type { FamilyOverview } from '@/state/caseload'
import { ageText, fullName, relationshipText } from '../shared/person-text'

/** Maps domain summaries and engine actions to what the pedigree displays. */
export function pedigreeNodeData(family: FamilyOverview, today: IsoDate): Record<string, PedigreeNodeData> {
  return Object.fromEntries(
    family.people.map((summary) => {
      const { person } = summary
      const actions = family.actions.filter((a) => a.personId === person.id)
      const overdue = actions.filter((a) => a.when.kind === 'due' && a.when.dueState === 'overdue').length
      const bloodRelative = isBloodRelative(summary.relationshipToProband)
      const genotypeStatus = summary.genotypes[0]?.status ?? 'untested'
      const genotype = bloodRelative && !person.deceasedDate ? genotypeStatus : null
      const age = ageText(person, today)
      const relation = summary.relationshipToProband.relation
      // Long descriptive labels (e.g. "Father of Lucas and Mila") are omitted from the symbol caption.
      const caption = summary.isProband
        ? `${age} · Proband`
        : relation === 'co-parent' || relation === 'unrelated'
          ? age
          : `${age} · ${summary.relationshipToProband.label}`

      const description = [
        fullName(person),
        relationshipText(summary),
        person.deceasedDate ? `deceased ${person.deceasedDate.slice(0, 4)}` : age.replace(' y', ' years'),
        bloodRelative ? GENOTYPE_TEXT[genotypeStatus] : 'not a blood relative of the proband',
        PHENOTYPE_TEXT[summary.phenotype.status],
        actions.length === 0
          ? 'no outstanding actions'
          : `${actions.length} outstanding ${actions.length === 1 ? 'action' : 'actions'}${overdue ? `, ${overdue} overdue` : ''}`,
      ].join(', ')

      return [
        person.id,
        {
          name: fullName(person),
          caption,
          isProband: summary.isProband,
          deceased: Boolean(person.deceasedDate),
          genotype,
          phenotype: summary.phenotype.status,
          attention: { count: actions.length, overdue },
          description,
        },
      ]
    }),
  )
}
