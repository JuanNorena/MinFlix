/**
 * Punto de entrada principal del frontend de MinFlix.
 *
 * Monta la aplicación React en el DOM, configura React Query para el manejo
 * de estado de servidor, y envuelve la app con `BrowserRouter` para el
 * enrutamiento del lado del cliente.
 *
 * @see {@link App} para el componente raíz de la aplicación
 * @see {@link AppRouter} para la configuración de rutas
 */

/** Modo estricto de React para detectar problemas potenciales */
import { StrictMode } from 'react'

/** Utilidad para crear la raíz del DOM en React 18+ */
import { createRoot } from 'react-dom/client'

/** Proveedor de cliente de React Query para gestión de estado de servidor */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** Enrutador del lado del cliente de React Router */
import { BrowserRouter } from 'react-router-dom'

/** Estilos globales de la aplicación */
import './index.css'

/** Componente raíz de la aplicación */
import App from './App.tsx'

/** Instancia global de QueryClient para cacheo de peticiones HTTP */
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
