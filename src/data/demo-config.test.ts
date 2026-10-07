import { DEMO_TODAY } from './demo-config'

describe('demo configuration', () => {
  it('freezes the demonstration date at 2026-10-01', () => {
    expect(DEMO_TODAY).toBe('2026-10-01')
  })
})
