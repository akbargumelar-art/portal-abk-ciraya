import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force a stable URL without path encoding issues
    fs: {
      strict: false
    },
    // Allow CORS
    cors: true,
    // Warmup critical files
    warmup: {
      clientFiles: ['./src/main.tsx', './index.html']
    }
  },
  base: './'
})
