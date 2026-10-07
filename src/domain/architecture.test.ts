/**
 * Guards the domain/UI separation: domain code is pure TypeScript and may
 * only import other domain modules. Complements the lint rule, which cannot
 * see relative imports that climb out of src/domain.
 */
const sources = import.meta.glob<string>(['./**/*.ts', '!./**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const IMPORT_PATTERN = /^\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/gm

function resolveRelative(fromFile: string, specifier: string): string {
  // Glob keys look like './time/clock.ts'; drop the leading '.' and file name.
  const parts = fromFile.split('/').slice(1, -1)
  for (const segment of specifier.split('/')) {
    if (segment === '..') {
      if (parts.length === 0 || parts.at(-1) === '..') parts.push('..')
      else parts.pop()
    } else if (segment !== '.') parts.push(segment)
  }
  return parts.join('/')
}

describe('domain layer boundaries', () => {
  const files = Object.entries(sources)

  it('finds domain source files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files.map(([file, source]) => [file, source] as const))(
    '%s imports only from domain/',
    (file, source) => {
      const violations = [...source.matchAll(IMPORT_PATTERN)]
        .map((match) => match[1] as string)
        .filter((specifier) => {
          if (specifier.startsWith('@/domain/')) return false
          if (specifier.startsWith('.')) {
            // Paths are relative to src/domain, so escaping it leaves a leading '..'.
            return resolveRelative(file, specifier).startsWith('..')
          }
          return true // bare packages and other aliases are not allowed
        })
      expect(violations).toEqual([])
    },
  )
})
