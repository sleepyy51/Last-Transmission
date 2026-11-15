import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project pages are served from /<repo>/, so every asset URL needs this prefix.
export default defineConfig({
  base: '/Last-Transmission/',
  plugins: [react()],
})
