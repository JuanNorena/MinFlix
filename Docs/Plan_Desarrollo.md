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
6. Todo requisito de seguridad del enunciado debe mapearse de forma explicita a `ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE` y `ROL_CONTENIDO`.
7. Todo nucleo academico (NT1..NT5) debe tener una verificacion cuantitativa de minimos y evidencia de ejecucion.
8. Todo entregable oficial (1..10) debe vincularse a un artefacto concreto y a un estado (pendiente, parcial, completado).

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
4. Definir esquema de roles base de aplicacion alineado al enunciado:
   - `ROL_ADMIN`.
   - `ROL_ANALISTA`.
   - `ROL_SOPORTE`.
   - `ROL_CONTENIDO`.

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
4. Construir consultas avanzadas de NT1 con minimos obligatorios:
   - 3 consultas parametrizadas.
   - 2 PIVOT y 2 UNPIVOT.
   - 4 agrupamientos (ROLLUP, CUBE, GROUPING, GROUPING SETS).
   - 2 vistas materializadas.
   - 1 estrategia de fragmentacion para REPRODUCCIONES.
5. Construir objetos PL/SQL de NT2 con minimos obligatorios:
   - 2 cursores.
   - 3 procedimientos almacenados.
   - 2 funciones.
   - 2 manejos de excepciones.
   - 4 triggers de reglas de negocio.
6. Construir transacciones y pruebas de concurrencia de NT3:
   - 3 transacciones clave con COMMIT/ROLLBACK/SAVEPOINT.
   - 1 escenario de concurrencia con SELECT FOR UPDATE.
7. Construir indices y comparativas de plan de ejecucion de NT4:
   - 4 indices minimo.
   - 1 comparativa formal de EXPLAIN PLAN antes y despues.
8. Construir modelo de roles y grants de NT5:
   - 1 PROFILE de seguridad.
   - Creacion de `ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE`, `ROL_CONTENIDO`.
   - Asignaciones GRANT y pruebas de acceso no autorizado.

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
4. Seguridad y roles: `ROL_CONTENIDO` (operacion principal), `ROL_ADMIN` (gobierno y auditoria).

### Epica 2. Usuarios y perfiles
1. Backend: autenticacion, cuentas, perfiles y limites por plan.
2. Frontend: login, perfil activo, alta y gestion de perfiles.
3. Oracle: reglas de plan, restricciones de perfil infantil.
4. Seguridad y roles: `ROL_ADMIN` para administracion de cuentas; control de acceso para operaciones sensibles.

### Epica 3. Reproducciones
1. Backend: endpoints de tracking y continuidad de consumo.
2. Frontend: reproduccion, progreso y continuar viendo.
3. Oracle: tabla de reproducciones con volumen alto e indices.
4. Seguridad y roles: `ROL_ADMIN` para operacion y `ROL_ANALISTA` para consumo de datos consolidados.

### Epica 4. Comunidad
1. Backend: favoritos, calificaciones y reportes.
2. Frontend: interacciones comunitarias por perfil.
3. Oracle: reglas de elegibilidad para calificar y moderacion.
4. Seguridad y roles: `ROL_SOPORTE` para moderacion y cierre de reportes; `ROL_ADMIN` para supervision.

### Epica 5. Finanzas
1. Backend: facturacion, cobros y estado de cuenta.
2. Frontend: panel de pagos y beneficios.
3. Oracle: transacciones ACID y automatizacion mensual.
4. Seguridad y roles: `ROL_ADMIN` para ejecucion de procesos financieros y auditoria de resultados.

### Epica 6. Inteligencia empresarial
1. Backend: APIs de consultas analiticas.
2. Frontend: dashboards gerenciales.
3. Oracle: OLAP, vistas materializadas y optimizacion.
4. Seguridad y roles: `ROL_ANALISTA` para consulta y explotacion de inteligencia de negocio.

## 5.1 Matriz de Cobertura del Enunciado (Think Deeper)
| Bloque del enunciado | Cobertura en epicas/plan | Estado actual |
| --- | --- | --- |
| Catalogo multiformato, generos M:N, temporadas/episodios, relaciones entre contenidos | Epica 1, Fase 5 Iteracion 1 | Parcial |
| Datos personales de usuario, planes y perfiles infantiles | Epica 2, Fase 5 Iteracion 1 | Parcial |
| Programa de referidos y descuentos asociados | Epica 2 + Epica 5, Fase 5 Iteracion 3 | Parcial |
| Historial de reproduccion con detalle operacional | Epica 3, Fase 5 Iteracion 2 | Parcial-avanzado |
| Favoritos y calificaciones por perfil | Epica 4, Fase 5 Iteracion 2 | Avanzado |
| Reportes de contenido inapropiado y moderacion | Epica 4, bloque 3 en curso | Parcial |
| Organizacion interna (departamentos y jerarquia supervisor-subordinado) | Epica 1, 4 y gobierno transversal | Pendiente |
| Facturacion mensual, mora y descuentos de fidelidad | Epica 5, Fase 5 Iteracion 3 | Pendiente |
| Analitica de consumo/finanzas/rendimiento interno | Epica 6, Fase 5 Iteracion 4 | Pendiente |
| Seguridad de acceso con roles y permisos Oracle (NT5) | Fase 4 punto 8 y Hardening transversal | Pendiente critico |

## 6. Entregables Minimos por Iteracion
1. Codigo funcional en backend y frontend.
2. Scripts Oracle asociados al alcance de la iteracion.
3. Pruebas basicas ejecutadas y evidencia.
4. Actualizacion de README y avance en documentacion tecnica.

## 6.1 Cobertura de Entregables Oficiales del Enunciado (1..10)
1. Documento de modelo de negocio (actores, procesos, 10+ reglas, restricciones): pendiente.
2. Modelo Entidad-Relacion (MER) completo y profesional: pendiente.
3. Script de creacion de tablas con restricciones y comentarios: parcial-avanzado.
4. Script de insercion de datos asimetricos: parcial.
5. Script NT1 (parametrizadas, PIVOT/UNPIVOT, OLAP, vistas materializadas, fragmentacion): pendiente.
6. Script NT2 (cursores, procedimientos, funciones, excepciones, triggers): parcial.
7. Script NT3 (3 transacciones + concurrencia): pendiente.
8. Script NT4 (indices + EXPLAIN PLAN): pendiente.
9. Script NT5 (usuarios, roles, PROFILE, GRANT y pruebas de restriccion): pendiente critico.
10. Documento de sustentacion (diseno, indices, concurrencia): pendiente.

## 6.2 Checklist Detallado de Nucleos Academicos (NT1..NT5)
1. NT1 - Consultas avanzadas:
   - 3 parametrizadas.
   - 2 PIVOT.
   - 2 UNPIVOT.
   - 4 agrupamientos (ROLLUP, CUBE, GROUPING, GROUPING SETS).
   - 2 vistas materializadas.
   - 1 fragmentacion de REPRODUCCIONES.
   - Estado: pendiente.
2. NT2 - PL/SQL:
   - 2 cursores.
   - 3 procedimientos.
   - 2 funciones.
   - 2 manejos de excepciones.
   - 4 triggers.
   - Estado: parcial (reglas criticas de triggers ya iniciadas).
3. NT3 - Transacciones y concurrencia:
   - 3 transacciones documentadas y demostradas.
   - 1 escenario con SELECT FOR UPDATE.
   - Estado: pendiente.
4. NT4 - Indices y optimizacion:
   - 4 indices minimos.
   - EXPLAIN PLAN comparativo antes/despues.
   - Estado: parcial (indices operativos), pendiente evidencia formal.
5. NT5 - Usuarios y roles:
   - PROFILE de seguridad.
   - `ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE`, `ROL_CONTENIDO`.
   - GRANT y prueba de denegacion de acceso no autorizado.
   - Estado: pendiente critico.

## 6.3 Metas de Poblacion de Datos Asimetrica y Estado
1. Metas objetivo (segun enunciado):
   - 30 usuarios.
   - 50 perfiles.
   - 40 contenidos.
   - 15 temporadas.
   - 50 episodios.
   - 200 reproducciones.
   - 60 calificaciones.
   - 80 pagos.
   - 40 favoritos.
2. Estado actual conocido:
   - Categorias cargadas: 5.
   - Contenidos cargados: 5.
   - Reproducciones/favoritos/calificaciones/pagos con volumen de prueba academico: pendiente de masificacion.

## 7. Estado Actual y Proximo Paso
1. Estado actual:
   - Fundaciones de backend y frontend creadas.
   - Login y registro con Passport.js + JWT integrados sobre Oracle.
   - Flujo de perfiles estilo streaming implementado (selector, gestion y avatar por archivo).
   - Catalogo base (categorias + contenidos) integrado en backend y browse frontend.
   - Home autenticado (browse) ajustado a patron tipo Netflix y sin bloque de planes en sesion autenticada.
   - Responsividad reforzada en browse para escritorio, tablet y movil con filas horizontales y toolbar adaptable.
   - Textos de la experiencia frontend actualizados a tono orientado a usuario final (sin mensajes tecnicos visibles).
   - Menu hamburguesa implementado en la barra superior de browse para dispositivos moviles.
   - Script Oracle de catalogo base ejecutado en instancia activa con evidencia de carga:
     - CATEGORIAS: 5 registros.
     - CONTENIDOS: 5 registros.
     - CONTENIDOS con ID_EMPLEADO_PUBLICADOR: 5 registros.
   - Script Oracle de reproducciones ejecutado en instancia activa con evidencia de objetos:
     - Tabla: REPRODUCCIONES.
     - Trigger: TRG_REPRODUCCIONES_REGLAS_BIU (VALID).
     - Vista: VW_CONTINUAR_VIENDO (VALID).
    - Modulo backend de reproducciones implementado con endpoints protegidos por JWT:
       - POST /api/v1/playback/start.
       - POST /api/v1/playback/progress.
       - GET /api/v1/playback/continue-watching.
       - GET /api/v1/playback/history.
    - Script Oracle de comunidad (favoritos) ejecutado en instancia activa:
       - Script: database/05_comunidad_favoritos_iteracion3.sql.
       - Objetos validados: FAVORITOS, IDX_FAVORITOS_PERFIL_FECHA, TRG_FAVORITOS_REGLAS_BI.
    - Script Oracle de comunidad (calificaciones) ejecutado en instancia activa:
       - Script: database/06_comunidad_calificaciones_iteracion3.sql.
       - Objetos validados: CALIFICACIONES, IDX_CALIFICACIONES_PERFIL_FECHA, IDX_CALIFICACIONES_CONTENIDO_PUNTAJE, TRG_CALIFICACIONES_REGLAS_BIU.
    - Modulo backend de comunidad implementado para bloque 1 de Epica 4:
       - POST /api/v1/community/favorites.
       - DELETE /api/v1/community/favorites/:contenidoId?perfilId=:id.
       - GET /api/v1/community/favorites?perfilId=:id.
       - GET /api/v1/community/favorites/status?perfilId=:id&contenidoId=:id.
    - Modulo backend de comunidad implementado para bloque 2 de Epica 4:
       - POST /api/v1/community/ratings.
       - DELETE /api/v1/community/ratings/:contenidoId?perfilId=:id.
       - GET /api/v1/community/ratings?perfilId=:id.
       - GET /api/v1/community/ratings/status?perfilId=:id&contenidoId=:id.
    - Browse frontend conectado con la fila "Continua viendo" usando la vista Oracle VW_CONTINUAR_VIENDO.
    - Acciones de reproduccion en browse integradas con backend para iniciar y retomar avances.
    - Seccion "Actividad reciente" integrada en browse con consumo del endpoint de historial.
      - Navegacion de detalle de contenido implementada (click en catalogo, continuar viendo e historial).
      - Integracion de favoritos en frontend:
         - Boton agregar/quitar favoritos en detalle de contenido.
         - Fila "Mi lista" en browse conectada a comunidad.
      - Integracion de calificaciones en frontend:
         - Selector de 1 a 5 estrellas y resena en detalle de contenido.
         - Guardar, actualizar y quitar calificacion desde la misma vista.
    - Mejoras responsivas adicionales aplicadas para viewport pequeno (max-width: 480px).
      - Suite de pruebas backend ampliada para reproduccion, auth y comunidad:
         - 4 suites.
         - 18 pruebas exitosas.
   - Error de tipado en pruebas de backend corregido agregando tipos globales de Jest en tsconfig.
   - Pipeline de calidad basico operativo.
2. Proximo paso inmediato:
   - Continuar Epica 4 (comunidad), bloque 3: reportes de contenido y moderacion.
   - Exponer bandeja inicial para revision de reportes por rol de soporte.
   - Implementar script NT5 de seguridad Oracle (`PROFILE`, roles, `GRANT` y pruebas de denegacion).
   - Formalizar modelado de departamentos y jerarquia supervisor-subordinado en alcance de datos y reglas.

## 7.1 Avance Cuantificado (Think Deeper)
1. Epica actual en ejecucion: Epica 4 (comunidad), bloques 1 y 2 completados; bloque 3 en preparacion.
2. Avance global estimado del proyecto: 53%.
3. Porcentaje faltante del proyecto: 47%.
4. Estado por epica (estimacion tecnica actual):
   - Epica 1 (catalogo): 45%.
     - Hecho: categorias, contenidos base, CRUD/filtros principales y browse por categoria.
     - Falta: generos M:N, temporadas/episodios, relaciones entre contenidos y reglas avanzadas.
   - Epica 2 (usuarios/perfiles): 70%.
     - Hecho: registro/login JWT, selector/gestion de perfiles, avatar, limites por plan.
     - Falta: programa de referidos completo y cobertura de datos personales extendidos.
   - Epica 3 (reproducciones): 58%.
     - Hecho: start/progress, continuar viendo, historial por perfil, validaciones Oracle y UI integrada.
     - Falta: seguimiento por episodio, reproductor real y eventos completos de sesion.
   - Epica 4 (comunidad): 38%.
     - Hecho: favoritos y calificaciones por perfil (backend + frontend + scripts Oracle + validaciones).
     - Falta: reportes de contenido, flujo de moderacion y bandeja operativa.
   - Epica 5 (facturacion): 0%.
   - Epica 6 (analitica): 0%.
5. Lectura ejecutiva:
   - La base de plataforma (auth, perfiles, catalogo inicial, tracking base, favoritos y calificaciones) esta funcional.
   - La brecha principal restante esta en comunidad, finanzas y analitica (epicas 4-6), ademas de nucleos academicos avanzados en Oracle.

## 8. Continuacion Paso a Paso (Detallada)
1. Paso 1 - Cerrar reglas Oracle de Iteracion 1:
   - Crear script versionado para reglas de perfiles por plan y perfil infantil.
   - Definir trigger de limite de perfiles por cuenta usando PLANES.LIMITE_PERFILES.
   - Definir validacion de clasificacion permitida para perfil infantil como regla reutilizable para consumo.
   - Estado actual:
     - Script creado: database/03_reglas_perfiles_iteracion1.sql.
     - Objetos aplicados en Oracle: TRG_PERFILES_LIMITE_PLAN_BI, FN_CLASIFICACION_PERMITIDA_PARA_PERFIL, VW_CONTENIDO_VISIBLE_POR_PERFIL.
     - Estado de compilacion: VALID en trigger, funcion y vista.
2. Paso 2 - Alinear backend con reglas Oracle:
   - Manejar errores Oracle de negocio (por ejemplo ORA-20001) en AuthService para mensajes controlados.
   - Agregar pruebas unitarias de limite de perfiles para garantizar simetria backend/DB.
   - Estado actual:
     - Manejo de ORA-20011 y ORA-20012 integrado en AuthService.createProfile.
       - Pruebas unitarias especificas de limite por trigger implementadas en minflix-backend/src/auth/auth.service.spec.ts.
3. Paso 3 - Iniciar Iteracion 2 en base de datos:
   - Crear tabla REPRODUCCIONES con progreso, dispositivo y fechas de control.
   - Crear indices para consulta por perfil, contenido y fecha de ultima reproduccion.
   - Preparar trigger para validar cuenta activa al registrar reproduccion.
   - Estado actual:
     - Script creado: database/04_reproducciones_iteracion2.sql.
     - Objetos aplicados en Oracle: REPRODUCCIONES, TRG_REPRODUCCIONES_REGLAS_BIU, VW_CONTINUAR_VIENDO.
     - Validacion funcional: insercion de reproduccion de prueba con PORCENTAJE_AVANCE calculado.
4. Paso 4 - Iniciar Iteracion 2 en backend:
   - Crear modulo de reproducciones con endpoints de iniciar, actualizar progreso y continuar viendo.
   - Incorporar guardas por perfil activo y validaciones de ownership.
    - Estado actual:
       - Modulo creado: minflix-backend/src/playback/playback.module.ts.
       - Servicio creado: minflix-backend/src/playback/playback.service.ts.
       - Endpoints listos y documentados en Swagger:
          - POST /api/v1/playback/start.
          - POST /api/v1/playback/progress.
          - GET /api/v1/playback/continue-watching.
          - GET /api/v1/playback/history.
       - Validaciones Oracle mapeadas a errores controlados para ORA-20021, ORA-20022, ORA-20023 y ORA-20024.
       - Browse integrado con consumo real de continuar viendo y acciones de iniciar/retomar reproduccion.
       - Browse integrado con historial de reproduccion por perfil para trazabilidad operativa.
      - Pruebas unitarias de PlaybackService implementadas en minflix-backend/src/playback/playback.service.spec.ts.
      - Validacion automatizada completada: npm run lint, npm run test -- --runInBand y npm run build en backend.
5. Paso 5 - Evidencia y calidad por cada bloque:
   - Ejecutar SQL por bloque y guardar resultados de conteo/validacion.
   - Ejecutar npm test, npm run lint y npm run build al cierre de cada subfase.
   - Actualizar README y este plan con estado real al finalizar cada bloque.
6. Paso 6 - Mejorar responsividad de vistas nuevas:
   - Revisar comportamiento en 920px, 640px y 480px.
   - Ajustar toolbar, hero, tarjetas y filas de scroll horizontal para pantallas pequenas.
   - Estado actual:
     - Validacion de build/lint frontend completada sin errores.
     - Ajustes aplicados en minflix-frontend/src/index.css para 480px (acciones, anchos y legibilidad).
     - Seccion Actividad reciente adaptada a grid responsivo (2 columnas en tablet, 1 columna en movil).
7. Paso 7 - Iniciar Epica 4 bloque 1 (favoritos por perfil):
    - Crear script Oracle de favoritos con restriccion de contenido por perfil infantil.
    - Exponer endpoints protegidos de comunidad para agregar, listar, validar estado y eliminar favoritos.
    - Integrar frontend con boton de favoritos en detalle y fila "Mi lista" en browse.
    - Estado actual:
         - Script creado y ejecutado: database/05_comunidad_favoritos_iteracion3.sql.
       - Modulo creado: minflix-backend/src/community/community.module.ts.
       - Endpoints listos y documentados en Swagger:
          - POST /api/v1/community/favorites.
          - DELETE /api/v1/community/favorites/:contenidoId?perfilId=:id.
          - GET /api/v1/community/favorites?perfilId=:id.
          - GET /api/v1/community/favorites/status?perfilId=:id&contenidoId=:id.
       - Frontend integrado en minflix-frontend/src/pages/ContentDetailPage.tsx y minflix-frontend/src/pages/BrowsePage.tsx.
       - Validacion automatizada completada:
          - Backend: npm run lint, npm run test -- --runInBand, npm run build.
          - Frontend: npm run lint, npm run build.
8. Paso 8 - Continuar Epica 4 bloque 2 (calificaciones por perfil):
   - Crear script Oracle de calificaciones con regla de elegibilidad por retencion (>50%).
   - Exponer endpoints protegidos de comunidad para crear/actualizar, listar, validar estado y eliminar calificaciones.
   - Integrar frontend de detalle con puntaje 1..5, reseña opcional y acciones de actualizar/quitar.
   - Estado actual:
      - Script creado y ejecutado: database/06_comunidad_calificaciones_iteracion3.sql.
      - Objetos aplicados en Oracle: CALIFICACIONES, IDX_CALIFICACIONES_PERFIL_FECHA, IDX_CALIFICACIONES_CONTENIDO_PUNTAJE, TRG_CALIFICACIONES_REGLAS_BIU.
      - Endpoints listos y documentados en Swagger:
         - POST /api/v1/community/ratings.
         - DELETE /api/v1/community/ratings/:contenidoId?perfilId=:id.
         - GET /api/v1/community/ratings?perfilId=:id.
         - GET /api/v1/community/ratings/status?perfilId=:id&contenidoId=:id.
      - Frontend integrado en minflix-frontend/src/pages/ContentDetailPage.tsx con formulario de calificacion y reseña.
      - Validacion automatizada backend completada: npm run lint, npm run test -- --runInBand y npm run build.
9. Paso 9 - Continuar Epica 4 bloque 3 (reportes y moderacion):
   - Crear tabla REPORTES con estados de ciclo de vida (abierto, en revision, resuelto, descartado).
   - Exponer endpoints para registrar reporte por usuario y gestion por rol de soporte.
   - Implementar bandeja de moderacion y flujo de resolucion en frontend.
   - Validar segregacion por rol para impedir que perfiles finales cierren reportes.
10. Paso 10 - Cerrar brecha NT5 (roles, permisos y seguridad Oracle):
   - Crear script de seguridad con PROFILE de sesiones e inactividad.
   - Crear roles `ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE`, `ROL_CONTENIDO`.
   - Asignar GRANT minimo necesario por rol y usuario.
   - Documentar evidencia de denegacion de acceso no autorizado.
11. Paso 11 - Cerrar brecha organizacional del enunciado:
   - Modelar departamentos (Tecnologia, Contenido, Marketing, Soporte, Finanzas).
   - Modelar jerarquia supervisor-subordinado en empleados.
   - Asegurar trazabilidad de empleado publicador de contenido y moderador resolutor de reportes.
12. Paso 12 - Cerrar trazabilidad academica integral:
   - Vincular entregables 1..10 a artefactos concretos del repositorio.
   - Marcar estado por entregable (pendiente/parcial/completado).
   - Consolidar evidencia para sustentacion (capturas, resultados SQL y pruebas).

## 9. Validacion de Schemas SQL (Paso 1 Think Deeper)
Fecha de validacion: 2026-04-10.

### 9.1 Inventario de scripts auditados
1. database/01_bootstrap_oracle_iteracion1.sql.
2. database/02_catalogo_base_iteracion2.sql.
3. database/03_reglas_perfiles_iteracion1.sql.
4. database/04_reproducciones_iteracion2.sql.
5. database/05_comunidad_favoritos_iteracion3.sql.
6. database/06_comunidad_calificaciones_iteracion3.sql.

### 9.2 Evidencia de validacion en Oracle
1. Conexion validada en `SYSTEM` sobre `FREEPDB1`.
2. Objetos nucleares detectados en esquema activo:
   - Tablas: PLANES, USUARIOS, PERFILES, CATEGORIAS, CONTENIDOS, REPRODUCCIONES, FAVORITOS, CALIFICACIONES.
   - Triggers: TRG_PERFILES_LIMITE_PLAN_BI, TRG_REPRODUCCIONES_REGLAS_BIU, TRG_FAVORITOS_REGLAS_BI, TRG_CALIFICACIONES_REGLAS_BIU.
   - Vistas: VW_CONTENIDO_VISIBLE_POR_PERFIL, VW_CONTINUAR_VIENDO.
   - Indices custom verificados: 10 en estado VALID.
3. Validaciones de seguridad NT5:
   - No existen aun `ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE`, `ROL_CONTENIDO` en el catalogo de roles.
   - No hay evidencia aun de PROFILE + GRANT + prueba de acceso denegado.
4. Calidad de diccionario:
   - Tablas nucleares sin `COMMENT ON TABLE`.
   - Columnas nucleares sin `COMMENT ON COLUMN`.
5. Riesgo de owner detectado:
   - Script 01 define bootstrap para `MINFLIX_APP`, pero scripts posteriores se ejecutan como owner `SYSTEM`.
   - En entorno actual se valida `SYSTEM` como esquema activo, sin evidencia de `MINFLIX_APP` operativo.

### 9.3 Cobertura contra el enunciado (schema)
1. Gestion de contenido (tipos base + clasificacion): parcial-avanzado.
2. Generos M:N: pendiente.
3. Temporadas y episodios (series/podcasts): pendiente.
4. Relaciones entre contenidos (secuela/precuela/remake/spin-off): pendiente.
5. Datos completos de usuario (telefono, fecha nacimiento, ciudad): pendiente.
6. Programa de referidos: pendiente.
7. Reproducciones con episodio exacto cuando aplique: pendiente.
8. Favoritos y calificaciones con reglas de negocio: avanzado.
9. Reportes de contenido y moderacion: pendiente.
10. Departamentos y jerarquia supervisor-subordinado: pendiente.
11. Pagos/facturacion/suspension por mora/fidelidad: pendiente.
12. NT1/NT2/NT3/NT4/NT5 con minimos cuantitativos completos: pendiente parcial (solo una parte de NT2 implementada).

### 9.4 Brechas criticas priorizadas
1. Estandarizar owner y estrategia de despliegue (recomendado: esquema dedicado `MINFLIX_APP`).
2. Cerrar NT5 de seguridad Oracle (roles, profile, grants y evidencia de restriccion).
3. Completar modelo de catalogo extendido (generos, temporadas, episodios, relaciones entre contenidos).
4. Completar comunidad bloque 3 (reportes + moderacion con segregacion por rol de soporte).
5. Completar dominio financiero y referidos para epicas 2/5.
6. Agregar `COMMENT ON TABLE/COLUMN` para cumplimiento del modelo fisico academico.

