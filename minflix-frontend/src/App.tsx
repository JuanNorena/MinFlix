import { AppRouter } from './router/AppRouter'
import { Toaster } from 'react-hot-toast'

/**
 * Componente raiz de la aplicacion frontend.
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
