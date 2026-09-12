import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET

  return {
    plugins: [react()],
    server: proxyTarget ? {
      proxy: {
        '/ms2-proxy': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ms2-proxy/, ''),
        },
      },
    } : undefined,
  }
})

