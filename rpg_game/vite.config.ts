import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relativi: la PWA e' pubblicata sotto /portfolio/rpg_game/, quindi i path
  // assoluti (/assets/...) punterebbero alla root del dominio e darebbero 404.
  base: './',
  build: {
    // Nomi stabili invece che content-hashed. Il bundle viene consumato da
    // games/rpg.html, che e' HTML statico non generato: con gli hash andrebbe
    // aggiornato a mano a ogni build, ed e' esattamente il motivo per cui quel
    // file puntava a un index-DETqTwaS.js inesistente.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/rpg.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})