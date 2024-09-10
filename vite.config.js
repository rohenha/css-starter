/* ──────────────────────────────────────────────────────────
►►► Vite Config
────────────────────────────────────────────────────────── */
import { defineConfig } from 'vite'
/* ─────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────── */

export default () =>
  defineConfig({
    build: {
      emptyOutDir: true,
      manifest: true,
      sourcemap: false,
      minify: 'esbuild',
      assetsDir: './',
      outDir: `dist/`,
    },
  })
