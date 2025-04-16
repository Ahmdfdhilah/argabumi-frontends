import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@workspace/ui': path.resolve(__dirname, '../../packages/ui/src') ,
      '@workspace/tailwind': path.resolve(__dirname, '../../packages/tailwind')
    }
  },
  optimizeDeps: {
    include: ['@workspace/ui', '@workspace/tailwind'] 
  }
})