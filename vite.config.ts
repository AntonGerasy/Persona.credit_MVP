import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// API key is now server-side only (Vercel Functions in /api/)
// No environment variables need to be injected into the browser bundle

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // In local dev, proxy /api calls to a local server or return a stub
      // For full local dev with Functions, use `vercel dev` instead of `vite`
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
