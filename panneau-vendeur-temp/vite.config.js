import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'

const envFile = path.resolve(__dirname, '.env')
let extraDefines = {}
try {
  const envContent = fs.readFileSync(envFile, 'utf-8')
  const envVars = Object.fromEntries(
    envContent.split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => {
        const idx = line.indexOf('=')
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
      })
  )
  if (envVars.VITE_OPENROUTER_KEY) {
    extraDefines['import.meta.env.VITE_OPENROUTER_KEY'] = JSON.stringify(envVars.VITE_OPENROUTER_KEY)
  }
} catch {}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: extraDefines,
  server: {
    port: 5175,
    open: '/',
    proxy: {
      '/ai-proxy': {
        target: 'https://openrouter.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
      },
    },
  },
  plugins: [
    react(),
  ]
});
