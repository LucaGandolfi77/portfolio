import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: { host: true, port: 5176 },
  preview: { host: true, port: 4176 },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] }
      }
    }
  },
  test: {
    setupFiles: ['tests/setup.ts']
  }
});
