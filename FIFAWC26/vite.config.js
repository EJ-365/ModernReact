import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiProxy = {
  target: 'https://wheniskickoff.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, '/data/v1'),
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': apiProxy,
    },
  },
  preview: {
    proxy: {
      '/api': apiProxy,
    },
  },
})
