import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // El build de produccion exige la URL de la API (salvo en modo de ejemplo): no se embebe localhost como valor por defecto.
  if (command === 'build' && mode === 'production' && !env.VITE_API_BASE_URL && env.VITE_DATA_SOURCE !== 'sample') {
    throw new Error('Falta VITE_API_BASE_URL para el build de produccion. Ejemplo: VITE_API_BASE_URL=https://api.tudominio.com npm run build')
  }
  return {
  // GitHub Pages sirve el sitio en un subdirectorio (/nombre-del-repo/): VITE_BASE lo define; en un dominio propio queda "/".
  base: env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173, strictPort: true, host: true },
  preview: { port: 5173, strictPort: true },
  }
})
