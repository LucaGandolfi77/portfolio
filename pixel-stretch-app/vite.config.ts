/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base: the built app works at ANY mount path — a GitHub Pages
// project site (https://user.github.io/random/), a sub-folder of a portfolio,
// a local `file://` preview, or an Electron `app://` window.
const base = './'

export default defineConfig({
  base,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'coi-sw.js',
      includeAssets: ['favicon.svg', 'icons.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      injectManifest: {
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        // Keep the PWA install light: the ~50MB ONNX WASM + AI/HEIC vendor
        // chunks are only needed on demand, so they are runtime-cached below
        // instead of being precached at install (important on iPhone).
        globIgnores: ['**/ort-*.wasm', '**/transformers-vendor-*', '**/heic-vendor-*', '**/ort-*.mjs'],
      },
      manifest: {
        name: 'Pixel Stretch - Photo Editor',
        short_name: 'Pixel Stretch',
        description: 'Scontorna foto, applica effetti pixel stretch e gestisci livelli. Tutto offline.',
        theme_color: '#00c8ff',
        background_color: '#0d0d0d',
        display: 'standalone',
        orientation: 'any',
        // Relative start_url/scope so installability works at any mount path.
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // @imgly/background-removal models (~40MB once, then offline)
            urlPattern: /^https:\/\/staticimgly\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imgly-models',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            // @huggingface/transformers ormbg model files (~44MB once, then offline)
            urlPattern: /^https:\/\/(?:[a-z0-9-]+\.)*(?:huggingface\.co|hf\.co)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hf-models',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            // WASM/cross-origin model data (onnxruntime)
            urlPattern: /^https:\/\/cdn-lfs\.huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hf-lfs',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            // Same-origin heavy AI chunks (ort wasm, transformers, heic decoder):
            // cached on first use so repeat runs work offline.
            urlPattern: /\/assets\/(ort-|transformers-vendor-|heic-vendor-)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-chunks',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Split heavy AI libs (dynamically imported) out of the initial bundle so
    // first paint on iPhone / slow connections only loads the editor shell.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Keep the lazy AI/HEIC chunks out of the entry's static import graph
        // so they are not eagerly downloaded or preloaded.
        hoistTransitiveImports: false,
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@imgly')) return 'imgly-vendor'
          if (id.includes('onnxruntime') || id.includes('transformers') || id.includes('huggingface')) {
            return 'transformers-vendor'
          }
          if (id.includes('heic-to')) return 'heic-vendor'
          if (id.includes('/react') || id.includes('scheduler')) return 'react-vendor'
          if (id.includes('zustand')) return 'state-vendor'
          if (id.includes('lucide')) return 'icons-vendor'
          return 'vendor'
        },
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal', '@huggingface/transformers'],
  },
})
