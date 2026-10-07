/**
 * Janssens family — primary HCM cascade-care demonstration family.
 * Entirely synthetic: no person, variant or event corresponds to a real one.
 *
 *   Marc ═╤═ Annick
 *     ┌───┼──────────┐
 *  Pieter  Sarah* ═╤═ Jonas   Eline
 *              ┌───┴───┐
 *            Lucas    Mila             (* proband)
 */
import type { FamilySnapshot } from '@/domain/snapshot'
import { toIsoDate as d } from '@/domain/time'
import { personFactory } from './builders'
import { DEMO_CENTRE, DEMO_LAB_A, SCREENING_DESCRIPTION } from './institutions'

const FAMILY = 'fam-janssens'
const VARIANT = 'var-janssens-mybpc3'

const person = personFactory(FAMILY)

export const janssensFamily: FamilySnapshot = {
  family: {
    id: FAMILY,
    name: 'Janssens family',
    displayCode: 'SYN-FAM-001',
    probandId: 'p-janssens-sarah',
    centre: DEMO_CENTRE,
    synthetic: true,
  },
  people: [
    person('p-janssens-marc', 'Marc', 'Janssens', 'male', '1955-02-08'),
    person('p-janssens-annick', 'Annick', 'Claes', 'female', '1957-09-30'),
    person('p-janssens-pieter', 'Pieter', 'Janssens', 'male', '1981-01-22', ['p-janssens-marc', 'p-janssens-annick']),
    person('p-janssens-sarah', 'Sarah', 'Janssens', 'female', '1984-05-12', ['p-janssens-marc', 'p-janssens-annick']),
    person('p-janssens-eline', 'Eline', 'Janssens', 'female', '1988-08-03', ['p-janssens-marc', 'p-janssens-annick']),
    person('p-janssens-jonas', 'Jonas', 'Verhaegen', 'male', '1982-11-17'),
    person('p-janssens-lucas', 'Lucas', 'Verhaegen', 'male', '2011-03-09', ['p-janssens-sarah', 'p-janssens-jonas']),
    person('p-janssens-mila', 'Mila', 'Verhaegen', 'female', '2015-06-21', ['p-janssens-sarah', 'p-janssens-jonas']),
  ],
  variants: [
    { id: VARIANT, familyId: FAMILY, gene: 'MYBPC3', syntheticLabel: 'SYN-VAR-001', synthetic: true },
  ],
  interpretations: [
    {
      id: 'int-janssens-1',
      variantId: VARIANT,
      classification: 'pathogenic',
      effectiveDate: d('2025-03-12'),
      laboratory: DEMO_LAB_A,
      reportReference: 'SYN-LAB-2025-0142',
    },
  ],
  geneticTests: [
    // Proband diagnostic panel
    { id: 'gt-janssens-sarah', personId: 'p-janssens-sarah', variantId: VARIANT, kind: 'diagnostic',
      requestedDate: d('2025-01-20'), status: 'resulted', resultDate: d('2025-03-12'), outcome: 'detected' },
    // Cascade testing
    { id: 'gt-janssens-pieter', personId: 'p-janssens-pieter', variantId: VARIANT, kind: 'cascade',
      requestedDate: d('2025-04-07'), status: 'resulted', resultDate: d('2025-05-20'), outcome: 'detected' },
    { id: 'gt-janssens-marc', personId: 'p-janssens-marc', variantId: VARIANT, kind: 'cascade',
      requestedDate: d('2025-04-15'), status: 'resulted', resultDate: d('2025-06-02'), outcome: 'detected' },
    { id: 'gt-janssens-annick', personId: 'p-janssens-annick', variantId: VARIANT, kind: 'cascade',
      requestedDate: d('2025-04-15'), status: 'resulted', resultDate: d('2025-06-02'), outcome: 'not-detected' },
    { id: 'gt-janssens-lucas', personId: 'p-janssens-lucas', variantId: VARIANT, kind: 'cascade',
      requestedDate: d('2025-06-30'), status: 'resulted', resultDate: d('2025-08-11'), outcome: 'detected' },
    { id: 'gt-janssens-mila', personId: 'p-janssens-mila', variantId: VARIANT, kind: 'cascade',
      requestedDate: d('2026-09-02'), status: 'sample-pending', expectedResultDate: d('2026-10-14') },
    // Eline: no test recorded (untested sibling)
  ],
  phenotypeAssessments: [
    { id: 'ph-janssens-sarah-1', personId: 'p-janssens-sarah', date: d('2024-11-05'), modality: 'echocardiogram', finding: 'present' },
    { id: 'ph-janssens-sarah-2', personId: 'p-janssens-sarah', date: d('2026-04-20'), modality: 'cardiac-mri', finding: 'present' },
    { id: 'ph-janssens-marc-1', personId: 'p-janssens-marc', date: d('2025-07-14'), modality: 'echocardiogram', finding: 'present' },
    { id: 'ph-janssens-pieter-1', personId: 'p-janssens-pieter', date: d('2025-06-30'), modality: 'echocardiogram', finding: 'absent' },
    { id: 'ph-janssens-lucas-1', personId: 'p-janssens-lucas', date: d('2025-09-15'), modality: 'echocardiogram', finding: 'absent' },
    { id: 'ph-janssens-mila-1', personId: 'p-janssens-mila', date: d('2026-09-02'), modality: 'ecg', finding: 'absent' },
  ],
  surveillancePlans: [
    { id: 'sp-janssens-sarah', personId: 'p-janssens-sarah', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2026-04-20'), nextDueDate: d('2027-04-20') },
    { id: 'sp-janssens-marc', personId: 'p-janssens-marc', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-07-14'), nextDueDate: d('2027-01-14') },
    { id: 'sp-janssens-pieter', personId: 'p-janssens-pieter', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-06-30'), nextDueDate: d('2026-06-30') },
    { id: 'sp-janssens-lucas', personId: 'p-janssens-lucas', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-09-15'), nextDueDate: d('2026-11-12') },
  ],
  reclassificationEvents: [],
}
