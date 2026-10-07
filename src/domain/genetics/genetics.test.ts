import { toIsoDate as d } from '@/domain/time'
import { genotypeStatus } from './genotype'
import { currentInterpretation, interpretationHistory, isPathogenicOrLikelyPathogenic } from './interpretation'
import type { GeneticTest, VariantInterpretation } from './types'

const interp = (id: string, classification: VariantInterpretation['classification'], date: string) => ({
  id, variantId: 'v', classification, effectiveDate: d(date), laboratory: 'Lab (fictional)', reportReference: id,
})

describe('variant interpretation', () => {
  const history = [interp('b', 'likely-pathogenic', '2026-09-22'), interp('a', 'vus', '2023-03-14')]

  it('orders history oldest first', () => {
    expect(interpretationHistory(history, 'v').map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('uses the latest interpretation effective on or before today', () => {
    expect(currentInterpretation(history, 'v', d('2026-10-01'))?.id).toBe('b')
    expect(currentInterpretation(history, 'v', d('2026-09-21'))?.id).toBe('a')
    expect(currentInterpretation(history, 'v', d('2020-01-01'))).toBeUndefined()
  })

  it('identifies P/LP classifications', () => {
    expect(isPathogenicOrLikelyPathogenic('pathogenic')).toBe(true)
    expect(isPathogenicOrLikelyPathogenic('likely-pathogenic')).toBe(true)
    expect(isPathogenicOrLikelyPathogenic('vus')).toBe(false)
    expect(isPathogenicOrLikelyPathogenic('likely-benign')).toBe(false)
  })
})

describe('genotypeStatus', () => {
  const base = { personId: 'p', variantId: 'v', kind: 'cascade' as const, requestedDate: d('2026-01-01') }
  const status = (tests: GeneticTest[]) => genotypeStatus(tests, 'p', 'v').status

  it('is untested with no tests', () => {
    expect(status([])).toBe('untested')
  })

  it.each([
    [{ ...base, id: 't', status: 'resulted', resultDate: d('2026-02-01'), outcome: 'detected' }, 'positive'],
    [{ ...base, id: 't', status: 'resulted', resultDate: d('2026-02-01'), outcome: 'not-detected' }, 'negative'],
    [{ ...base, id: 't', status: 'sample-pending' }, 'pending'],
    [{ ...base, id: 't', status: 'offered' }, 'pending'],
    [{ ...base, id: 't', status: 'declined' }, 'declined'],
  ] as const)('maps a %o test to %s', (test, expected) => {
    expect(status([test])).toBe(expected)
  })

  it('uses the most recent test', () => {
    expect(
      status([
        { ...base, id: 't1', status: 'declined' },
        { ...base, id: 't2', requestedDate: d('2026-03-01'), status: 'resulted', resultDate: d('2026-04-01'), outcome: 'not-detected' },
      ]),
    ).toBe('negative')
  })

  it('ignores tests for other people or variants', () => {
    expect(
      status([{ ...base, id: 't', personId: 'other', status: 'resulted', resultDate: d('2026-02-01'), outcome: 'detected' }]),
    ).toBe('untested')
  })
})
