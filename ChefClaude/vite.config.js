import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: '/ModernReact/ChefClaude/dist/',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'markdown-vendor': ['react-markdown'],
                    'ai-vendor': ['@anthropic-ai/sdk', '@huggingface/inference'],
                },
            },
        },
    },
})