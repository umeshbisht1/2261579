import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// adding proxy to frontend beacuse we cannnot direcly communicate with backend so we used as
//  proxy server here my ncakend url  is which is running on my local machine is http://localhost:3000
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})