import type { Person, PersonId, Sex } from './types'

export type RelationKind =
  | 'self'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'half-sibling'
  | 'grandparent'
  | 'grandchild'
  | 'aunt-uncle'
  | 'niece-nephew'
  | 'cousin'
  | 'other-blood-relative'
  | 'co-parent'
  | 'unrelated'

export interface Kinship {
  /** How `to` is related to `from`, e.g. 'parent' means `to` is a parent of `from`. */
  readonly relation: RelationKind
  /** Degree of blood relationship; null when not blood-related. 0 for self. */
  readonly degree: number | null
  /** Sex-specific label, e.g. "Brother". */
  readonly label: string
}

const LABELS: Record<RelationKind, string | Record<Sex, string>> = {
  self: 'Self',
  parent: { male: 'Father', female: 'Mother' },
  child: { male: 'Son', female: 'Daughter' },
  sibling: { male: 'Brother', female: 'Sister' },
  'half-sibling': { male: 'Half-brother', female: 'Half-sister' },
  grandparent: { male: 'Grandfather', female: 'Grandmother' },
  grandchild: { male: 'Grandson', female: 'Granddaughter' },
  'aunt-uncle': { male: 'Uncle', female: 'Aunt' },
  'niece-nephew': { male: 'Nephew', female: 'Niece' },
  cousin: 'Cousin',
  'other-blood-relative': 'Blood relative',
  'co-parent': { male: 'Father', female: 'Mother' }, // completed with the children's names
  unrelated: 'Not a blood relative',
}

/** Minimum generational distance from a person to each recorded ancestor (self = 0). */
function ancestorDistances(byId: ReadonlyMap<PersonId, Person>, id: PersonId) {
  const distances = new Map<PersonId, number>([[id, 0]])
  const queue: PersonId[] = [id]
  while (queue.length > 0) {
    const current = queue.shift() as PersonId
    const distance = distances.get(current) as number
    for (const parentId of byId.get(current)?.parentIds ?? []) {
      if (!distances.has(parentId)) {
        distances.set(parentId, distance + 1)
        queue.push(parentId)
      }
    }
  }
  return distances
}

function classify(fromDistance: number, toDistance: number, sharedCouple: boolean): RelationKind {
  if (toDistance === 0) {
    return fromDistance === 1 ? 'parent' : fromDistance === 2 ? 'grandparent' : 'other-blood-relative'
  }
  if (fromDistance === 0) {
    return toDistance === 1 ? 'child' : toDistance === 2 ? 'grandchild' : 'other-blood-relative'
  }
  if (fromDistance === 1 && toDistance === 1) return sharedCouple ? 'sibling' : 'half-sibling'
  if (fromDistance === 2 && toDistance === 1) return 'aunt-uncle'
  if (fromDistance === 1 && toDistance === 2) return 'niece-nephew'
  if (fromDistance === 2 && toDistance === 2) return 'cousin'
  return 'other-blood-relative'
}

/**
 * Derives how `toId` is related to `fromId` from recorded parent links.
 * Degree counts meioses: relatives connected through a shared couple
 * (e.g. full siblings) are one degree closer than through a single ancestor.
 */
export function kinship(people: readonly Person[], fromId: PersonId, toId: PersonId): Kinship {
  const byId = new Map(people.map((person) => [person.id, person]))
  const to = byId.get(toId)
  if (!byId.has(fromId) || !to) {
    throw new Error(`Unknown person in kinship lookup: ${fromId} → ${toId}`)
  }
  const label = (relation: RelationKind) => {
    const entry = LABELS[relation]
    return typeof entry === 'string' ? entry : entry[to.sex]
  }

  if (fromId === toId) return { relation: 'self', degree: 0, label: label('self') }

  const fromAncestors = ancestorDistances(byId, fromId)
  const toAncestors = ancestorDistances(byId, toId)

  let best: { from: number; to: number; count: number } | null = null
  for (const [ancestorId, fromDistance] of fromAncestors) {
    const toDistance = toAncestors.get(ancestorId)
    if (toDistance === undefined) continue
    const sum = fromDistance + toDistance
    if (!best || sum < best.from + best.to) {
      best = { from: fromDistance, to: toDistance, count: 1 }
    } else if (sum === best.from + best.to && fromDistance === best.from) {
      best.count += 1
    }
  }

  if (best) {
    const directLine = best.from === 0 || best.to === 0
    const sharedCouple = !directLine && best.count >= 2
    const relation = classify(best.from, best.to, sharedCouple)
    const degree = best.from + best.to - (sharedCouple ? 1 : 0)
    return { relation, degree, label: label(relation) }
  }

  // Shared children establish parentage only; no partnership is inferred.
  const sharedChildren = people
    .filter((p) => p.parentIds.includes(fromId) && p.parentIds.includes(toId))
    .toSorted((a, b) => a.dateOfBirth.localeCompare(b.dateOfBirth))
  if (sharedChildren.length > 0) {
    const names = sharedChildren.map((c) => c.givenName)
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
    return { relation: 'co-parent', degree: null, label: `${label('co-parent')} of ${list}` }
  }
  return { relation: 'unrelated', degree: null, label: label('unrelated') }
}

export function isBloodRelative(k: Kinship): boolean {
  return k.degree !== null
}
