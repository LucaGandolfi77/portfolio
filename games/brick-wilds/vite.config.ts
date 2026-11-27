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
        cacheId: 'brick-wilds',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        id: './',
        name: 'Brick-Wilds: Synth-Beast Chronicles',
        short_name: 'Brick-Wilds',
        description:
          'Isometric 3D toy-block diorama action-adventure: hunt modular Synth-Beasts with elemental weak-point combat, customize Hearth-Haven village, and play 2-player local co-op.',
        lang: 'en',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'fullscreen'],
        orientation: 'landscape',
        background_color: '#10212e',
        theme_color: '#e85d22',
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
          { name: 'Hearth-Haven Hub', short_name: 'Hub', url: './?start=hub' },
          { name: 'Quick Expedition', short_name: 'Hunt', url: './?start=expedition' },
        ],
      },
    }),
  ],
});
