import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hmrClientPort = Number.parseInt(process.env.VITE_HMR_CLIENT_PORT ?? '', 10)
const hmr = Number.isInteger(hmrClientPort)
  ? { clientPort: hmrClientPort }
  : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr,
  }
})
