# MinFlix - Plataforma de Streaming Multimedia

MinFlix es un proyecto academico y tecnico para construir una plataforma de streaming con arquitectura empresarial sobre Oracle, backend en NestJS y frontend en React. El objetivo es demostrar modelado de datos, reglas de negocio fuertes y una implementacion full stack trazable a epicas INVEST.

## Autor
Juan Sebastian Norena Espinosa, Daniel Eduardo Jurado Celemin y Samuel Andres Castaño

## 1. Analisis Paso a Paso de la Aplicacion

### Paso 1. Dominio funcional
1. La plataforma administra catalogo multimedia (peliculas, series, documentales, musica y podcasts).
2. Cada cuenta puede tener multiples perfiles con restricciones por plan y tipo de perfil.
3. El sistema registra reproducciones para habilitar continuidad y analitica.
4. El sistema incluye procesos financieros de cobro, descuentos y renovacion.
5. El sistema debe soportar reportes ejecutivos con consultas avanzadas.

### Paso 2. Arquitectura por capas
1. Oracle Database:
   - Persistencia principal.
   - Validaciones y reglas fuertes via SQL y PL/SQL.
2. Backend NestJS:
   - API REST central.
   - Autenticacion y autorizacion.
   - Orquestacion entre frontend y Oracle.
3. Frontend React:
   - Interfaces por rol.
   - Formularios y consumo de API.
   - Visualizacion de catalogo, pagos y reportes.

### Paso 3. Estado actual de implementacion
1. Repositorios separados:
   - minflix-backend
   - minflix-frontend
2. Backend base operativo:
   - Prefijo de API /api/v1.
   - Swagger en /api/docs.
   - Auth inicial con Passport.js.
3. Frontend base operativo:
   - Router principal.
   - Pantalla de inicio.
   - Formulario de login conectado a la API.
4. Calidad activa:
   - Lint y build funcionales.
   - Regla TSDoc en espanol habilitada.

### Paso 4. Brecha hacia objetivo final
1. La autenticacion debe pasar de demo local a persistencia real en Oracle.
2. Falta construir modulos de negocio por epica de forma completa.
3. Falta consolidar scripts Oracle por nucleo con evidencia ejecutable.

## 2. Tecnologias del Proyecto

### 2.1 Base de Datos
1. Oracle Database.
2. SQL y PL/SQL.
3. Objetos esperados: tablas, constraints, triggers, procedures, functions, roles, indices, vistas materializadas.

### 2.2 Backend (minflix-backend)
1. TypeScript.
2. NestJS.
3. TypeORM.
4. oracledb.
5. Passport.js:
   - passport-local.
   - passport-jwt.
6. Validacion y seguridad:
   - class-validator.
   - class-transformer.
   - helmet.
   - compression.
   - nestjs-pino.
7. Calidad y pruebas:
   - eslint + eslint-plugin-tsdoc.
   - prettier.
   - typedoc.
   - jest + supertest.
   - husky + lint-staged.

### 2.3 Frontend (minflix-frontend)
1. React + TypeScript + Vite.
2. Navegacion: react-router-dom.
3. Estado de servidor: @tanstack/react-query.
4. Cliente HTTP: axios.
5. Formularios y validaciones:
   - react-hook-form.
   - @hookform/resolvers.
   - zod.
6. UI y experiencia:
   - tailwindcss + @tailwindcss/vite.
   - framer-motion.
   - lucide-react.
7. Calidad y pruebas:
   - eslint + eslint-plugin-tsdoc.
   - typedoc.
   - vitest + testing-library.
   - husky + lint-staged.

## 3. Mapa Epicas INVEST -> Implementacion
1. Epica 1 (Catalogo):
   - Backend: modulo de contenidos.
   - Frontend: vistas de catalogo.
   - Oracle: modelo relacional de contenidos.
2. Epica 2 (Usuarios y perfiles):
   - Backend: auth, usuarios, perfiles y reglas por plan.
   - Frontend: login y gestion de perfiles.
   - Oracle: limites por plan y restricciones infantiles.
3. Epica 3 (Reproducciones):
   - Backend: tracking de consumo.
   - Frontend: continuar viendo.
   - Oracle: registros de reproduccion e indices.
4. Epica 4 (Comunidad):
   - Backend: favoritos, calificaciones y reportes.
   - Frontend: interaccion social.
   - Oracle: reglas de elegibilidad de calificacion.
5. Epica 5 (Finanzas):
   - Backend: pagos y facturacion.
   - Frontend: estado de cuenta.
   - Oracle: transacciones y automatizaciones mensuales.
6. Epica 6 (Analitica):
   - Backend: endpoints de reportes.
   - Frontend: dashboards.
   - Oracle: OLAP y vistas materializadas.

## 4. Plan de Ejecucion Resumido
1. Fase de base tecnica: repos, configuraciones, seguridad inicial y convenciones.
2. Fase de autenticacion real: login persistente en Oracle con Passport.
3. Fase funcional por iteraciones: modulos de epicas 1 a 6.
4. Fase de cierre: pruebas, evidencias academicas y sustentacion.

Detalle completo del plan:
- [Plan de Desarrollo](./Docs/Plan_Desarrollo.md)
- [Epicas INVEST](./Docs/Epicas.md)
- [Enunciado](./Docs/Enunciado.md)

## 5. Guia de Ejecucion Paso a Paso

### 5.1 Backend
1. Ir a la carpeta minflix-backend.
2. Copiar .env.example como .env.
3. Configurar credenciales y conexion Oracle.
4. Instalar dependencias con npm install.
5. Ejecutar npm run start:dev.
6. Verificar Swagger en http://localhost:3000/api/docs.

### 5.2 Frontend
1. Ir a la carpeta minflix-frontend.
2. Copiar .env.example como .env.
3. Configurar VITE_API_URL segun backend.
4. Instalar dependencias con npm install.
5. Ejecutar npm run dev.

### 5.3 Base de datos Oracle
1. Ejecutar scripts en orden versionado:
   - database/01_bootstrap_oracle_iteracion1.sql.
   - database/02_catalogo_base_iteracion2.sql.
   - database/03_reglas_perfiles_iteracion1.sql.
   - database/04_reproducciones_iteracion2.sql.
   - database/05_comunidad_favoritos_iteracion3.sql.
2. Guardar evidencia de ejecucion y resultados de pruebas.

### 5.4 Ejecucion rapida desde raiz
1. Desde la raiz del workspace, ejecutar el script PowerShell start-dev.ps1.
2. El script abre dos terminales: backend y frontend, ambos en modo desarrollo.
3. Verificar:
   - Frontend: http://localhost:5173.
   - Backend Swagger: http://localhost:3000/api/docs.

## 6. Seguridad de Inicio de Sesion
1. El login usa Passport.js de forma obligatoria.
2. Flujo actual:
   - POST /api/v1/auth/login.
   - POST /api/v1/auth/register.
   - GET /api/v1/auth/profile con JWT.
   - POST /api/v1/playback/start con JWT.
   - POST /api/v1/playback/progress con JWT.
   - GET /api/v1/playback/continue-watching?perfilId=:id con JWT.
   - GET /api/v1/playback/history?perfilId=:id con JWT.
   - POST /api/v1/community/favorites con JWT.
   - DELETE /api/v1/community/favorites/:contenidoId?perfilId=:id con JWT.
   - GET /api/v1/community/favorites?perfilId=:id con JWT.
   - GET /api/v1/community/favorites/status?perfilId=:id&contenidoId=:id con JWT.
3. El login, registro, tracking de reproduccion y favoritos se validan contra Oracle usando bcrypt y reglas de negocio en triggers.

## 7. Guia Visual de Auth (Fase 1)
1. La UI de login y registro usa una paleta cinematica con acentos rojos y dorados.
2. La base visual y componentes se centralizan en minflix-frontend/src/index.css.
3. Tipografia oficial de interfaz: Helvetica Neue / Helvetica / Arial.
4. Se incluyo toggle ver/ocultar contrasena en login y registro.
5. Se incluyo vista de planes y beneficios en /planes para apoyar la decision de registro.
6. Referencia de estilo detallada en Docs/Guia_Diseno_UI.md.

## 8. Helpers de UX (Campos ambiguos)
1. Perfil inicial:
   - Es el primer perfil de reproduccion creado para la cuenta principal.
   - Se usa para separar recomendaciones, historial y continuidad de visualizacion.
2. Plan inicial:
   - Define limite de perfiles y condiciones de reproduccion.
3. Contraseña:
   - Incluye control visual para ver/ocultar durante digitacion.

Ubicacion de helpers en frontend:
- minflix-frontend/src/shared/helpers/authFieldHelp.ts
- minflix-frontend/src/shared/helpers/plansCatalog.ts

## 9. Estandares de Documentacion y Calidad
1. TSDoc en espanol es obligatorio para codigo publico.
2. Todo endpoint debe documentarse en Swagger.
3. Todo cambio debe pasar lint y build en backend y frontend.

## 10. Estructura del Workspace
1. Docs/: enunciado, epicas y plan.
2. minflix-backend/: API y seguridad.
3. minflix-frontend/: aplicacion web.

## 11. Diagnostico ORA-00942 (Backend)
Si al iniciar backend aparece ORA-00942 sobre USUARIOS, valide en este orden:

1. Confirmar owner real de tablas en Oracle:
    SELECT OWNER, TABLE_NAME
    FROM ALL_TABLES
    WHERE OWNER IN ('SYSTEM', 'MINFLIX_APP')
       AND TABLE_NAME IN ('USUARIOS', 'PLANES', 'PERFILES')
    ORDER BY OWNER, TABLE_NAME;
2. Ajustar DB_SCHEMA en minflix-backend/.env al owner real detectado.
3. Reiniciar backend y validar que mapea rutas sin excepcion en onModuleInit.
4. Si las tablas no existen en ningun owner esperado, reejecutar database/01_bootstrap_oracle_iteracion1.sql con el usuario correcto.
