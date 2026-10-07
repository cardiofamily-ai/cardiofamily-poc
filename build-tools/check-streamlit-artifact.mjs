// Verifies the committed Streamlit artifact (streamlit_dist/cardiofamily.html):
//  1. it is self-contained (no external scripts, stylesheets, fonts or images),
//  2. it carries the required safety and working-name notices,
//  3. it is up to date: a fresh `vite build --mode streamlit` is byte-identical.
// Run with `npm run check:streamlit`. Regenerate with `npm run build:streamlit`.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ARTIFACT = 'streamlit_dist/cardiofamily.html'
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

if (!existsSync(ARTIFACT)) fail(`${ARTIFACT} is missing — run \`npm run build:streamlit\` and commit it.`)
const files = readdirSync('streamlit_dist')
if (files.length !== 1) fail(`streamlit_dist must contain only cardiofamily.html, found: ${files.join(', ')}`)

const html = readFileSync(ARTIFACT, 'utf8')
const markup = html.replace(/<script type="module">[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '')
if (/<script[^>]*\ssrc=/i.test(markup)) fail('artifact references an external script')
if (/<link[^>]*\shref=/i.test(markup)) fail('artifact references an external stylesheet or icon')
if (/url\((?!data:|#)/.test(html.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? '')) fail('CSS references a non-inlined url()')
for (const text of [
  'Synthetic Data · Demonstration Environment · Not for Clinical Use',
  'CardioFamily is a working prototype name.',
]) {
  if (!html.includes(text)) fail(`artifact is missing the notice: "${text}"`)
}
if (!readFileSync('streamlit_app.py', 'utf8').includes('"streamlit_dist" / "cardiofamily.html"')) {
  fail('streamlit_app.py does not embed streamlit_dist/cardiofamily.html')
}

const outDir = mkdtempSync(join(tmpdir(), 'cardiofamily-streamlit-'))
try {
  execFileSync('npx', ['vite', 'build', '--mode', 'streamlit', '--outDir', outDir, '--emptyOutDir', '--logLevel', 'error'], {
    stdio: 'inherit',
  })
  const fresh = readFileSync(join(outDir, 'cardiofamily.html'), 'utf8')
  if (fresh !== html) fail(`${ARTIFACT} is out of date — run \`npm run build:streamlit\` and commit the result.`)
} finally {
  rmSync(outDir, { recursive: true, force: true })
}
console.log(`✓ ${ARTIFACT} is self-contained, carries the required notices and matches the current source (${(html.length / 1024).toFixed(0)} kB).`)
