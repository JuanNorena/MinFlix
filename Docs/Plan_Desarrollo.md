# Plan de Desarrollo MinFlix (Detallado y Alineado al Enunciado)

Fecha de corte: 2026-04-13

## 1. Objetivo del plan
1. Traducir el enunciado (1.1 a 1.6 y nucleos NT1..NT5) a actividades ejecutables.
2. Mantener trazabilidad total entre Oracle, backend, frontend, semillas y evidencias.
3. Cerrar brechas reales detectadas hoy:
   - datos personales obligatorios en registro,
   - flujo de pago simulado sin pasarela,
   - consistencia de menu hamburguesa,
   - semillas con datos suficientes para demo.

## 2. Principios de implementacion
1. Regla doble:
   - capa API (mensajes claros y validacion de entrada),
   - capa Oracle (constraints, triggers, PL/SQL).
2. Patron backend obligatorio por modulo:
   - entities -> dto -> contracts -> service -> controller -> module -> spec.
3. Patron frontend obligatorio por bloque:
   - pages -> shared/api -> shared/session/helpers -> router -> estilos.
4. Toda evolucion de DB en scripts secuenciales idempotentes.
5. TSDoc en espanol para componentes publicos.
6. Sin pasarela de pagos real: checkout simulado con exito controlado.

## 3. Estado consolidado despues de la alineacion actual

### 3.1 Oracle
1. Secuencia disponible hasta script 16.
2. Finanzas operativa para consulta y soporte de checkout simulado.
3. USUARIOS alineado con datos personales del enunciado.
4. Ejecucion tecnica de base de datos realizada en este corte: scripts 00..16 aplicados por MCP SQL Developer (inline SQL).

### 3.2 Backend
1. Modulos: auth, catalog, playback, community, finance.
2. Finance ahora incluye checkout simulado con tarjeta.
3. Registro de usuario ahora exige telefono, fechaNacimiento y ciudadResidencia.

### 3.3 Frontend
1. Vistas principales operativas con rutas protegidas.
2. Billing incluye formulario de tarjeta y pago simulado.
3. Menu hamburguesa alineado en vistas internas con topbar.

### 3.4 Matriz operativa por rol (vistas + metodos)
| Rol | Vistas habilitadas | Metodos/endpoints alineados | Cobertura de enunciado |
| --- | --- | --- | --- |
| usuario | `/profiles/select`, `/profiles/manage`, `/browse`, `/browse/content/:contentId`, `/account/billing` | `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET/POST/PATCH/DELETE /api/v1/auth/profiles`, `POST /api/v1/playback/start`, `POST /api/v1/playback/progress`, `GET /api/v1/playback/continue-watching`, `GET /api/v1/playback/history`, `POST/DELETE/GET /api/v1/community/favorites`, `POST/DELETE/GET /api/v1/community/ratings`, `POST/GET /api/v1/community/reports`, `GET /api/v1/finance/*`, `POST /api/v1/finance/payments/checkout` | 1.2, 1.3, 1.5 |
| admin | todas las del usuario + `/moderation/reports` | endpoints de usuario + `POST /api/v1/catalog/categories`, `POST /api/v1/catalog/contents`, `PATCH /api/v1/catalog/contents/:contentId`, `GET /api/v1/community/reports/moderation`, `PATCH /api/v1/community/reports/:reporteId/moderation` | 1.1, 1.2, 1.3, 1.4, 1.5 |
| soporte | vistas de usuario + `/moderation/reports` | endpoints de usuario + `GET /api/v1/community/reports/moderation`, `PATCH /api/v1/community/reports/:reporteId/moderation` | 1.3, 1.4 |
| contenido | vistas de usuario y catalogo | endpoints de usuario + `POST /api/v1/catalog/categories`, `POST /api/v1/catalog/contents`, `PATCH /api/v1/catalog/contents/:contentId` | 1.1, 1.4 |
| analista | vistas de usuario + (pendiente) dashboard analitico | endpoints de usuario + objetivo `GET /api/v1/analytics/consumption`, `GET /api/v1/analytics/finance`, `GET /api/v1/analytics/internal-performance` | 1.5, 1.6 |

## 4. Trazabilidad paso a paso contra enunciado

### 4.1 Enunciado 1.1 - Catalogo
1. SQL: 02 y 07.
2. Backend: catalog base en produccion, falta capa extendida de 07.
3. Frontend: detalle sin explotacion completa de temporadas/episodios/relaciones.
4. Accion planificada: cierre en I6.1.

### 4.2 Enunciado 1.2 - Usuarios y cuentas
1. SQL: 01 + 16 + seeds 13.
2. Backend: DTO y servicio de registro con datos personales completos.
3. Frontend: formulario de registro actualizado con campos obligatorios.
4. Accion planificada: hardening de validaciones y pruebas de regresion auth.

### 4.3 Enunciado 1.3 - Reproducciones e interaccion
1. SQL: 04, 05, 06, 08.
2. Backend: playback + community avanzados.
3. Frontend: browse/detail/moderacion avanzados.
4. Accion planificada: episodio exacto y refinamiento UX.

### 4.4 Enunciado 1.4 - Organizacion interna
1. SQL: 10.
2. Backend/frontend: falta modulo de consulta operacional.
3. Accion planificada: I6.3.

### 4.5 Enunciado 1.5 - Pagos y facturacion
1. SQL: 09, 14, 15.
2. Backend: endpoints financieros + checkout simulado.
3. Frontend: estado de cuenta + formulario de tarjeta.
4. Regla operativa oficial de este proyecto:
   - no pasarela,
   - no cobro real,
   - transaccion de prueba exitosa para demostrar flujo completo.

### 4.6 Enunciado 1.6 - Analitica
1. Estado: pendiente parcial.
2. Accion planificada: I6.4 con cierre NT1.

## 5. Secuencia oficial de scripts SQL
1. database/00_drop_all.sql (solo reset controlado)
2. database/01_bootstrap_oracle_iteracion1.sql
3. database/02_catalogo_base_iteracion2.sql
4. database/03_reglas_perfiles_iteracion1.sql
5. database/04_reproducciones_iteracion2.sql
6. database/05_comunidad_favoritos_iteracion3.sql
7. database/06_comunidad_calificaciones_iteracion3.sql
8. database/07_catalogo_extendido_iteracion4.sql
9. database/08_comunidad_reportes_moderacion_iteracion4.sql
10. database/09_finanzas_referidos_iteracion5.sql
11. database/10_organizacion_equipo_iteracion5.sql
12. database/11_seguridad_roles_nt5.sql
13. database/12_diccionario_comentarios_modelo_fisico.sql
14. database/13_seed_usuarios_roles_login_iteracion5.sql
15. database/14_seed_datos_funcionales_iteracion5.sql
16. database/15_finanzas_vistas_api_iteracion6.sql
17. database/16_usuarios_datos_personales_iteracion6.sql

## 6. Plan por iteraciones

### I6.1 - Cierre catalogo extendido y comunidad
1. Backend:
   - exponer endpoints de generos/temporadas/episodios/relacionados para rol contenido/admin.
   - mantener publicos de lectura `GET /api/v1/catalog/categories`, `GET /api/v1/catalog/contents`, `GET /api/v1/catalog/contents/:contentId`.
2. Frontend:
   - render completo de metadatos extendidos en `/browse/content/:contentId` para todos los roles con perfil.
3. Oracle:
   - evidencia de consultas de 07 y 08.

### I6.2 - Finanzas simuladas y datos personales (cierre)
1. Backend:
   - `GET /api/v1/finance/summary`, `GET /api/v1/finance/invoices`, `GET /api/v1/finance/payments`, `GET /api/v1/finance/referrals`.
   - `POST /api/v1/finance/payments/checkout` (simulacion sin pasarela).
2. Frontend:
   - `/account/billing` con formulario de tarjeta, pago simulado y responsive consistente con vistas internas.
3. Oracle:
   - vistas de soporte API (script 15).
   - columnas personales USUARIOS (script 16).
4. Seeds:
   - usuarios seed con telefono/fechaNacimiento/ciudad.
   - factura pendiente de prueba para checkout.

### I6.3 - Organizacion interna
1. Backend de consulta organizacional por rol interno (`admin`, `soporte`, `contenido`, `analista`).
2. Vista frontend de lectura por rol con separacion de responsabilidades del bloque 1.4.
3. Validaciones de jerarquia y consistencia por departamento (supervisor-subordinado).
4. Trazabilidad de metodos y vistas por departamento para sustentacion.

### I6.4 - Analitica ejecutiva
1. SQL NT1 completo.
2. Endpoints analiticos por dominio:
   - `GET /api/v1/analytics/consumption`,
   - `GET /api/v1/analytics/finance`,
   - `GET /api/v1/analytics/internal-performance`.
3. Dashboard analista/admin con filtros por ciudad, plan, genero, dispositivo y tiempo.

### I6.5 - Cierre academico NT2/NT3/NT4/NT5
1. Completar y documentar evidencias faltantes.
2. Preparar documento final de sustentacion.

## 7. Plan tecnico detallado por capa

### 7.1 Oracle
1. Script 16 aplica alter idempotente de USUARIOS.
2. Script 13 actualiza seeds por rol con datos personales.
3. Script 14 agrega factura pendiente para test de checkout.
4. Validaciones minimas post SQL:
   - columnas personales no nulas,
   - factura pendiente de usuario demo,
   - vistas de finanzas disponibles.

### 7.2 Backend
1. Auth:
   - UserEntity con telefono/fechaNacimiento/ciudadResidencia.
   - RegisterDto obligatorio con validaciones.
   - AuthService persiste campos y conserva seed admin.
2. Finance:
   - CheckoutPaymentDto para formulario de tarjeta.
   - FinanceService.checkoutPayment sin pasarela externa y con exito simulado.
   - FinanceController expone POST /finance/payments/checkout.
3. Pruebas:
   - ampliar finance.service.spec para checkout simulado.

### 7.3 Frontend
1. RegisterPage:
   - campos obligatorios: telefono, fechaNacimiento, ciudadResidencia.
2. BillingPage:
   - formulario de tarjeta,
   - submit de checkout simulado,
   - refresco de summary/invoices/payments.
3. Menu hamburguesa consistente:
   - browse (ya estaba),
   - content detail,
   - moderacion,
   - billing.

## 8. Definition of Done
1. SQL aplicado y validado sin errores.
2. Endpoints documentados y testeados.
3. UI con estados loading/error/empty.
4. Lint, build y pruebas en verde.
5. Documentacion sincronizada con codigo real.
6. Semillas suficientes para demo de sustentacion.

## 9. Cobertura de entregables oficiales
| Entregable | Estado | Observacion |
| --- | --- | --- |
| 1. Modelo de negocio | Parcial | falta documento final consolidado |
| 2. MER | Pendiente | falta artefacto final en entrega |
| 3. Script DDL | Avanzado | 01..12 + 16 |
| 4. Script datos | Parcial | 13 y 14 mejorados, falta volumen objetivo final |
| 5. NT1 | Pendiente | iteracion I6.4 |
| 6. NT2 | Parcial | hay base, faltan minimos formales completos |
| 7. NT3 | Pendiente | iteracion I6.5 |
| 8. NT4 | Pendiente parcial | indices existen, falta comparativa formal completa |
| 9. NT5 | Avanzado | script 11, falta paquete final de evidencia |
| 10. Sustentacion | Pendiente | iteracion I6.5 |

## 10. Proximo bloque inmediato
1. Validar flujo completo por rol en ambiente actual (scripts 00..16 ya ejecutados):
   - registro con datos personales,
   - login,
   - seleccion de perfil,
   - browse/detail,
   - billing,
   - checkout simulado exitoso,
   - factura actualizada.
2. Cerrar brechas de catalogo extendido con evidencia por rol y endpoint (I6.1).
3. Formalizar modulo de organizacion interna (I6.3).
4. Iniciar implementacion de analitica (I6.4).
