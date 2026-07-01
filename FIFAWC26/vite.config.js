import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://wheniskickoff.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/data/v1'),
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://wheniskickoff.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/data/v1'),
      },
    },
  },
})
