import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',
  base: './',
  envDir: '.',
  envPrefix: ['VITE_', 'SHEET_'],
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
