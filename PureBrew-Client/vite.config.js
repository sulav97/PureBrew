import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  build: {
    sourcemap: false, // Disable source maps for production security
    rollupOptions: {
      output: {
        // Remove console.log statements in production
        manualChunks: undefined
      }
    }
  },
  esbuild: {
    // Remove console.log statements in production builds
    drop: ['console', 'debugger']
  }
})
