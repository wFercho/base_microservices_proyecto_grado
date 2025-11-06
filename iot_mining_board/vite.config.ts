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
  // ✅ AGREGAR ESTO para funcionar en VPS:
  server: {
    host: '0.0.0.0',      // ← Acepta conexiones externas
    port: 5173,           // ← Puerto de desarrollo
    strictPort: true,     // ← No cambiar puerto automáticamente
    hmr: {
      // Para Hot Module Replacement en la VPS:
      host: 'localhost',  // O tu dominio si usas SSL
      port: 5173,
    }
  },
  // Opcional: Configuración para build
  build: {
    outDir: 'dist',
    sourcemap: true,      // Útil para debug en producción
  }
})