import vercel from '../../vercel.json'

describe('Vercel deployment config', () => {
  it('rewrites every path to the SPA entry point (static files are served first by Vercel)', () => {
    expect(vercel.rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }])
  })

  it('declares nothing else: no env, headers, functions or redirects', () => {
    expect(Object.keys(vercel).toSorted()).toEqual(['$schema', 'rewrites'])
  })
})
