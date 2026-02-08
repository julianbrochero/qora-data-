import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/qora-data-/', // 🔥 NOMBRE EXACTO DEL REPO
})
