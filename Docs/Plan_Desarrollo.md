# Plan de Desarrollo del Proyecto MinFlix

Este plan detalla paso a paso la evolucion del proyecto MinFlix con arquitectura full stack. La planeacion conecta el enunciado academico, las epicas INVEST y la implementacion real en Oracle, backend NestJS y frontend React.

## 1. Objetivo del Plan
1. Traducir las epicas a entregables tecnicos medibles.
2. Separar claramente responsabilidades entre base de datos, backend y frontend.
3. Definir un orden de implementacion que permita demostrar avance por iteraciones.
4. Garantizar trazabilidad con los nucleos del curso y evidencias de evaluacion.

## 2. Arquitectura y Stack Confirmado

### 2.1 Capa de Base de Datos (Oracle)
1. Motor: Oracle Database.
2. Lenguajes: SQL y PL/SQL.
3. Componentes tecnicos obligatorios: tablas, restricciones, triggers, procedimientos, funciones, roles, indices, vistas materializadas y transacciones.

### 2.2 Capa Backend
1. Runtime y framework: Node.js + NestJS + TypeScript.
2. Persistencia: TypeORM + oracledb.
3. Seguridad: Passport.js con estrategia local y JWT.
4. Infraestructura API: Swagger, ValidationPipe, ConfigModule, helmet, compression, nestjs-pino.
5. Calidad: ESLint, Prettier, eslint-plugin-tsdoc, TypeDoc, Husky, lint-staged, Jest.

### 2.3 Capa Frontend
1. Framework: React + TypeScript + Vite.
2. UI y UX: Tailwind CSS v4, framer-motion, lucide-react.
3. Datos y formularios: React Query, Axios, React Hook Form, Zod.
4. Navegacion: react-router-dom.
5. Calidad: ESLint, eslint-plugin-tsdoc, TypeDoc, Vitest, Testing Library, Husky, lint-staged.

## 3. Principios Tecnicos de Gobierno
1. Todo componente publico se documenta con TSDoc en espanol.
2. Todo endpoint nuevo debe estar documentado en Swagger.
3. Toda regla critica de negocio debe implementarse tambien en Oracle (no solo en el backend).
4. Todo modulo funcional debe quedar mapeado a una epica INVEST.
5. La autenticacion de inicio de sesion es obligatoriamente con Passport.js.

## 4. Plan de Trabajo Paso a Paso

### Fase 0. Diagnostico y Preparacion (Semana 0)
1. Validar alcance funcional completo desde el enunciado.
2. Confirmar separacion de repositorios: minflix-backend y minflix-frontend.
3. Definir convensiones de carpetas, nombres y scripts de calidad.
4. Aprobar matriz de trazabilidad Epica -> Modulo -> Entregable.

### Fase 1. Fundaciones Tecnicas (Semanas 1-2)

#### Backend
1. Inicializar proyecto NestJS y configuracion base.
2. Configurar TypeORM con Oracle via variables de entorno.
3. Activar prefijo global de API: /api/v1.
4. Activar Swagger en /api/docs.
5. Configurar middlewares de seguridad y observabilidad.

#### Frontend
1. Inicializar proyecto React TypeScript con Vite.
2. Configurar Tailwind, Router y React Query.
3. Crear estructura de carpetas por capas: pages, router, shared, features.
4. Configurar cliente Axios y variable VITE_API_URL.

### Fase 2. Seguridad y Acceso (Semanas 2-3)

#### Backend
1. Implementar AuthModule con Passport LocalStrategy + JwtStrategy.
2. Exponer endpoints de autenticacion:
   - POST /api/v1/auth/login.
   - GET /api/v1/auth/profile.
3. Crear guards para rutas protegidas.
4. Definir esquema de roles base de aplicacion.

#### Frontend
1. Construir pantalla de login con React Hook Form + Zod.
2. Conectar formulario contra API de autenticacion.
3. Manejar estado de sesion y errores de autenticacion.
4. Proteger rutas privadas de panel segun JWT.

### Fase 3. Estandares y Calidad Continua (Semana 3)
1. Activar y ajustar reglas de lint para backend y frontend.
2. Forzar TSDoc en espanol para APIs publicas y servicios criticos.
3. Configurar TypeDoc en ambos repos.
4. Activar hooks de Husky y lint-staged.
5. Establecer checklist de Definition of Done para cada historia tecnica.

### Fase 4. Base de Datos Academica y Operativa (Semanas 3-5)
1. Crear carpeta de scripts versionados en orden de ejecucion.
2. Construir script de esquema con integridad referencial completa.
3. Construir script de carga inicial de datos asimetricos.
4. Construir consultas avanzadas de NT1.
5. Construir objetos PL/SQL de NT2.
6. Construir transacciones y pruebas de concurrencia de NT3.
7. Construir indices y comparativas de plan de ejecucion de NT4.
8. Construir modelo de roles y grants de NT5.

### Fase 5. Implementacion Funcional por Iteraciones (Semanas 5-10)

#### Iteracion 1 (Epicas 1 y 2)
1. Backend:
   - Persistencia real de usuarios y credenciales en Oracle.
   - CRUD de perfiles por cuenta con reglas de plan.
   - CRUD inicial de catalogo.
2. Frontend:
   - Flujo completo de login y perfil autenticado.
   - Vistas de gestion de perfiles.
   - Vistas base de catalogo.
3. Base de datos:
   - Triggers de limite de perfiles por plan.
   - Restricciones de clasificacion para perfiles infantiles.

#### Iteracion 2 (Epicas 3 y 4)
1. Backend:
   - Registro de reproducciones con progreso y dispositivo.
   - Favoritos, calificaciones y reportes de contenido.
2. Frontend:
   - Vista seguir viendo.
   - Favoritos y calificacion con validaciones visuales.
   - Registro de reportes por usuario.
3. Base de datos:
   - Trigger para impedir calificar sin consumo minimo.
   - Regla de cuenta activa para permitir reproduccion.

#### Iteracion 3 (Epica 5)
1. Backend:
   - Modulo de facturacion y pagos.
   - Endpoints de estado de cuenta y beneficios.
2. Frontend:
   - Vista de pagos, historial y vencimientos.
   - Indicadores de descuentos por referidos y antiguedad.
3. Base de datos:
   - Procedimientos para renovacion mensual.
   - Manejo de fallos con savepoint y rollback.

#### Iteracion 4 (Epica 6)
1. Backend:
   - Endpoints de analitica y consolidado financiero.
   - Integracion de vistas materializadas para lectura.
2. Frontend:
   - Dashboards de consumo y finanzas.
   - Filtros por periodo, plan y categoria.
3. Base de datos:
   - Consultas OLAP con rollup, cube y grouping sets.

#### Iteracion 5 (Hardening transversal)
1. Aplicar autorizacion por rol en todo endpoint sensible.
2. Completar pruebas de integracion E2E clave.
3. Ejecutar pruebas de regresion funcional en frontend.
4. Cerrar brechas entre reglas del backend y reglas Oracle.

### Fase 6. Cierre Academico y Sustentacion (Semanas 11-16)
1. Ejecutar scripts Oracle en orden y validar evidencia por nucleo.
2. Generar paquete de pruebas de backend y frontend.
3. Consolidar capturas de resultados, explain plan y concurrencia.
4. Preparar narrativa de sustentacion enlazando:
   - Enunciado.
   - Epicas INVEST.
   - Implementacion en codigo.
   - Evidencias de ejecucion.

## 5. Matriz de Trazabilidad Epica - Implementacion

### Epica 1. Catalogo
1. Backend: modulo de contenido, entidades y validaciones.
2. Frontend: vistas de listado, detalle y administracion.
3. Oracle: tablas de contenido, categorias, generos y relaciones.

### Epica 2. Usuarios y perfiles
1. Backend: autenticacion, cuentas, perfiles y limites por plan.
2. Frontend: login, perfil activo, alta y gestion de perfiles.
3. Oracle: reglas de plan, restricciones de perfil infantil.

### Epica 3. Reproducciones
1. Backend: endpoints de tracking y continuidad de consumo.
2. Frontend: reproduccion, progreso y continuar viendo.
3. Oracle: tabla de reproducciones con volumen alto e indices.

### Epica 4. Comunidad
1. Backend: favoritos, calificaciones y reportes.
2. Frontend: interacciones comunitarias por perfil.
3. Oracle: reglas de elegibilidad para calificar y moderacion.

### Epica 5. Finanzas
1. Backend: facturacion, cobros y estado de cuenta.
2. Frontend: panel de pagos y beneficios.
3. Oracle: transacciones ACID y automatizacion mensual.

### Epica 6. Inteligencia empresarial
1. Backend: APIs de consultas analiticas.
2. Frontend: dashboards gerenciales.
3. Oracle: OLAP, vistas materializadas y optimizacion.

## 6. Entregables Minimos por Iteracion
1. Codigo funcional en backend y frontend.
2. Scripts Oracle asociados al alcance de la iteracion.
3. Pruebas basicas ejecutadas y evidencia.
4. Actualizacion de README y avance en documentacion tecnica.

## 7. Estado Actual y Proximo Paso
1. Estado actual:
   - Fundaciones de backend y frontend creadas.
   - Login inicial con Passport.js ya integrado.
   - Pipeline de calidad basico operativo.
2. Proximo paso inmediato:
   - Implementar persistencia real en Oracle para autenticacion y cuentas.
   - Completar Iteracion 1 con usuarios, perfiles y catalogo base.

