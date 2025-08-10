import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  base: './',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
