# MinFlix - Frontend (React)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Este directorio contiene la aplicación cliente (SPA) de MinFlix, desarrollada en **React** con **Vite**. Es la interfaz visual donde los usuarios interactúan con la plataforma, consumen contenido y administran sus cuentas.

---

##  Arquitectura Frontend y su Relación con Oracle

Aunque el frontend está físicamente separado de la base de datos, toda su arquitectura de estado y manejo de errores está profundamente influenciada por nuestro diseño de **"Base de Datos Robusta" (Fat Database)** en Oracle:

1. **Estado del Servidor como Fuente de Verdad**:
   - Utilizamos `@tanstack/react-query` para sincronizar el estado del cliente con el backend de manera eficiente.
   - Las validaciones que ves en la interfaz (por ejemplo, si no puedes crear un perfil más porque tu plan no lo permite) no son simples reglas *hardcodeadas* en React; son reflejos en tiempo real de las restricciones (Constraints) y reglas de negocio (Triggers PL/SQL) calculadas en la base de datos Oracle y transmitidas a través de la API.

2. **Consumo de Vistas Materializadas y Analítica**:
   - Los dashboards financieros y de reportes en el frontend obtienen sus datos en milisegundos gracias a que Oracle precalcula la información usando vistas materializadas (OLAP). El frontend se encarga puramente de la renderización de las gráficas, descargando de cálculos matemáticos pesados al cliente web.

3. **Autenticación e Integridad**:
   - La persistencia de sesión se maneja almacenando el token JWT de forma segura. 
   - Cuando el usuario guarda un contenido en "Favoritos" o "Continúa viendo" una película, cada click es una transacción segura almacenada en Oracle. Si hay problemas de concurrencia, los errores de la DB se traducen a notificaciones amigables en la UI (mediante *Toasts*).

---

## Stack Tecnológico

- **Core**: React 18, TypeScript, Vite.
- **Navegación**: React Router DOM (Manejo de rutas públicas y privadas).
- **Manejo de Estado Remoto**: TanStack React Query (SWR, Caching, Mutaciones).
- **Formularios**: React Hook Form con `zod` para pre-validación de esquemas (reduciendo la carga innecesaria hacia Oracle).
- **Estilos y UI**: 
  - TailwindCSS (Utility-first CSS).
  - Framer Motion (Micro-interacciones y animaciones fluidas).
  - Lucide React (Sistema de iconos).

---

## Guía de Instalación y Ejecución

### Prerrequisitos
- Node.js v18 o superior.
- Backend en ejecución (el cual debe estar conectado a la base de datos Oracle).

### Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Copia el archivo de configuración base:
   ```bash
   cp .env.example .env
   ```
   *Asegúrate de que `VITE_API_URL` apunte a la ruta de tu API backend local (por lo general `http://localhost:3000/api/v1`).*

3. **Ejecutar en Desarrollo**:
   ```bash
   npm run dev
   ```

4. **Ver la Aplicación**:
   Abre tu navegador en `http://localhost:5173`. Si el backend y la base de datos de Oracle están configurados correctamente, la aplicación podrá registrar usuarios nuevos y mostrar el catálogo.

---

## Estructura de Carpetas

- `/src/assets`: Imágenes, fuentes y recursos estáticos.
- `/src/components`: Componentes reutilizables (Botones, Inputs, Tarjetas).
- `/src/pages`: Vistas completas de la aplicación (Login, Catálogo, Dashboard).
- `/src/hooks`: Custom hooks (ej. `useAuth`, llamadas encapsuladas de React Query).
- `/src/services`: Cliente HTTP (Axios) y definición de llamadas a la API.
