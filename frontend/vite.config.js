import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NODE_ENV === 'production' ? '/static/frontend/' : '/',
  build: {
    outDir: path.resolve(__dirname, '../backend/staticfiles/frontend'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
    },
  },
})
