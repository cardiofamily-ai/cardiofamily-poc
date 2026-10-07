import type { FamilySnapshot } from '@/domain/snapshot'
import { duboisFamily, maesFamily, woutersFamily } from './dashboard-families'
import { janssensFamily } from './janssens'
import { peetersFamily } from './peeters'

/** All synthetic families, in display order. */
export const SYNTHETIC_FAMILIES: readonly FamilySnapshot[] = [
  janssensFamily,
  peetersFamily,
  maesFamily,
  duboisFamily,
  woutersFamily,
]

export function getFamilySnapshot(familyId: string): FamilySnapshot | undefined {
  return SYNTHETIC_FAMILIES.find((s) => s.family.id === familyId)
}
