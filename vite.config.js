import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // served from https://cinxwei.github.io/cinxweipublish/
  base: '/cinxweipublish/',
  plugins: [react()],
})
