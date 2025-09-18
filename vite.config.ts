import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'   // if you use React
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 👇 This is the key line to make assets load correctly through /apps/customizer
  base: './',

  plugins: [
    react(),        // include if you are using React
    tailwindcss(),
  ],
})
