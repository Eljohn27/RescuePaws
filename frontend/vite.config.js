import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fixed port: the backend only allows this address (see CLIENT_URL in backend/.env)
  server: { port: 5173, strictPort: true },
})
