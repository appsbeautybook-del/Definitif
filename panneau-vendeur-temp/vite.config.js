import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    open: '/',
    proxy: {
      '/ai-proxy': {
        target: 'https://opencode.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
      },
    },
  },
  plugins: [
    react(),
  ]
});
