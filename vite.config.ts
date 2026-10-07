/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { singleHtml } from './build-tools/single-html.ts'

export default defineConfig(({ mode }) => {
  // `vite build --mode streamlit` produces streamlit_dist/cardiofamily.html: one
  // self-contained file (JS, CSS and fonts inlined) for the Streamlit wrapper.
  const streamlit = mode === 'streamlit'
  return {
    plugins: [react(), tailwindcss(), ...(streamlit ? [singleHtml('cardiofamily.html')] : [])],
    build: streamlit
      ? {
          outDir: 'streamlit_dist',
          emptyOutDir: true,
          copyPublicDir: false,
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          cssCodeSplit: false,
          modulePreload: false,
          chunkSizeWarningLimit: 1200,
        }
      : {
          // Single ~150 kB (gzip) bundle is acceptable for this demonstration; route
          // code-splitting is not worth the added complexity at this size.
          chunkSizeWarningLimit: 600,
        },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }
})
