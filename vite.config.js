import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base: '/qora-data-/', // 👈 Comentado porque Vercel lo despliega en la raíz, no en una subcarpeta
})
