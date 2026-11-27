import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      workbox: {
        cacheId: 'after-dusk',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /models\/kit-.*\.glb$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'after-dusk-models-v1',
              expiration: {
                maxEntries: 12,
              },
            },
          },
        ],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        id: './',
        name: 'After Dusk — Keep the Line Open',
        short_name: 'After Dusk',
        description:
          'First-person 3D psychological thriller: step outside at dusk, stay in the pools of light, keep your phone alive, and survive the dark shadows until 6 AM.',
        lang: 'en',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'fullscreen'],
        orientation: 'any',
        background_color: '#070910',
        theme_color: '#070910',
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: 'screens/shot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screens/shot-tall.png', sizes: '750x1334', type: 'image/png', form_factor: 'narrow' },
        ],
        shortcuts: [
          { name: 'New Night', short_name: 'New Night', url: './?mode=story' },
          { name: 'Endless Night', short_name: 'Endless', url: './?mode=classic' },
        ],
      },
    }),
  ],
});
