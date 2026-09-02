import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs work on both GitHub Pages (/quran-video-maker/) and Vercel (/).
  base: './',
})
