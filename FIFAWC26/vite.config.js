import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const matchApiProxy = {
  target: 'https://wheniskickoff.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, '/data/v1'),
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': matchApiProxy,
    },
  },
  preview: {
    proxy: {
      '/api': matchApiProxy,
    },
  },
})
