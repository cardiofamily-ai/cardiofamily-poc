/**
 * Structural integrity of the synthetic dataset. These guard against seed
 * edits that would silently break references or the demo story.
 */
import { DEMO_TODAY } from '@/data/demo-config'
import { genotypeStatus } from '@/domain/genetics/genotype'
import { currentInterpretation } from '@/domain/genetics/interpretation'
import { ageOn, isIsoDate, type IsoDate } from '@/domain/time'
import { SYNTHETIC_FAMILIES } from '.'

const families = SYNTHETIC_FAMILIES.map((s) => [s.family.name, s] as const)

function allIds() {
  return SYNTHETIC_FAMILIES.flatMap((s) => [
    s.family.id,
    ...s.people.map((p) => p.id),
    ...s.variants.map((v) => v.id),
    ...s.interpretations.map((i) => i.id),
    ...s.geneticTests.map((t) => t.id),
    ...s.phenotypeAssessments.map((a) => a.id),
    ...s.surveillancePlans.map((p) => p.id),
    ...s.reclassificationEvents.flatMap((e) => [e.id, e.newInterpretation.id]),
  ])
}

describe('synthetic dataset', () => {
  it('has globally unique ids', () => {
    const ids = allIds()
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(duplicates).toEqual([])
  })

  it('has unique family display codes and synthetic variant labels', () => {
    const codes = SYNTHETIC_FAMILIES.map((s) => s.family.displayCode)
    const labels = SYNTHETIC_FAMILIES.flatMap((s) => s.variants.map((v) => v.syntheticLabel))
    expect(new Set(codes).size).toBe(codes.length)
    expect(new Set(labels).size).toBe(labels.length)
    for (const label of labels) expect(label).toMatch(/^SYN-VAR-\d{3}$/)
  })

  it('contains two detailed families and three lightweight ones', () => {
    expect(SYNTHETIC_FAMILIES.map((s) => s.family.id)).toEqual([
      'fam-janssens', 'fam-peeters', 'fam-maes', 'fam-dubois', 'fam-wouters',
    ])
  })
})

describe.each(families)('%s', (_name, s) => {
  const personIds = new Set(s.people.map((p) => p.id))
  const variantIds = new Set(s.variants.map((v) => v.id))
  const byId = new Map(s.people.map((p) => [p.id, p]))

  it('marks the family, every person and every variant as synthetic', () => {
    expect(s.family.synthetic).toBe(true)
    for (const p of s.people) expect(p.synthetic).toBe(true)
    for (const v of s.variants) expect(v.synthetic).toBe(true)
  })

  it('names only fictional institutions', () => {
    expect(s.family.centre).toMatch(/\(fictional\)$/)
    const labs = [...s.interpretations, ...s.reclassificationEvents.map((e) => e.newInterpretation)]
    for (const i of labs) {
      expect(i.laboratory).toMatch(/\(fictional\)$/)
      expect(i.reportReference).toMatch(/^SYN-/)
    }
  })

  it('assigns every record to this family', () => {
    for (const p of s.people) expect(p.familyId).toBe(s.family.id)
    for (const v of s.variants) expect(v.familyId).toBe(s.family.id)
    for (const e of s.reclassificationEvents) expect(e.familyId).toBe(s.family.id)
  })

  it('has no dangling person or variant references', () => {
    const personRefs = [
      ...s.geneticTests.map((t) => t.personId),
      ...s.phenotypeAssessments.map((a) => a.personId),
      ...s.surveillancePlans.map((p) => p.personId),
      ...s.people.flatMap((p) => p.parentIds),
      s.family.probandId,
    ]
    const variantRefs = [
      ...s.interpretations.map((i) => i.variantId),
      ...s.geneticTests.map((t) => t.variantId),
      ...s.reclassificationEvents.flatMap((e) => [e.variantId, e.newInterpretation.variantId]),
    ]
    expect(personRefs.filter((id) => !personIds.has(id))).toEqual([])
    expect(variantRefs.filter((id) => !variantIds.has(id))).toEqual([])
  })

  it('has valid parent links: at most two, no self-reference, no cycles, plausible ages', () => {
    for (const p of s.people) {
      expect(p.parentIds.length).toBeLessThanOrEqual(2)
      expect(new Set(p.parentIds).size).toBe(p.parentIds.length)
      expect(p.parentIds).not.toContain(p.id)
      for (const parentId of p.parentIds) {
        const parent = byId.get(parentId)!
        expect(ageOn(parent.dateOfBirth, p.dateOfBirth)).toBeGreaterThanOrEqual(16)
      }
      // Walk ancestors; a cycle would revisit the starting person.
      const seen = new Set<string>()
      const stack = [...p.parentIds]
      while (stack.length) {
        const id = stack.pop()!
        expect(id).not.toBe(p.id)
        if (!seen.has(id)) {
          seen.add(id)
          stack.push(...byId.get(id)!.parentIds)
        }
      }
    }
  })

  it('has a living proband who is genotype positive on a diagnostic test', () => {
    const proband = byId.get(s.family.probandId)!
    expect(proband.deceasedDate).toBeUndefined()
    const diagnostic = s.geneticTests.filter((t) => t.personId === proband.id && t.kind === 'diagnostic')
    expect(diagnostic).toHaveLength(1)
    expect(genotypeStatus(s.geneticTests, proband.id, diagnostic[0]!.variantId).status).toBe('positive')
  })

  it('has exactly one diagnostic test (the proband’s); all others are cascade tests', () => {
    expect(s.geneticTests.filter((t) => t.kind === 'diagnostic').map((t) => t.personId)).toEqual([
      s.family.probandId,
    ])
  })

  it('has a current interpretation for every variant on the demo date', () => {
    for (const v of s.variants) {
      expect(currentInterpretation(s.interpretations, v.id, DEMO_TODAY)).toBeDefined()
    }
  })

  it('uses valid dates, with historical events on or before the demo date', () => {
    const historical: [string, IsoDate][] = [
      ...s.people.flatMap((p) => [[`${p.id} dob`, p.dateOfBirth] as [string, IsoDate],
        ...(p.deceasedDate ? [[`${p.id} deceased`, p.deceasedDate] as [string, IsoDate]] : [])]),
      ...s.interpretations.map((i) => [i.id, i.effectiveDate] as [string, IsoDate]),
      ...s.geneticTests.flatMap((t) => [[`${t.id} requested`, t.requestedDate] as [string, IsoDate],
        ...(t.status === 'resulted' ? [[`${t.id} result`, t.resultDate] as [string, IsoDate]] : [])]),
      ...s.phenotypeAssessments.map((a) => [a.id, a.date] as [string, IsoDate]),
      ...s.surveillancePlans.flatMap((p) => (p.lastReviewDate ? [[p.id, p.lastReviewDate] as [string, IsoDate]] : [])),
      ...s.reclassificationEvents.flatMap((e) => [[e.id, e.receivedDate] as [string, IsoDate],
        [e.newInterpretation.id, e.newInterpretation.effectiveDate] as [string, IsoDate]]),
    ]
    for (const [label, date] of historical) {
      expect(isIsoDate(date), label).toBe(true)
      expect(date <= DEMO_TODAY, `${label} (${date}) is after the demo date`).toBe(true)
    }
  })

  it('has events only between a person’s birth and death', () => {
    const events: [string, IsoDate][] = [
      ...s.geneticTests.map((t) => [t.personId, t.requestedDate] as [string, IsoDate]),
      ...s.phenotypeAssessments.map((a) => [a.personId, a.date] as [string, IsoDate]),
      ...s.surveillancePlans.flatMap((p) => (p.lastReviewDate ? [[p.personId, p.lastReviewDate] as [string, IsoDate]] : [])),
    ]
    for (const [personId, date] of events) {
      const p = byId.get(personId)!
      expect(date >= p.dateOfBirth, `${personId} event before birth`).toBe(true)
      if (p.deceasedDate) expect(date <= p.deceasedDate, `${personId} event after death`).toBe(true)
    }
  })

  it('has internally consistent genetic tests', () => {
    for (const t of s.geneticTests) {
      if (t.status === 'resulted') expect(t.resultDate >= t.requestedDate).toBe(true)
      if ((t.status === 'offered' || t.status === 'sample-pending') && t.expectedResultDate) {
        expect(t.expectedResultDate >= t.requestedDate).toBe(true)
      }
    }
  })

  it('has surveillance plans for living people, due after their last review', () => {
    for (const p of s.surveillancePlans) {
      expect(byId.get(p.personId)!.deceasedDate).toBeUndefined()
      if (p.lastReviewDate) expect(p.nextDueDate > p.lastReviewDate).toBe(true)
    }
  })

  it('has internally consistent reclassification events', () => {
    for (const e of s.reclassificationEvents) {
      const previous = s.interpretations.find((i) => i.id === e.previousInterpretationId)
      expect(previous, 'previous interpretation exists').toBeDefined()
      expect(previous!.variantId).toBe(e.variantId)
      // The previous interpretation was the one in force when the report arrived.
      expect(currentInterpretation(s.interpretations, e.variantId, e.receivedDate)?.id).toBe(previous!.id)
      expect(e.newInterpretation.variantId).toBe(e.variantId)
      expect(e.newInterpretation.classification).not.toBe(previous!.classification)
      expect(e.newInterpretation.effectiveDate > previous!.effectiveDate).toBe(true)
      expect(e.newInterpretation.effectiveDate <= e.receivedDate).toBe(true)
      // The new interpretation is not yet part of the recorded history.
      expect(s.interpretations.some((i) => i.id === e.newInterpretation.id)).toBe(false)
    }
  })
})

describe('synthetic institutions', () => {
  it('do not name real places that could imply a real centre or laboratory', () => {
    const names = SYNTHETIC_FAMILIES.flatMap((s) => [
      s.family.centre,
      ...s.interpretations.map((i) => i.laboratory),
      ...s.reclassificationEvents.map((e) => e.newInterpretation.laboratory),
    ])
    for (const name of names) {
      expect(name).not.toMatch(/Leuven|Gent|Ghent|Antwerp|Brussel|Brabant|Liège|Luik|Bruges|Brugge|UZ |University Hospital/i)
    }
  })
})
