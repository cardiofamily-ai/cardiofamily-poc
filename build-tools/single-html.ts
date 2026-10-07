import type { Plugin } from 'vite'

/**
 * Inlines the entry JS chunk and CSS into the built HTML and emits it under
 * `fileName`, producing one self-contained document (fonts and images are
 * inlined as data URIs via `assetsInlineLimit`). Used only by the Streamlit
 * build, which embeds the app as a single local HTML file.
 */
export function singleHtml(fileName: string): Plugin {
  return {
    name: 'cardiofamily:single-html',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const page = Object.values(bundle).find((f) => f.type === 'asset' && f.fileName.endsWith('.html'))
      if (!page || page.type !== 'asset') throw new Error('single-html: no HTML entry in bundle')
      let html = String(page.source)

      for (const [name, output] of Object.entries(bundle)) {
        const ref = new RegExp(`<(script|link)[^>]*(?:src|href)="[^"]*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>(?:</script>)?`)
        if (output.type === 'chunk' && output.isEntry) {
          // Escape closing tags so inlined JS cannot terminate the script element.
          const code = output.code.replace(/<\/script/gi, '<\\/script')
          html = html.replace(ref, () => `<script type="module">${code}</script>`)
          delete bundle[name]
        } else if (output.type === 'asset' && name.endsWith('.css')) {
          html = html.replace(ref, () => `<style>${String(output.source)}</style>`)
          delete bundle[name]
        }
      }

      // No external favicon request from the embedded document.
      html = html.replace(/<link rel="icon"[^>]*>\s*/, '')
      const leftovers = Object.keys(bundle).filter((k) => bundle[k] !== page)
      if (leftovers.length > 0 || /(?:src|href)="\/assets\//.test(html)) {
        throw new Error(`single-html: unexpected separate assets: ${leftovers.join(', ')}`)
      }
      page.fileName = fileName
      page.source = html
    },
  }
}
