import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

// Package test host: renders the built workspace packages (dist) with the four
// adapters on one page for tests/host. It is not the public guide.
const port = Number(process.env.HAWIYAH_HOST_PORT || 4190);

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), vue()],
  server: { host: '127.0.0.1', port, strictPort: true },
  preview: { host: '127.0.0.1', port, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
  resolve: {
    dedupe: [
      '@angular/core',
      '@angular/common',
      '@angular/forms',
      '@angular/compiler',
      '@angular/platform-browser',
      'rxjs',
      'react',
      'react-dom',
      'vue',
    ],
  },
  esbuild: { tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } } },
});
