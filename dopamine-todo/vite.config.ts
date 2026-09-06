import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Browsers (and installed PWAs) cache favicon/app-icon URLs very aggressively,
// independent of normal HTTP caching. Since the icon files always live at the
// same path, a content hash appended as a query string is what actually forces
// a refetch whenever the icon image changes.
const iconSourcePath = fileURLToPath(new URL('./scripts/icon-source.webp', import.meta.url))
const iconVersion = createHash('md5').update(readFileSync(iconSourcePath)).digest('hex').slice(0, 8)
process.env.VITE_ICON_VERSION = iconVersion

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      // Hash the manifest filename itself so a cached copy of manifest.webmanifest
      // (browser HTTP cache, or a stale installed PWA) can never keep pointing at
      // old icon references — the URL changes whenever the icon does.
      manifestFilename: `manifest.${iconVersion}.webmanifest`,
      manifest: {
        id: '.',
        name: 'JH To Do List — Dopamine To-Do',
        short_name: 'JH To Do List',
        description: 'A modern to-do list that rewards you for getting things done: XP, streaks, and confetti on every task.',
        theme_color: '#0b0a14',
        background_color: '#0b0a14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: `icons/icon-192.png?v=${iconVersion}`, sizes: '192x192', type: 'image/png' },
          { src: `icons/icon-512.png?v=${iconVersion}`, sizes: '512x512', type: 'image/png' },
          { src: `icons/icon-maskable-192.png?v=${iconVersion}`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: `icons/icon-maskable-512.png?v=${iconVersion}`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
