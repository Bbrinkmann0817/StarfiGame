import { defineConfig } from 'vite';

// Vite config for Operation: Go-Live
// `base: './'` keeps asset paths relative so the build can be hosted anywhere.
export default defineConfig({
  base: './',
  server: {
    host: true,
    open: true,
    port: 5173
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});
