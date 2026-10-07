/**
 * Lightweight families that give the Command Centre a realistic caseload.
 * Deliberately minimal: only the records needed to produce their states.
 * Co-parents are not modelled. Entirely synthetic.
 */
import type { FamilySnapshot } from '@/domain/snapshot'
import { toIsoDate as d } from '@/domain/time'
import { personFactory } from './builders'
import { DEMO_CENTRE, DEMO_LAB_A, DEMO_LAB_B, SCREENING_DESCRIPTION } from './institutions'

/** Maes: one untested child, one genotype-positive child without a surveillance plan. */
const maes = personFactory('fam-maes')
export const maesFamily: FamilySnapshot = {
  family: { id: 'fam-maes', name: 'Maes family', displayCode: 'SYN-FAM-003',
    probandId: 'p-maes-ann', centre: DEMO_CENTRE, synthetic: true },
  people: [
    maes('p-maes-ann', 'Ann', 'Maes', 'female', '1970-01-15'),
    maes('p-maes-wout', 'Wout', 'Maes', 'male', '1996-04-04', ['p-maes-ann']),
    maes('p-maes-fien', 'Fien', 'Maes', 'female', '1999-02-27', ['p-maes-ann']),
  ],
  variants: [{ id: 'var-maes-mybpc3', familyId: 'fam-maes', gene: 'MYBPC3', syntheticLabel: 'SYN-VAR-003', synthetic: true }],
  interpretations: [
    { id: 'int-maes-1', variantId: 'var-maes-mybpc3', classification: 'pathogenic',
      effectiveDate: d('2026-07-02'), laboratory: DEMO_LAB_A, reportReference: 'SYN-LAB-2026-0388' },
  ],
  geneticTests: [
    { id: 'gt-maes-ann', personId: 'p-maes-ann', variantId: 'var-maes-mybpc3', kind: 'diagnostic',
      requestedDate: d('2026-05-18'), status: 'resulted', resultDate: d('2026-07-02'), outcome: 'detected' },
    { id: 'gt-maes-fien', personId: 'p-maes-fien', variantId: 'var-maes-mybpc3', kind: 'cascade',
      requestedDate: d('2026-07-20'), status: 'resulted', resultDate: d('2026-08-28'), outcome: 'detected' },
  ],
  phenotypeAssessments: [
    { id: 'ph-maes-ann-1', personId: 'p-maes-ann', date: d('2026-06-10'), modality: 'echocardiogram', finding: 'present' },
  ],
  surveillancePlans: [
    { id: 'sp-maes-ann', personId: 'p-maes-ann', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2026-06-10'), nextDueDate: d('2027-06-10') },
  ],
  reclassificationEvents: [],
}

/** Dubois: overdue surveillance and an overdue pending cascade result. */
const dubois = personFactory('fam-dubois')
export const duboisFamily: FamilySnapshot = {
  family: { id: 'fam-dubois', name: 'Dubois family', displayCode: 'SYN-FAM-004',
    probandId: 'p-dubois-luc', centre: DEMO_CENTRE, synthetic: true },
  people: [
    dubois('p-dubois-luc', 'Luc', 'Dubois', 'male', '1963-05-30'),
    dubois('p-dubois-thomas', 'Thomas', 'Dubois', 'male', '1991-03-12', ['p-dubois-luc']),
    dubois('p-dubois-claire', 'Claire', 'Dubois', 'female', '1995-11-30', ['p-dubois-luc']),
  ],
  variants: [{ id: 'var-dubois-myh7', familyId: 'fam-dubois', gene: 'MYH7', syntheticLabel: 'SYN-VAR-004', synthetic: true }],
  interpretations: [
    { id: 'int-dubois-1', variantId: 'var-dubois-myh7', classification: 'likely-pathogenic',
      effectiveDate: d('2022-10-05'), laboratory: DEMO_LAB_B, reportReference: 'SYN-MDG-2022-0519' },
  ],
  geneticTests: [
    { id: 'gt-dubois-luc', personId: 'p-dubois-luc', variantId: 'var-dubois-myh7', kind: 'diagnostic',
      requestedDate: d('2022-08-22'), status: 'resulted', resultDate: d('2022-10-05'), outcome: 'detected' },
    { id: 'gt-dubois-thomas', personId: 'p-dubois-thomas', variantId: 'var-dubois-myh7', kind: 'cascade',
      requestedDate: d('2022-11-21'), status: 'resulted', resultDate: d('2023-01-16'), outcome: 'detected' },
    { id: 'gt-dubois-claire', personId: 'p-dubois-claire', variantId: 'var-dubois-myh7', kind: 'cascade',
      requestedDate: d('2026-07-28'), status: 'sample-pending', expectedResultDate: d('2026-09-08') },
  ],
  phenotypeAssessments: [
    { id: 'ph-dubois-luc-1', personId: 'p-dubois-luc', date: d('2025-10-20'), modality: 'echocardiogram', finding: 'present' },
    { id: 'ph-dubois-thomas-1', personId: 'p-dubois-thomas', date: d('2025-03-03'), modality: 'echocardiogram', finding: 'absent' },
  ],
  surveillancePlans: [
    { id: 'sp-dubois-luc', personId: 'p-dubois-luc', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-10-20'), nextDueDate: d('2026-10-20') },
    { id: 'sp-dubois-thomas', personId: 'p-dubois-thomas', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-03-03'), nextDueDate: d('2026-03-03') },
  ],
  reclassificationEvents: [],
}

/** Wouters: everything up to date — a family with no open actions. */
const wouters = personFactory('fam-wouters')
export const woutersFamily: FamilySnapshot = {
  family: { id: 'fam-wouters', name: 'Wouters family', displayCode: 'SYN-FAM-005',
    probandId: 'p-wouters-els', centre: DEMO_CENTRE, synthetic: true },
  people: [
    wouters('p-wouters-els', 'Els', 'Wouters', 'female', '1979-06-06'),
    wouters('p-wouters-arne', 'Arne', 'Wouters', 'male', '2007-01-19', ['p-wouters-els']),
    wouters('p-wouters-jana', 'Jana', 'Wouters', 'female', '2010-04-28', ['p-wouters-els']),
  ],
  variants: [{ id: 'var-wouters-mybpc3', familyId: 'fam-wouters', gene: 'MYBPC3', syntheticLabel: 'SYN-VAR-005', synthetic: true }],
  interpretations: [
    { id: 'int-wouters-1', variantId: 'var-wouters-mybpc3', classification: 'pathogenic',
      effectiveDate: d('2024-02-20'), laboratory: DEMO_LAB_A, reportReference: 'SYN-LAB-2024-0067' },
  ],
  geneticTests: [
    { id: 'gt-wouters-els', personId: 'p-wouters-els', variantId: 'var-wouters-mybpc3', kind: 'diagnostic',
      requestedDate: d('2024-01-08'), status: 'resulted', resultDate: d('2024-02-20'), outcome: 'detected' },
    { id: 'gt-wouters-arne', personId: 'p-wouters-arne', variantId: 'var-wouters-mybpc3', kind: 'cascade',
      requestedDate: d('2024-03-25'), status: 'resulted', resultDate: d('2024-05-06'), outcome: 'not-detected' },
    { id: 'gt-wouters-jana', personId: 'p-wouters-jana', variantId: 'var-wouters-mybpc3', kind: 'cascade',
      requestedDate: d('2024-03-25'), status: 'resulted', resultDate: d('2024-05-06'), outcome: 'not-detected' },
  ],
  phenotypeAssessments: [
    { id: 'ph-wouters-els-1', personId: 'p-wouters-els', date: d('2026-02-11'), modality: 'echocardiogram', finding: 'present' },
  ],
  surveillancePlans: [
    { id: 'sp-wouters-els', personId: 'p-wouters-els', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2026-02-11'), nextDueDate: d('2027-02-11') },
  ],
  reclassificationEvents: [],
}
