/**
 * Generational pedigree layout for small synthetic families. Pure geometry:
 * it positions recorded people and draws parent → child connections. It is
 * not a general pedigree engine (no consanguinity loops, no multiple
 * partnerships per person, no twins).
 */
import type { Person, PersonId } from '@/domain/family/types'

export const SLOT_WIDTH = 136
export const ROW_HEIGHT = 176
export const SYMBOL_SIZE = 40
const TOP_PADDING = 36

export interface PlacedNode {
  readonly personId: PersonId
  /** Centre of the symbol. */
  readonly x: number
  readonly y: number
  readonly generation: number
}

export interface Segment {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  /** 'parents' joins two recorded parents; 'descent' connects parents to children. */
  readonly kind: 'parents' | 'descent'
}

export interface PedigreeLayout {
  readonly nodes: readonly PlacedNode[]
  readonly segments: readonly Segment[]
  readonly width: number
  readonly height: number
}

interface Unit {
  /** One person, or two recorded parents of the same children (left → right). */
  readonly anchors: readonly PersonId[]
  readonly children: readonly PersonId[]
}

export function layoutPedigree(people: readonly Person[]): PedigreeLayout {
  const byId = new Map(people.map((p) => [p.id, p]))
  const hasParents = (id: PersonId) => (byId.get(id)?.parentIds.length ?? 0) > 0
  const byBirth = (a: PersonId, b: PersonId) =>
    byId.get(a)!.dateOfBirth.localeCompare(byId.get(b)!.dateOfBirth) || a.localeCompare(b)
  const maleFirst = (a: PersonId, b: PersonId) =>
    (byId.get(a)!.sex === 'male' ? 0 : 1) - (byId.get(b)!.sex === 'male' ? 0 : 1)

  const coParents = (id: PersonId) => [
    ...new Set(
      people.filter((p) => p.parentIds.includes(id)).flatMap((p) => p.parentIds.filter((q) => q !== id)),
    ),
  ]
  // A parent with no recorded parents whose children's other parent is a descendant.
  const joinsThroughChildren = (id: PersonId) =>
    !hasParents(id) && coParents(id).length > 0 && coParents(id).every(hasParents)

  const unitFor = (id: PersonId): Unit => {
    const partner = coParents(id).find(joinsThroughChildren)
    const anchors = partner ? [id, partner].toSorted(maleFirst) : [id]
    const children = people
      .filter((p) => p.parentIds.includes(id) && p.parentIds.every((q) => anchors.includes(q)))
      .map((p) => p.id)
      .toSorted(byBirth)
    return { anchors, children }
  }

  // Root units: founders (no recorded parents) who are not joining through children.
  const roots: Unit[] = []
  const rooted = new Set<PersonId>()
  for (const person of people.toSorted((a, b) => byBirth(a.id, b.id))) {
    if (hasParents(person.id) || joinsThroughChildren(person.id) || rooted.has(person.id)) continue
    const partner = coParents(person.id).find((q) => !hasParents(q))
    const anchors = partner ? [person.id, partner].toSorted(maleFirst) : [person.id]
    anchors.forEach((a) => rooted.add(a))
    const children = people
      .filter((p) => p.parentIds.length > 0 && p.parentIds.every((q) => anchors.includes(q)))
      .map((p) => p.id)
      .toSorted(byBirth)
    roots.push({ anchors, children })
  }

  const widthCache = new Map<PersonId, number>()
  const unitWidth = (unit: Unit): number => {
    const key = unit.anchors.join('+')
    const cached = widthCache.get(key)
    if (cached !== undefined) return cached
    const childrenWidth = unit.children.reduce((w, c) => w + unitWidth(unitFor(c)), 0)
    const width = Math.max(unit.anchors.length * SLOT_WIDTH, childrenWidth)
    widthCache.set(key, width)
    return width
  }

  const nodes = new Map<PersonId, PlacedNode>()
  const segments: Segment[] = []
  const rowY = (generation: number) => TOP_PADDING + SYMBOL_SIZE / 2 + generation * ROW_HEIGHT

  const place = (unit: Unit, left: number, generation: number) => {
    const width = unitWidth(unit)
    const y = rowY(generation)
    const anchorsLeft = left + (width - unit.anchors.length * SLOT_WIDTH) / 2
    unit.anchors.forEach((id, i) => {
      if (!nodes.has(id)) {
        nodes.set(id, { personId: id, x: anchorsLeft + SLOT_WIDTH * (i + 0.5), y, generation })
      }
    })

    if (unit.children.length === 0) return
    const childUnits = unit.children.map(unitFor)
    const childrenWidth = childUnits.reduce((w, u) => w + unitWidth(u), 0)
    let x = left + (width - childrenWidth) / 2
    for (const child of childUnits) {
      place(child, x, generation + 1)
      x += unitWidth(child)
    }

    // Connections
    const parentNodes = unit.anchors.map((id) => nodes.get(id)!)
    const sibshipY = y + ROW_HEIGHT / 2
    let dropX: number
    let dropFromY: number
    if (parentNodes.length === 2) {
      const [a, b] = parentNodes as [PlacedNode, PlacedNode]
      segments.push({ x1: a.x + SYMBOL_SIZE / 2, y1: y, x2: b.x - SYMBOL_SIZE / 2, y2: y, kind: 'parents' })
      dropX = (a.x + b.x) / 2
      dropFromY = y
    } else {
      dropX = parentNodes[0]!.x
      dropFromY = y + SYMBOL_SIZE / 2
    }
    const childXs = unit.children.map((id) => nodes.get(id)!.x)
    const minX = Math.min(dropX, ...childXs)
    const maxX = Math.max(dropX, ...childXs)
    segments.push({ x1: dropX, y1: dropFromY, x2: dropX, y2: sibshipY, kind: 'descent' })
    if (maxX > minX) segments.push({ x1: minX, y1: sibshipY, x2: maxX, y2: sibshipY, kind: 'descent' })
    for (const cx of childXs) {
      segments.push({ x1: cx, y1: sibshipY, x2: cx, y2: rowY(generation + 1) - SYMBOL_SIZE / 2, kind: 'descent' })
    }
  }

  let left = 0
  for (const root of roots) {
    place(root, left, 0)
    left += unitWidth(root)
  }

  // Anyone not reachable from a root (not expected in seed data) is shown on the top row.
  for (const person of people) {
    if (!nodes.has(person.id)) {
      nodes.set(person.id, { personId: person.id, x: left + SLOT_WIDTH / 2, y: rowY(0), generation: 0 })
      left += SLOT_WIDTH
    }
  }

  const placed = [...nodes.values()]
  const generations = Math.max(...placed.map((n) => n.generation)) + 1
  return {
    nodes: people.map((p) => nodes.get(p.id)!),
    segments,
    width: left,
    height: TOP_PADDING + generations * ROW_HEIGHT - (ROW_HEIGHT - SYMBOL_SIZE) + 72,
  }
}
