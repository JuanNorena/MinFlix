/**
 * Componente raíz de la aplicación frontend de MinFlix.
 *
 * Renderiza el enrutador principal de la aplicación y el sistema global
 * de notificaciones (toasts) usando `react-hot-toast`.
 *
 * @see {@link AppRouter} para la configuración de rutas de la aplicación
 */

/** Componente de enrutamiento principal de la aplicación */
import { AppRouter } from './router/AppRouter'

/** Componente de notificaciones toast para la aplicación */
import { Toaster } from 'react-hot-toast'

/**
 * Componente raíz de la aplicación frontend.
 */
function App() {
  return (
    <>
      <AppRouter />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '4px',
            fontFamily: 'var(--font-family-base)'
          },
          success: {
            iconTheme: {
              primary: '#e50914',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App
