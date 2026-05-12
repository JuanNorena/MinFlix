/**
 * Configuración de Vite para el frontend de MinFlix.
 *
 * Define los plugins de compilación: React Fast Refresh para desarrollo
 * y Tailwind CSS para procesamiento de estilos.
 *
 * @see {@link https://vite.dev/config/} para la referencia de configuración de Vite
 */

/** Helper de Vite para definir configuración tipada */
import { defineConfig } from 'vite'

/** Plugin oficial de React para Vite (incluye Fast Refresh) */
import react from '@vitejs/plugin-react'

/** Plugin de Tailwind CSS para Vite */
import tailwindcss from '@tailwindcss/vite'

/** Configuración exportada del build del frontend */
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
