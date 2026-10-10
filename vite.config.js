import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev: same-origin calls, no CORS headaches. The Origin header is
      // stripped so the backend never sees a foreign dev-server origin —
      // the dev UI works on ANY localhost port, not just :5173.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
          });
        },
      },
      // /portfolio serves BOTH the public API and the SPA page. Browser
      // navigations (Accept: text/html) must get index.html; axios JSON
      // calls still proxy to the backend.
      '/portfolio': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => ((req.headers.accept || '').includes('text/html') ? '/index.html' : null),
      },
      '/oauth2': 'http://localhost:8080',
      '/login/oauth2': 'http://localhost:8080',
    },
  },
})
