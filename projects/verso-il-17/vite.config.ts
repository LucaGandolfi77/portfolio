import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Configurazione Vite + PWA.
 *
 * Nota su iOS/Safari: il service worker generato da vite-plugin-pwa (Workbox)
 * è supportato correttamente da Safari 11.3+ e rende l'app utilizzabile offline
 * una volta aggiunta alla schermata Home.
 */
export default defineConfig({
  // Il progetto è pensato per essere servito da una cartella dedicata (root del sito).
  // Per pubblicarlo in una sottocartella, cambia `base` in '/nome-cartella/' e
  // aggiorna il percorso di registrazione del service worker in src/main.tsx.
  base: '/',
  build: {
    target: 'es2020',
    cssTarget: 'safari15',
    sourcemap: false,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: null, // la registrazione è fatta a mano in src/main.tsx
      includeAssets: [
        'icons/apple-touch-icon.png',
        'icons/icon.svg',
        'icons/favicon.svg',
        'icons/splash.svg',
      ],
      manifest: {
        name: 'Verso il 17 ottobre — Monza Precision Team',
        short_name: 'Verso il 17',
        description:
          'Il diario segreto del Monza Precision Team verso i Campionati del Mondo di pattinaggio artistico a rotelle sincronizzato in Paraguay: countdown e una casella al giorno fino al 17 ottobre.',
        lang: 'it',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        background_color: '#fdf6f0',
        theme_color: '#fdf6f0',
        categories: ['lifestyle', 'sports', 'entertainment'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        // L'app è minuscola: una precache completa tiene il primo avvio sotto il secondo.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: true,
    port: 5178,
  },
  preview: {
    host: true,
    port: 4178,
  },
});
