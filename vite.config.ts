import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      "https://ad64-2409-40c1-6400-6acf-8ba-f30-d3a0-cf34.ngrok-free.app"
    ]
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Progress Tracker',
        short_name: 'Progress',
        description: 'Track daily and weekly progress from Notion',
        theme_color: '#000000',
        icons: [
          {
            src: 'icons.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
