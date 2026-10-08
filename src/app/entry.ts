export const WELCOME_PATH = '/welcome'
export const GUIDE_PATH = '/guide'

/**
 * Where a fresh page load starts: the app root opens the Welcome page, while
 * any other (deep-linked) path opens directly. Nothing is remembered between
 * loads; there is no tracking.
 */
export function entryPath(pathname: string): string {
  return pathname === '/' ? WELCOME_PATH : pathname
}
