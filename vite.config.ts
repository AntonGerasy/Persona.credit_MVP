import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProductionBuild = mode === 'production'

  // P0 client QA guard: refuse to create a production bundle with the public
  // QA fixture switch enabled. This catches the mistake before deployment.
  if (isProductionBuild && env.VITE_QA_FIXTURE_MODE === 'true') {
    throw new Error('PRODUCTION SAFETY GUARD: VITE_QA_FIXTURE_MODE must be false for a production build.')
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
  }
})
