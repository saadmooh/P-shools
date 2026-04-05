import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss/vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss,
    {
      name: 'copy-404',
      closeBundle() {
        if (!existsSync('dist')) mkdirSync('dist', { recursive: true })
        copyFileSync('404.html', 'dist/404.html')
      }
    }
  ],
  base: '/P-shools/',
})