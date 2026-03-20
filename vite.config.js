import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/email-app/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://dremo-platform-main.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
