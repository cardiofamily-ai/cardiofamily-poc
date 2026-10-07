/**
 * Peeters family — reclassification-impact demonstration family.
 * Entirely synthetic: no person, variant or event corresponds to a real one.
 *
 * The proband's MYH7 variant was reported as a VUS in 2023. A synthetic
 * laboratory report received on 2026-09-24 reclassifies it as Likely
 * pathogenic. Relatives are on clinical screening only and have not been
 * offered cascade testing.
 *
 *   Jozef (†) ═╤═ Maria
 *        ┌─────┴─────┐
 *      Hilde      Koen* ═╤═ Sofie
 *                   ┌────┴────┐
 *                  Bram      Lotte          (* proband)
 */
import type { FamilySnapshot } from '@/domain/snapshot'
import { toIsoDate as d } from '@/domain/time'
import { personFactory } from './builders'
import { DEMO_CENTRE, DEMO_LAB_B, SCREENING_DESCRIPTION } from './institutions'

const FAMILY = 'fam-peeters'
const VARIANT = 'var-peeters-myh7'

const person = personFactory(FAMILY)

export const peetersFamily: FamilySnapshot = {
  family: {
    id: FAMILY,
    name: 'Peeters family',
    displayCode: 'SYN-FAM-002',
    probandId: 'p-peeters-koen',
    centre: DEMO_CENTRE,
    synthetic: true,
  },
  people: [
    { ...person('p-peeters-jozef', 'Jozef', 'Peeters', 'male', '1946-08-11'), deceasedDate: d('2004-02-10') },
    person('p-peeters-maria', 'Maria', 'Lambrecht', 'female', '1950-12-02'),
    person('p-peeters-hilde', 'Hilde', 'Peeters', 'female', '1978-07-19', ['p-peeters-jozef', 'p-peeters-maria']),
    person('p-peeters-koen', 'Koen', 'Peeters', 'male', '1975-04-03', ['p-peeters-jozef', 'p-peeters-maria']),
    person('p-peeters-sofie', 'Sofie', 'Mertens', 'female', '1976-10-25'),
    person('p-peeters-bram', 'Bram', 'Peeters', 'male', '2004-02-14', ['p-peeters-koen', 'p-peeters-sofie']),
    person('p-peeters-lotte', 'Lotte', 'Peeters', 'female', '2009-09-08', ['p-peeters-koen', 'p-peeters-sofie']),
  ],
  variants: [
    { id: VARIANT, familyId: FAMILY, gene: 'MYH7', syntheticLabel: 'SYN-VAR-002', synthetic: true },
  ],
  interpretations: [
    {
      id: 'int-peeters-1',
      variantId: VARIANT,
      classification: 'vus',
      effectiveDate: d('2023-03-14'),
      laboratory: DEMO_LAB_B,
      reportReference: 'SYN-MDG-2023-0877',
    },
  ],
  geneticTests: [
    { id: 'gt-peeters-koen', personId: 'p-peeters-koen', variantId: VARIANT, kind: 'diagnostic',
      requestedDate: d('2023-01-09'), status: 'resulted', resultDate: d('2023-03-14'), outcome: 'detected' },
  ],
  phenotypeAssessments: [
    { id: 'ph-peeters-koen-1', personId: 'p-peeters-koen', date: d('2022-11-28'), modality: 'echocardiogram', finding: 'present' },
    { id: 'ph-peeters-koen-2', personId: 'p-peeters-koen', date: d('2025-11-18'), modality: 'cardiac-mri', finding: 'present' },
    { id: 'ph-peeters-maria-1', personId: 'p-peeters-maria', date: d('2023-05-09'), modality: 'echocardiogram', finding: 'absent' },
    { id: 'ph-peeters-hilde-1', personId: 'p-peeters-hilde', date: d('2024-12-03'), modality: 'echocardiogram', finding: 'absent' },
    { id: 'ph-peeters-bram-1', personId: 'p-peeters-bram', date: d('2025-05-27'), modality: 'echocardiogram', finding: 'absent' },
    { id: 'ph-peeters-lotte-1', personId: 'p-peeters-lotte', date: d('2025-12-10'), modality: 'echocardiogram', finding: 'absent' },
  ],
  surveillancePlans: [
    { id: 'sp-peeters-koen', personId: 'p-peeters-koen', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-11-18'), nextDueDate: d('2026-11-18') },
    { id: 'sp-peeters-hilde', personId: 'p-peeters-hilde', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2024-12-03'), nextDueDate: d('2026-12-03') },
    { id: 'sp-peeters-bram', personId: 'p-peeters-bram', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-05-27'), nextDueDate: d('2026-05-27') },
    { id: 'sp-peeters-lotte', personId: 'p-peeters-lotte', description: SCREENING_DESCRIPTION,
      status: 'active', lastReviewDate: d('2025-12-10'), nextDueDate: d('2026-12-10') },
  ],
  reclassificationEvents: [
    {
      id: 'rc-peeters-1',
      familyId: FAMILY,
      variantId: VARIANT,
      previousInterpretationId: 'int-peeters-1',
      newInterpretation: {
        id: 'int-peeters-2',
        variantId: VARIANT,
        classification: 'likely-pathogenic',
        effectiveDate: d('2026-09-22'),
        laboratory: DEMO_LAB_B,
        reportReference: 'SYN-MDG-2026-1203',
      },
      receivedDate: d('2026-09-24'),
    },
  ],
}
