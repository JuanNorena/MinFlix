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
   - Script Oracle de comunidad (favoritos) ejecutado con evidencia de objetos:
     - Script: database/05_comunidad_favoritos_iteracion3.sql.
     - Objetos: FAVORITOS, IDX_FAVORITOS_PERFIL_FECHA, TRG_FAVORITOS_REGLAS_BI (VALID).
   - Modulo backend de comunidad implementado para bloque 1 de Epica 4:
     - POST /api/v1/community/favorites.
     - DELETE /api/v1/community/favorites/:contenidoId?perfilId=:id.
     - GET /api/v1/community/favorites?perfilId=:id.
     - GET /api/v1/community/favorites/status?perfilId=:id&contenidoId=:id.
   - Browse frontend conectado con la fila "Continua viendo" usando la vista Oracle VW_CONTINUAR_VIENDO.
   - Acciones de reproduccion en browse integradas con backend para iniciar y retomar avances.
   - Seccion "Actividad reciente" integrada en browse con consumo del endpoint de historial.
   - Epica 4 completada al 100% a nivel de base de datos Oracle:
     - Script: database/06_comunidad_calificaciones_reportes_iteracion3.sql.
     - Tabla CALIFICACIONES con constraint de puntuacion 1-5 y unicidad por perfil y contenido.
     - Trigger TRG_CALIFICACIONES_RETENSION_BI: bloquea calificar si el perfil no supero el 50% de reproduccion.
     - Tabla REPORTES con estados PENDIENTE, EN_REVISION, RESUELTO, DESCARTADO para gestion de soporte.
     - Indices: IDX_CALIFICACIONES_CONTENIDO, IDX_CALIFICACIONES_PERFIL, IDX_REPORTES_ESTADO, IDX_REPORTES_CONTENIDO.
   - Epica 5 completada al 100% a nivel de base de datos Oracle:
     - Script: database/07_finanzas_epica5.sql.
     - Columnas agregadas a USUARIOS: FECHA_SUSCRIPCION, ID_REFERIDOR (FK autorreferencial), FECHA_CORTE.
     - Tabla PAGOS con metodos (TARJETA_CREDITO, TARJETA_DEBITO, PSE, NEQUI, DAVIPLATA) y estados.
     - Trigger TRG_PAGOS_ACTIVAR_CUENTA_AU: reactiva cuenta SUSPENDIDA o INACTIVA tras pago exitoso.
     - Funcion FN_CALCULAR_MONTO: aplica descuento 10% por mas de 12 meses, 15% por mas de 24 meses y 5% adicional por referido activo (maximo 20%).
     - Procedimiento SP_FACTURACION_MENSUAL: batch mensual con cursor REF, SAVEPOINT por usuario y registro de pagos fallidos sin interrumpir el ciclo.
     - Procedimiento SP_SUSPENDER_CUENTAS_MOROSAS: cursor de cuentas activas con FECHA_CORTE vencida y sin pago exitoso en los ultimos 30 dias.
     - Todos los objetos en estado VALID verificado.
2. Proximo paso inmediato:
   - Epica 6 completada al 100% a nivel de base de datos Oracle:
     - Script: database/08_datos_prueba.sql — 28 usuarios, 200 reproducciones, 80 pagos, 60 calificaciones, 40 favoritos.
     - Script: database/09_analitica_epica6.sql con todos los requerimientos NT1:
       - 3 consultas parametrizadas con DEFINE/&&.
       - 2 PIVOT y 2 UNPIVOT sobre reproducciones y pagos.
       - 4 agrupamientos: ROLLUP, CUBE, GROUPING SETS y ROLLUP con GROUPING().
       - 2 vistas materializadas: MV_RATING_CONTENIDO y MV_METRICAS_FINANCIERAS (VALID).
       - Tabla particionada REPRODUCCIONES_PART por rango de fecha con 5 particiones.
   - Todos los scripts Oracle del 01 al 09 ejecutados y validados en MINFLIX_APP.
   - Siguiente frente: nucleos academicos NT2 (PL/SQL avanzado), NT3 (transacciones), NT4 (indices) y NT5 (roles y seguridad).
      - Navegacion de detalle de contenido implementada (click en catalogo, continuar viendo e historial).
      - Integracion de favoritos en frontend:
         - Boton agregar/quitar favoritos en detalle de contenido.
         - Fila "Mi lista" en browse conectada a comunidad.
    - Mejoras responsivas adicionales aplicadas para viewport pequeno (max-width: 480px).
      - Suite de pruebas backend ampliada para reproduccion, auth y comunidad:
         - 4 suites.
         - 15 pruebas exitosas.
   - Error de tipado en pruebas de backend corregido agregando tipos globales de Jest en tsconfig.
   - Pipeline de calidad basico operativo.
2. Proximo paso inmediato:
    - Implementar Epica 6 (Analitica): consultas OLAP, ROLLUP, CUBE, GROUPING SETS y vistas materializadas.
    - Documentar evidencia de ejecucion Oracle para Epicas 4 y 5.



## 7.1 Avance Cuantificado (Think Deeper)
1. Epica actual en ejecucion: Epica 4 (comunidad), bloque 1 completado y bloque 2 en preparacion.
2. Avance global estimado del proyecto: 47%.
3. Porcentaje faltante del proyecto: 53%.
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
   - Epica 4 (comunidad): 18%.
     - Hecho: favoritos por perfil (backend + frontend + script Oracle de soporte).
     - Falta: calificaciones, resenas, reportes y bandeja de moderacion.
   - Epica 5 (facturacion): 0%.
   - Epica 6 (analitica): 0%.
5. Lectura ejecutiva:
   - La base de plataforma (auth, perfiles, catalogo inicial, tracking base y favoritos) esta funcional.
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
       - Script creado: database/05_comunidad_favoritos_iteracion3.sql.
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

