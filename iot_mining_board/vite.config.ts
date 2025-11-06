import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // ✅ AGREGAR ESTO:
    allowedHosts: [
      'iot-system-uptc.duckdns.org',
      '3.16.26.200',
      'localhost'
    ]
  }
})