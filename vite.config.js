// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        "name": "Task Manager",
        "short_name": "Tasks",
        "description": "A simple and efficient task management PWA.",
        "id": "/",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#4a90e2",
        "orientation": "portrait",
        "icons": [
          {
            "src": "/done.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "/done.png",
            "type": "image/png",
            "sizes": "512x512"
          },
          {
            "src": "/done.png",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "maskable"
          },
          {
            "src": "/done.png",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "any"
          }
        ],
        "launch_handler": {
          "client_mode": "auto"
        },
        "screenshots": [
          {
            "src": "/done.png",
            "sizes": "540x720",
            "type": "image/png",
            "label": "Dashboard"
          },
          {
            "src": "/done.png",
            "sizes": "540x720",
            "type": "image/png",
            "label": "Create Task"
          }
        ]
      },
    }),
  ],
})
