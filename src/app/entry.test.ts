import { entryPath, WELCOME_PATH } from './entry'

describe('entryPath', () => {
  it('opens the Welcome page on a fresh load of the app root', () => {
    expect(entryPath('/')).toBe(WELCOME_PATH)
  })

  it.each(['/families', '/actions', '/portal', '/guide', WELCOME_PATH])('keeps deep link %s', (path) => {
    expect(entryPath(path)).toBe(path)
  })
})
