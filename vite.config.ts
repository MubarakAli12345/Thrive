import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase size limit to 1000kb if needed
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'konva-vendor': ['konva', 'react-konva'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    sourcemap: false, // Disable sourcemaps in production to reduce bundle size
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'konva', 'react-konva', '@tanstack/react-query']
  }
})