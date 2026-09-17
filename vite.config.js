import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Electron-compatible build plugin.
 *
 * Vite's default build emits `crossorigin` attributes on every
 * <script type="module"> and <link rel="stylesheet"> tag.
 * When Electron loads the page via file://, the browser treats
 * these as CORS requests — which always fail for local files —
 * and silently refuses to execute the JS/CSS, producing a blank
 * white screen.  This plugin strips those attributes from the
 * final index.html so the app renders correctly.
 */
function removeElectronCrossorigin() {
  return {
    name: 'electron-remove-crossorigin',
    enforce: 'post',
    // runs after VitePWA and all other plugins have touched the HTML
    transformIndexHtml(html) {
      return html
        .replace(/ crossorigin="[^"]*"/g, '')   // crossorigin="anonymous" etc.
        .replace(/ crossorigin(?=[>\s/])/g, ''); // bare crossorigin attribute
    },
  };
}

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    headers: {
      // Required for getUserMedia + MediaRecorder on non-HTTPS origins
      'Permissions-Policy': 'microphone=*, camera=*',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    // Only enable PWA in production build to avoid dev performance issues
    ...(process.env.NODE_ENV === 'production' ? [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
        manifest: {
          name: 'Study Hub — RPG Dashboard',
          short_name: 'Study Hub',
          description: 'Your personal RPG-powered study productivity dashboard',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: './',
          start_url: './',
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
            },
            {
              urlPattern: /^https:\/\/api\.(openrouter|inceptionlabs)\.ai\/.*/i,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 }, networkTimeoutSeconds: 10 }
            },
            {
              urlPattern: /\.(?:jpg|jpeg|png|gif|webp|svg)$/,
              handler: 'CacheFirst',
              options: { cacheName: 'image-cache', expiration: { maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60 } }
            }
          ]
        }
      })
    ] : []),
    // Must come LAST so it runs after VitePWA finishes modifying the HTML
    removeElectronCrossorigin(),
  ],
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('worldMapData')) {
            return 'data-world-map';
          }
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          if (id.includes('@aws-sdk')) {
            return 'vendor-aws';
          }
          if (id.includes('@xyflow')) {
            return 'vendor-flow';
          }
          if (id.includes('react-icons') || id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'vendor-charts';
          }
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/') || id.includes('/react-is/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})