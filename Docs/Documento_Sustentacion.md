# Documento de Sustentación — Proyecto MinFlix

**Asignatura:** Bases de Datos II  
**Semestre:** Noveno  
**Integrantes:** Juan Sebastián Noreña Espinosa, Daniel Eduardo Jurado Celemín, Samuel Andrés Castaño  
**Docente:** *Por definir*  
**Fecha de corte:** Mayo 2026  
**Stack tecnológico:** Oracle Database 21c XE + NestJS (TypeORM) + React 19 + Vite

---

## 1. Resumen Ejecutivo

MinFlix es una plataforma de streaming multimedia con operaciones en Colombia que modela un dominio real de suscripción de contenido. El sistema gestiona catálogo multiformato (películas, series, documentales, música, podcasts), cuentas multi-perfil con planes de suscripción, historial de reproducción con continuidad, interacción social (favoritos, calificaciones con regla del 50%, reportes y moderación), ciclo de facturación mensual simulado, programa de referidos con descuentos, y analítica ejecutiva por ciudad, plan, género y dispositivo.

La arquitectura implementa tres capas: **Frontend React** consume una **REST API NestJS**, la cual se conecta a **Oracle Database** vía TypeORM. Los 23 scripts SQL versionados (00..21 + run_all) cubren los cinco núcleos temáticos académicos (NT1..NT5), mientras que el backend y frontend demuestran la integración operativa del modelo de datos en un producto funcional.

---

## 2. Arquitectura de Tres Capas

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND — React 19 + TypeScript + Vite                            │
│  Pages: Login, Register, ProfileSelector, Profiles, Browse,        │
│         ContentDetail, Billing, ReportsModeration, Analytics        │
│  State: JWT (localStorage), perfil activo (localStorage),           │
│         React Query (server state), Zod + react-hook-form         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Axios + JWT Bearer
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND — NestJS + TypeORM Oracle Driver                           │
│  Modules: auth, catalog, playback, community, finance, analytics    │
│  Guards: JwtAuthGuard, LocalAuthGuard (Passport.js)                 │
│  Docs: Swagger en /api/docs con Bearer Auth                         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ SQL / PL/SQL
┌─────────────────────────────────────────────────────────────────────┐
│  ORACLE DATABASE — Esquema MINFLIX_APP                            │
│  19+ tablas, 7+ triggers, 3 vistas API, 3 vistas analíticas,        │
│  2 vistas materializadas, 4 roles + PROFILE, particionamiento       │
└─────────────────────────────────────────────────────────────────────┘
```

**Decision clave:** se usa TypeORM para operaciones CRUD transaccionales, pero el módulo de analítica usa `DataSource.query()` con SQL nativo para consumir directamente las vistas `VW_ANALITICA_*`. Esto demuestra que el backend no oculta Oracle: delega agregaciones complejas al motor de base de datos.

---

## 3. Modelo de Datos y Normalización

### 3.1 Entidades principales

| Entidad | Propósito | Normalización |
|---------|-----------|---------------|
| `USUARIOS` | Cuenta principal (login, datos personales, plan, estado) | 3FN: ciudad y fecha de nacimiento dependen únicamente del usuario |
| `PERFILES` | Perfiles de reproducción dentro de una cuenta (adulto/infantil) | 3FN: tipo_perfil y nombre dependen de ID_USUARIO |
| `PLANES` | Catálogo de suscripción (BÁSICO, ESTÁNDAR, PREMIUM) | 3FN: precio y límite de perfiles son atributos del plan |
| `CATEGORIAS` / `CONTENIDOS` | Catálogo con tipo, clasificación, exclusividad | 3FN: categoría es entidad independiente |
| `GENEROS` / `CONTENIDOS_GENEROS` | Relación M:N entre contenido y género | Resolución de M:N en tabla intermedia |
| `TEMPORADAS` / `EPISODIOS` | Estructura jerárquica para series y podcasts | 3FN: temporada depende de contenido; episodio de temporada |
| `CONTENIDOS_RELACIONADOS` | Relación reflexiva (secuela, precuela, remake) | 3FN: tipo de relación es atributo de la asociación |
| `REPRODUCCIONES` | Sesión de visionado con dispositivo, progreso y porcentaje | 3FN: todo atributo depende de la sesión |
| `FAVORITOS` / `CALIFICACIONES` | Interacción social del perfil con contenido | 3FN: puntaje y reseña dependen del par (perfil, contenido) |
| `REPORTES` | Ciclo de vida de moderación de contenido inapropiado | 3FN: estado, motivo y resolución dependen del reporte |
| `REFERIDOS` / `FACTURACIONES` / `PAGOS` | Ciclo financiero mensual | 3FN: facturación depende de usuario; pago depende de facturación |
| `DEPARTAMENTOS` / `EMPLEADOS` | Organización interna con jerarquía supervisor-subordinado | 3FN: supervisor es FK reflexiva en EMPLEADOS |

### 3.2 Modelo Entidad-Relación (MER)

El MER se entrega como imagen PNG/PDF generada con Data Modeler. Captura todas las entidades anteriores, cardinalidades (1:N, M:N, reflexiva), atributos compuestos (temporada/episodio), y resolución de la relación M:N entre CONTENIDOS y GENEROS mediante CONTENIDOS_GENEROS.

---

## 4. Mapeo de Núcleos Temáticos (NT1..NT5) a Scripts SQL

Cada núcleo temático del enunciado académico se implementa en scripts dedicados. A continuación se detalla **dónde vive cada requerimiento**, **cómo se cumple**, y **qué líneas consultar**.

---

### 4.1 NT1 — Consultas Avanzadas y Almacenamiento (25% de la nota)

**Script:** `database/17_analitica_nt1.sql`

#### 4.1.1 Fragmentación (particionamiento) — Sección A

- **Requerimiento:** 1 fragmentación mínima por ventanas de tiempo.
- **Implementación:** La tabla `REPRODUCCIONES` se recrea con `PARTITION BY RANGE (FECHA_INICIO)`.
- **Particiones:**
  - `P_2024`: valores < 2025-01-01
  - `P_2025_Q1`: valores < 2025-04-01
  - `P_2025_Q2`: valores < 2025-07-01
  - `P_2025_Q3`: valores < 2025-10-01
  - `P_FUTURO`: `MAXVALUE`
- **Justificación:** Las consultas analíticas filtran frecuentemente por rango de fechas (`WHERE FECHA_INICIO BETWEEN ...`). Oracle realiza partition pruning, evitando escanear toda la tabla.
- **Estrategia de migración:** backup (`REPRODUCCIONES_BKP`) → DROP → CREATE particionada → reinsertar → recrear índices LOCAL y trigger.

#### 4.1.2 Vistas Materializadas — Sección B

- **Requerimiento:** 2 vistas materializadas mínimo.
- **MV 1:** `MV_CALIFICACIONES_PROMEDIO`
  - Pre-calcula promedio de puntaje, total de calificaciones, puntaje mínimo/máximo por contenido y género.
  - `BUILD IMMEDIATE` + `REFRESH ON DEMAND`.
- **MV 2:** `MV_METRICAS_FINANCIERAS`
  - Agrega ingresos totales, cobrados y pendientes por plan, año y mes.
  - Usa `CASE WHEN` para separar ingresos por estado de factura.

#### 4.1.3 Consultas Parametrizadas — Sección C

- **Requerimiento:** 3 consultas parametrizadas mínimo.
- **C.1:** Top N contenidos más reproducidos por ciudad (`DEFINE ciudad`, `DEFINE limite`).
- **C.2:** Ingresos de facturación agrupados por mes en rango de fechas (`DEFINE fecha_inicio`, `DEFINE fecha_fin`).
- **C.3:** Estadísticas de calificaciones por género (`DEFINE genero`).

#### 4.1.4 PIVOT y UNPIVOT — Sección D

- **Requerimiento:** 2 PIVOT + 2 UNPIVOT.
- **PIVOT D.1:** Reproducciones por dispositivo (filas) y mes (columnas MES_1..MES_12).
- **PIVOT D.2:** Usuarios activos por plan (filas) y ciudad (columnas BOGOTA, MEDELLIN, CALI, etc.).
- **UNPIVOT D.3:** Revierte PIVOT D.1 a filas (DISPOSITIVO, MES_NOMBRE, TOTAL_REPRODUCCIONES).
- **UNPIVOT D.4:** Desnormaliza `MV_METRICAS_FINANCIERAS` convirtiendo `INGRESOS_COBRADOS` e `INGRESOS_PENDIENTES` en filas con etiqueta `TIPO_INGRESO`.

#### 4.1.5 Agrupamientos Avanzados — Sección E

- **Requerimiento:** 4 mínimo (ROLLUP, CUBE, GROUPING, GROUPING SETS).
- **E.1 ROLLUP:** Subtotales jerárquicos de ingresos por año → mes.
- **E.2 CUBE:** Todas las combinaciones entre dispositivo y año de reproducción.
- **E.3 GROUPING():** Etiqueta filas de subtotal (`'TOTAL GENERAL'`, `'SUBTOTAL AÑO'`) usando `DECODE(GROUPING(...), 1, ...)`. Esto permite que el frontend distinga filas de detalle vs agregadas sin lógica adicional.
- **E.4 GROUPING SETS:** Combinaciones específicas a elección: (ciudad + plan), (solo ciudad), (solo plan), (gran total).

#### 4.1.6 Vistas de Lectura para Backend — Sección F

- **Vista F.1:** `VW_ANALITICA_CONSUMO` → consumida por `GET /api/v1/analytics/consumption`.
- **Vista F.2:** `VW_ANALITICA_FINANZAS` → consumida por `GET /api/v1/analytics/finance`.
- **Vista F.3:** `VW_ANALITICA_RENDIMIENTO` → consumida por `GET /api/v1/analytics/internal-performance`.
- Cada vista tiene `GRANT SELECT` para `ROL_ANALISTA` y `ROL_ADMIN`.

---

### 4.2 NT2 — Programación PL/SQL (30% de la nota)

**Script:** `database/18_plsql_nt2_completo.sql`

#### 4.2.1 Cursores (2 requeridos)

- **Cursor A.1:** `CUR_CARTERA_VENCIDA`
  - Recorre facturas pendientes con más de 30 días de vencimiento.
  - JOIN a `USUARIOS` para traer nombre y email del deudor.
  - Acumula monto total vencido e imprime detalle por consola.
- **Cursor A.2:** `CUR_POPULARIDAD_CATALOGO`
  - Recorre contenidos con reproducciones y calcula métricas de popularidad.
  - LEFT JOIN con `CALIFICACIONES` para incluir contenidos sin reviews.
  - Almacena resultados en tabla temporal `TMP_POPULARIDAD_CATALOGO` usando `MERGE INTO` para idempotencia.

#### 4.2.2 Procedimientos Almacenados (3 requeridos)

- **B.1 `SP_REGISTRAR_USUARIO`:**
  - Registro atómico de cliente + perfil inicial + factura.
  - Maneja `NO_DATA_FOUND` (plan inexistente), `DUP_VAL_ON_INDEX` (email duplicado), y `OTHERS`.
  - Normaliza email con `LOWER(TRIM(...))`.
- **B.2 `SP_CAMBIAR_PLAN`:**
  - Valida que los perfiles actuales no excedan el límite del nuevo plan.
  - Si excede, lanza `RAISE_APPLICATION_ERROR(-20111, ...)` antes de modificar datos.
  - Verifica `SQL%ROWCOUNT = 0` para detectar usuario inexistente.
- **B.3 `SP_APLICAR_MORA_CUENTAS`:**
  - Ubicado en `09_finanzas_referidos_iteracion5.sql`.
  - Procesa masivamente facturas vencidas, actualizando estado a `'MORA'` y desactivando cuentas si aplica.

#### 4.2.3 Funciones (2 requeridas)

- **C.1 `FN_CALCULAR_MONTO`:**
  - Calcula monto final con descuentos por referidos (cap al 30%) y fidelidad (>12 meses = 10%, >24 meses = 15%).
  - Usa `MONTHS_BETWEEN(SYSDATE, MIN(FECHA_CREACION))` para antigüedad.
  - Retorna 0 si no tiene plan, -1 en error inesperado.
- **C.2 `FN_CONTENIDO_RECOMENDADO`:**
  - Motor básico de recomendación basado en géneros de favoritos del perfil.
  - Fallback a popularidad global si el perfil no tiene favoritos.
  - Usa `ROWNUM = 1` para retornar solo el contenido más popular válido.
- **Función existente (script 03):** `FN_CLASIFICACION_PERMITIDA_PARA_PERFIL`
  - Recibe tipo de perfil y clasificación por edad; retorna 1 (permitido) o 0 (bloqueado).

#### 4.2.4 Manejo de Excepciones (2+ requeridas)

Cada bloque PL/SQL captura:
- `NO_DATA_FOUND`: plan/usuario/perfil inexistente.
- `DUP_VAL_ON_INDEX`: violación de UK (email duplicado, factura duplicada).
- `OTHERS`: cualquier error inesperado con `ROLLBACK` y mensaje detallado.

#### 4.2.5 Disparadores/Triggers (4+ requeridos)

| Trigger | Script | Tabla | Regla de negocio |
|---------|--------|-------|------------------|
| `TRG_PERFILES_LIMITE_PLAN_BI` | 03 | PERFILES | ORA-20011/20012: máximo de perfiles según plan |
| `TRG_REPRODUCCIONES_REGLAS_BIU` | 04/17 | REPRODUCCIONES | ORA-20021..20024: cuenta activa + clasificación + progreso ≤ duración + cálculo automático de % |
| `TRG_FACTURACIONES_CALCULO_BIU` | 09 | FACTURACIONES | ORA-20081/20082: validación fechas + cálculo monto_final con descuentos |
| `TRG_PAGOS_ACTUALIZA_FACTURA_AI` | 09 | PAGOS | Pago exitoso → factura PAGADA + cuenta ACTIVA |
| `TRG_FAVORITOS_REGLAS_BI` | 05 | FAVORITOS | ORA-20031/20032: perfil infantil no puede agregar contenido +16/+18 |
| `TRG_CALIFICACIONES_REGLAS_BIU` | 06 | CALIFICACIONES | ORA-20041/20042: mínimo 50% de reproducción antes de calificar |
| `TRG_REPORTES_REGLAS_BIU` | 08 | REPORTES | ORA-20061..20066: validación de moderador, coherencia de fechas y estados |

---

### 4.3 NT3 — Transacciones y Concurrencia (15% de la nota)

**Script:** `database/19_transacciones_nt3.sql`

#### 4.3.1 Transacción 1: Registro atómico de Cliente + Plan + Perfil + Factura

- **Objetivo:** Demostrar atomicidad, aislamiento y consistencia.
- **Pasos:**
  1. Leer plan por nombre (`SELECT INTO`).
  2. `INSERT INTO USUARIOS` con `RETURNING ID_USUARIO`.
  3. `INSERT INTO PERFILES` vinculado al usuario creado.
  4. `INSERT INTO FACTURACIONES` del periodo actual.
  5. `COMMIT` si todo OK; `ROLLBACK` en cualquier excepción.
- **Excepciones:** `DUP_VAL_ON_INDEX` (email duplicado) → `ROLLBACK` + `RAISE_APPLICATION_ERROR(-20301, ...)`.

#### 4.3.2 Transacción 2: Facturación masiva con SAVEPOINT

- **Objetivo:** Demostrar `SAVEPOINT` para aislar fallos por usuario dentro de un lote.
- **Estrategia:** Cursor sobre usuarios activos. Por cada usuario:
  1. `SAVEPOINT SP_USUARIO;`
  2. Insertar factura del periodo.
  3. Si falla (`DUP_VAL_ON_INDEX` u otro): `ROLLBACK TO SAVEPOINT SP_USUARIO;` y continuar con el siguiente usuario.
  4. Al finalizar el loop: `COMMIT` de todas las facturas exitosas.
- **Ventaja:** Un error en un usuario no aborta toda la facturación masiva.

#### 4.3.3 Transacción 3: Eliminación en cascada segura (hard delete)

- **Objetivo:** Demostrar eliminación controlada respetando constraints FK en orden inverso.
- **Orden crítico:**
  1. `DELETE FROM REPRODUCCIONES` (perfil)
  2. `DELETE FROM FAVORITOS` (perfil)
  3. `DELETE FROM CALIFICACIONES` (perfil)
  4. `DELETE FROM REPORTES` (perfil reportador)
  5. `UPDATE REPORTES SET ID_USUARIO_MODERADOR = NULL` (desligar moderador)
  6. `DELETE FROM PAGOS` (antes que facturaciones, por FK)
  7. `DELETE FROM PERFILES`
  8. `DELETE FROM FACTURACIONES`
  9. `DELETE FROM REFERIDOS`
  10. `DELETE FROM EMPLEADOS`
  11. `DELETE FROM USUARIOS`
- `COMMIT` al final; `ROLLBACK` en cualquier error.

#### 4.3.4 Escenario de Concurrencia: SELECT FOR UPDATE

- **Objetivo:** Demostrar control de bloqueos en modificaciones competitivas.
- **Sesión A:**
  ```sql
  SELECT ID_USUARIO INTO V_ID_USUARIO
  FROM USUARIOS
  WHERE EMAIL = 'usuario.seed@minflix.local'
  FOR UPDATE WAIT 10;
  ```
  - Adquiere bloqueo sobre la fila del usuario.
  - Simula procesamiento con `DBMS_LOCK.SLEEP(3)`.
  - Ejecuta `UPDATE USUARIOS SET ID_PLAN = ...` y `COMMIT`.
- **Sesión B (segunda ventana SQL):**
  - Intenta `SELECT ... FOR UPDATE` sobre la misma fila.
  - Resultado: espera hasta que A haga `COMMIT` (comportamiento `WAIT`).
  - Si se usa `NOWAIT`: `ORA-00054` (resource busy).
  - Si se usa `WAIT N` y expira: `ORA-30006`.

---

### 4.4 NT4 — Estrategias de Indexación (10% de la nota)

**Script:** `database/20_indices_nt4.sql`

#### 4.4.1 Índices creados (4 requeridos)

| Índice | Tabla | Columnas | Justificación |
|--------|-------|----------|---------------|
| `IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO` | REPRODUCCIONES | `(ID_PERFIL, FECHA_INICIO DESC)` | La consulta de historial por perfil filtra por `ID_PERFIL` y ordena por `FECHA_INICIO DESC`. El índice compuesto evita el SORT operation costoso. |
| `IDX_CONTENIDOS_CATEGORIA_ANIO` | CONTENIDOS | `(ID_CATEGORIA, ANIO_LANZAMIENTO DESC)` | La página de browse filtra por categoría y año. Sin índice, Oracle hace FULL TABLE SCAN. |
| `IDX_USUARIOS_CIUDAD_ESTADO` | USUARIOS | `(UPPER(CIUDAD_RESIDENCIA), ESTADO_CUENTA)` | Las vistas analíticas agrupan frecuentemente por ciudad y estado. El índice con `UPPER` acelera filtros case-insensitive. |
| `IDX_CALIFICACIONES_CONTENIDO_FECHA` | CALIFICACIONES | `(ID_CONTENIDO, FECHA_CALIFICACION DESC)` | La vista materializada `MV_CALIFICACIONES_PROMEDIO` y el detalle de contenido agrupan calificaciones por contenido. |

#### 4.4.2 Análisis EXPLAIN PLAN

Para cada índice, el script ejecuta:
1. `EXPLAIN PLAN FOR` (consulta pesada sin índice nuevo).
2. `DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST')` → captura plan antes.
3. `CREATE INDEX` (idempotente: verifica `USER_INDEXES` antes).
4. `EXPLAIN PLAN FOR` (misma consulta con índice).
5. `DBMS_XPLAN.DISPLAY` → captura plan después.

**Diferencia esperada:**
- **Antes:** `TABLE ACCESS FULL` + `SORT ORDER BY` con alto costo.
- **Después:** `INDEX RANGE SCAN` + `INDEX FULL SCAN DESCENDING` sin operación SORT.

---

### 4.5 NT5 — Privilegios y Seguridad del Acceso (10% de la nota)

**Script:** `database/11_seguridad_roles_nt5.sql`

#### 4.5.1 PROFILE de seguridad

- `PRF_MINFLIX_OPERACION`:
  - 3 sesiones concurrentes máximo.
  - 30 minutos de inactividad (`IDLE_TIME`).
  - 5 intentos fallidos de login (`FAILED_LOGIN_ATTEMPTS`).
  - Contraseña caduca cada 180 días (`PASSWORD_LIFE_TIME`).

#### 4.5.2 Roles y permisos

| Rol | Permisos | Propósito |
|-----|----------|-----------|
| `ROL_ADMIN` | Full CRUD en todas las tablas + `EXECUTE` en funciones/procedures | Administración total del esquema |
| `ROL_ANALISTA` | `SELECT` sobre todas las tablas + vistas analíticas + MVs | Lectura analítica exclusiva (BI) |
| `ROL_SOPORTE` | `SELECT` en tablas de contexto + `INSERT/UPDATE` en `REPORTES` | Moderación de reportes y soporte |
| `ROL_CONTENIDO` | Mantenimiento editorial del catálogo (`CATEGORIAS`, `CONTENIDOS`) | Gestión de contenido (sin finanzas ni moderación) |

#### 4.5.3 Demostración de restricción

- Se crean 4 usuarios de base de datos (`USR_ADMIN`, `USR_ANALISTA`, `USR_SOPORTE`, `USR_CONTENIDO`) con roles asignados.
- **Prueba de fallo:** Si `USR_CONTENIDO` intenta `SELECT * FROM FACTURACIONES`, Oracle devuelve `ORA-00942: table or view does not exist` (falta de privilegio).
- **Prueba de éxito:** `USR_ANALISTA` puede consultar `VW_ANALITICA_FINANZAS` sin problemas.

---

## 5. Trazabilidad de Consultas SQL en la Aplicación

Esta sección es crítica para la sustentación oral: demuestra que las consultas SQL no quedaron en archivos aislados, sino que son consumidas activamente por el backend y frontend.

### 5.1 Módulo Auth — Cuentas y Perfiles

| Endpoint | Método SQL / Tabla | Archivo Backend | Archivo Frontend |
|----------|--------------------|-----------------|------------------|
| `POST /auth/register` | `INSERT INTO USUARIOS` + `INSERT INTO PERFILES` | `auth.service.ts` | `RegisterPage.tsx` |
| `POST /auth/login` | `SELECT ... FROM USUARIOS WHERE UPPER(EMAIL) = UPPER(:email)` | `auth.service.ts` | `LoginPage.tsx` |
| `GET /auth/profiles` | `SELECT ... FROM PERFILES WHERE ID_USUARIO = :id` | `auth.service.ts` | `ProfileSelectorPage.tsx`, `ProfilesPage.tsx` |
| `POST /auth/profiles` | `INSERT INTO PERFILES` (catch `ORA-20011`) | `auth.service.ts` | `ProfilesPage.tsx` |
| `DELETE /auth/profiles/:id` | `DELETE FROM PERFILES` | `auth.service.ts` | `ProfilesPage.tsx` |

**Regla de negocio validada:** El límite de perfiles por plan se valida doblemente:
1. **App-level:** `AuthService.createProfile` consulta `plan.limitePerfiles` y lanza `BadRequestException` si excede.
2. **DB-level:** El trigger `TRG_PERFILES_LIMITE_PLAN_BI` lanza `ORA-20011` si se viola el límite. El backend captura este código y lo mapea a HTTP 400.

### 5.2 Módulo Catalog — Navegación de Contenido

| Endpoint | Método SQL / Tabla | Archivo Backend | Archivo Frontend |
|----------|--------------------|-----------------|------------------|
| `GET /catalog/categories` | `SELECT ... FROM CATEGORIAS` | `catalog.service.ts` | `BrowsePage.tsx` |
| `GET /catalog/contents` | `SELECT ... FROM CONTENIDOS` (filtros por tipo, categoría, clasificación) | `catalog.service.ts` | `BrowsePage.tsx` |
| `GET /catalog/contents/:id` | `SELECT ... FROM CONTENIDOS WHERE ID_CONTENIDO = :id` | `catalog.service.ts` | `ContentDetailPage.tsx` |
| `POST /catalog/contents` | `INSERT INTO CONTENIDOS` | `catalog.service.ts` | `ContentDetailPage.tsx` (admin/contenido) |

**Vista de contenido visible:** `VW_CONTENIDO_VISIBLE_POR_PERFIL` (script 03) filtra contenido permitido según tipo de perfil y clasificación por edad. Es consumida indirectamente por el frontend al renderizar catálogo.

### 5.3 Módulo Playback — Reproducción y Continuidad

| Endpoint | Método SQL / Tabla/Vista | Archivo Backend | Archivo Frontend |
|----------|--------------------------|-----------------|------------------|
| `POST /playback/start` | `INSERT INTO REPRODUCCIONES` (trigger calcula % automático) | `playback.service.ts` | `ContentDetailPage.tsx` |
| `POST /playback/progress` | `UPDATE REPRODUCCIONES SET PROGRESO_SEGUNDOS = ...` | `playback.service.ts` | Reproductor en `ContentDetailPage.tsx` |
| `GET /playback/continue-watching` | `SELECT ... FROM VW_CONTINUAR_VIENDO` | `playback.service.ts` | `BrowsePage.tsx` (fila horizontal) |
| `GET /playback/history` | `SELECT ... FROM REPRODUCCIONES` (JOIN a CONTENIDOS) | `playback.service.ts` | `BrowsePage.tsx` |

**Vista clave:** `VW_CONTINUAR_VIENDO` usa `ROW_NUMBER()` sobre reproducciones no finalizadas, ordenadas por fecha de último evento. El backend la mapea a `ContinueWatchingView`.

### 5.4 Módulo Community — Favoritos, Calificaciones y Reportes

| Endpoint | Método SQL / Tabla | Archivo Backend | Archivo Frontend |
|----------|--------------------|-----------------|------------------|
| `POST /community/favorites` | `INSERT INTO FAVORITOS` (trigger valida clasificación infantil) | `community.service.ts` | `ContentDetailPage.tsx` |
| `DELETE /community/favorites/:id` | `DELETE FROM FAVORITOS` | `community.service.ts` | `ContentDetailPage.tsx` |
| `POST /community/ratings` | `INSERT/UPDATE CALIFICACIONES` (trigger valida 50% reproducción) | `community.service.ts` | `ContentDetailPage.tsx` (estrellas + reseña) |
| `POST /community/reports` | `INSERT INTO REPORTES` | `community.service.ts` | `ContentDetailPage.tsx` (modal de reporte) |
| `GET /community/reports/moderation` | `SELECT ... FROM VW_REPORTES_PENDIENTES_SOPORTE` | `community.service.ts` | `ReportsModerationPage.tsx` |
| `PATCH /community/reports/:id/moderation` | `UPDATE REPORTES SET ESTADO = ...` | `community.service.ts` | `ReportsModerationPage.tsx` |

**Triggers validados:**
- `TRG_FAVORITOS_REGLAS_BI`: rechaza favoritos de contenido +16/+18 para perfiles infantiles → `ORA-20031`.
- `TRG_CALIFICACIONES_REGLAS_BIU`: rechaza calificación si avance < 50% → `ORA-20041`.

### 5.5 Módulo Finance — Estado de Cuenta y Pagos Simulados

| Endpoint | Método SQL / Tabla | Archivo Backend | Archivo Frontend |
|----------|--------------------|-----------------|------------------|
| `GET /finance/summary` | `SELECT COUNT(...) FROM FACTURACIONES` + `SELECT NVL(SUM(...), 0) FROM PAGOS` + `SELECT NVL(MAX(...), 0) FROM REFERIDOS` | `finance.service.ts` | `BillingPage.tsx` |
| `GET /finance/invoices` | `SELECT ... FROM FACTURACIONES WHERE ID_USUARIO = :id` | `finance.service.ts` | `BillingPage.tsx` |
| `GET /finance/payments` | `SELECT ... FROM PAGOS WHERE ID_USUARIO = :id` | `finance.service.ts` | `BillingPage.tsx` |
| `GET /finance/referrals` | `SELECT ... FROM REFERIDOS` | `finance.service.ts` | `BillingPage.tsx` |
| `POST /finance/payments/checkout` | `INSERT INTO PAGOS` (trigger `TRG_PAGOS_ACTUALIZA_FACTURA_AI` actualiza factura a PAGADA y cuenta a ACTIVA) | `finance.service.ts` | `BillingPage.tsx` (formulario de tarjeta) |

**Decision funcional:** No se integra pasarela real. El checkout es una simulación controlada: el usuario ingresa datos de tarjeta, el backend marca la transacción como EXITOSA y actualiza la factura. Esto permite demostrar el flujo completo sin dependencias externas.

### 5.6 Módulo Analytics — Analítica Ejecutiva (NT1 en vivo)

| Endpoint | Vista Oracle consultada | Archivo Backend | Archivo Frontend |
|----------|------------------------|-----------------|------------------|
| `GET /analytics/consumption` | `VW_ANALITICA_CONSUMO` | `analytics.service.ts` | `AnalyticsDashboardPage.tsx` |
| `GET /analytics/finance` | `VW_ANALITICA_FINANZAS` | `analytics.service.ts` | `AnalyticsDashboardPage.tsx` |
| `GET /analytics/internal-performance` | `VW_ANALITICA_RENDIMIENTO` | `analytics.service.ts` | `AnalyticsDashboardPage.tsx` |

**Mecanismo:** `AnalyticsService` usa `DataSource.query<Record<string, unknown>[]>` para ejecutar SQL nativo parametrizado con filtros dinámicos (ciudad, categoría, género, plan, período). Los resultados se mapean con helpers `toText`, `toNumber`, `toNullableText` para manejar valores NULL de Oracle.

**Seguridad:** `AnalyticsController` exige `JwtAuthGuard` y `AnalyticsService.assertAnalyticsRole()` rechaza roles distintos a `admin` o `analista` con `ForbiddenException`.

---

## 6. Decisiones de Diseño Críticas

### 6.1 ¿Por qué Oracle y no PostgreSQL/MySQL?

El enunciado académico exige características propietarias de Oracle:
- `PARTITION BY RANGE` (fragmentación).
- `MATERIALIZED VIEW` con `REFRESH ON DEMAND`.
- `DBMS_XPLAN.DISPLAY` para análisis de índices.
- `SELECT FOR UPDATE` con `WAIT` / `NOWAIT` para concurrencia.
- PL/SQL (triggers, procedimientos, funciones, cursores).
- Perfiles (`PROFILE`), roles y `GRANT` granular.

### 6.2 ¿Por qué triggers en vez de solo validación en backend?

Se implementa **validación doble** por seguridad y demostración académica:
1. **Backend (NestJS):** validación de entrada con `ValidationPipe` + Zod schemas + lógica de servicio.
2. **Oracle (triggers):** garantía de integridad a nivel de base de datos. Incluso si alguien conecta directamente a Oracle con SQL*Plus, las reglas de negocio se respetan.

Ejemplo: Un insert directo en `PERFILES` desde SQL Developer sin pasar por el backend igual activa `TRG_PERFILES_LIMITE_PLAN_BI` y lanza `ORA-20011`.

### 6.3 ¿Por qué checkout simulado sin pasarela real?

- **Enunciado:** modelar ciclo financiero, estados y descuentos; no se exige integración con pasarela.
- **Decisión funcional:** El usuario ingresa datos de tarjeta en UI; al hacer clic en "Pagar", la compra se marca exitosa de forma simulada. Se registra transacción de prueba y se actualiza factura/cuenta.
- **Ventaja:** Demuestra el flujo completo (UI → API → Oracle triggers → actualización de estados) sin depender de servicios externos ni tokens de pago reales.

### 6.4 ¿Por qué vistas materializadas para analítica?

Las agregaciones de calificaciones y métricas financieras son costosas (múltiples JOINs, AVG, COUNT, CASE WHEN). Las MVs:
- Pre-calculan los datos en disco.
- Reducen el tiempo de respuesta de los endpoints `/analytics/*`.
- Se refrescan bajo demanda (`REFRESH ON DEMAND`) con `DBMS_MVIEW.REFRESH` después de cargas masivas de datos.

### 6.5 ¿Por qué particionamiento de REPRODUCCIONES?

La tabla `REPRODUCCIONES` es la más grande del sistema (200+ registros seed, potencialmente millones en producción). Las consultas analíticas siempre filtran por rango de fechas. Con particiones:
- Oracle aplica **partition pruning**: solo lee la partición relevante.
- Los índices son `LOCAL`: cada partición tiene su propio segmento de índice, acelerando mantenimiento.
- Backup y purga de datos históricos se simplifican (`DROP PARTITION` en vez de `DELETE` masivo).

---

## 7. Cómo Sustentar Cada Núcleo en la Presentación Oral

### Guía rápida por núcleo

| NT | Qué mostrar en pantalla | Qué decir |
|----|------------------------|-----------|
| **NT1** | Abrir `17_analitica_nt1.sql` y mostrar: Sección A (particiones), Sección B (MVs), Sección D (PIVOT/UNPIVOT), Sección E (ROLLUP/CUBE/GROUPING SETS). Luego mostrar `AnalyticsDashboardPage.tsx` consumiendo los datos. | "Fragmentamos REPRODUCCIONES por rango de fecha para acelerar consultas analíticas. Las vistas materializadas pre-calculan agregaciones costosas. PIVOT/UNPIVOT permiten analizar dispositivos vs meses en formato tabular. ROLLUP y CUBE generan subtotales jerárquicos que el dashboard consume directamente." |
| **NT2** | Abrir `18_plsql_nt2_completo.sql`: Cursor A.1 (cartera vencida), `SP_REGISTRAR_USUARIO`, `FN_CALCULAR_MONTO`. Luego mostrar triggers en `03`, `04`, `09`. | "Los cursores recorren facturas vencidas y métricas de popularidad. Los procedimientos encapsulan la lógica de registro atómico y cambio de plan. Las funciones calculan montos con descuentos dinámicos. Los triggers garantizan reglas de negocio a nivel de base de datos, incluso si alguien accede directo a Oracle." |
| **NT3** | Abrir `19_transacciones_nt3.sql`: Transacción 1 (COMMIT/ROLLBACK), Transacción 2 (SAVEPOINT), Transacción 3 (hard delete ordenado), Sección D (SELECT FOR UPDATE). | "La transacción 1 demuestra atomicidad: si falla el insert de la factura, se revierte todo. La transacción 2 usa SAVEPOINT para aislar errores por usuario en facturación masiva. La transacción 3 elimina en orden inverso respetando FKs. El escenario de concurrencia bloquea la fila del usuario con SELECT FOR UPDATE para evitar cambios de plan simultáneos." |
| **NT4** | Abrir `20_indices_nt4.sql`: EXPLAIN PLAN antes/después del índice `IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO`. Mostrar tabla de índices al final. | "Identificamos una consulta pesada del dominio: historial de reproducciones por perfil. Antes del índice, Oracle hace TABLE ACCESS FULL + SORT ORDER BY. Después del índice compuesto, realiza INDEX RANGE SCAN sin ordenación adicional, reduciendo el costo demostrable con DBMS_XPLAN." |
| **NT5** | Abrir `11_seguridad_roles_nt5.sql`: PROFILE, creación de roles, GRANTs. Luego abrir SQL Developer y demostrar login con cada rol. | "Creamos un PROFILE que limita sesiones, inactividad e intentos fallidos. Definimos 4 roles con privilegios diferenciados: admin tiene CRUD total, analista solo lectura, soporte puede moderar reportes, contenido edita el catálogo. Si un rol intenta acceder a datos no autorizados, Oracle responde con ORA-00942." |

### Demostración en vivo sugerida

1. **Login** con `admin` → mostrar `/moderation/reports` y `/analytics`.
2. **Login** con `usuario` → mostrar `/browse`, seleccionar perfil, reproducir contenido.
3. **Login** con `soporte` → mostrar que puede moderar reportes pero no acceder a analytics.
4. **Desde SQL Developer:**
   - Ejecutar `SP_REGISTRAR_USUARIO` con email duplicado → mostrar `ORA-20102`.
   - Ejecutar `SELECT * FROM VW_ANALITICA_FINANZAS` como `USR_ANALISTA` → éxito.
   - Intentar `DELETE FROM FACTURACIONES` como `USR_ANALISTA` → `ORA-01031` (insufficient privileges).

---

## 8. Conclusiones

1. **Cobertura académica completa:** Los 5 núcleos temáticos (NT1..NT5) están implementados en scripts SQL dedicados, documentados con comentarios inline, y validados por el script `21_validacion_cierre.sql`.
2. **Aplicación funcional end-to-end:** El backend NestJS y el frontend React demuestran que el modelo de datos no es teórico: es consumido por una plataforma real con autenticación, roles, guards y flujo Netflix-like.
3. **Validación doble:** Las reglas de negocio se validan tanto en la capa de aplicación (DTOs, services) como en Oracle (constraints, triggers, excepciones PL/SQL).
4. **Optimización demostrable:** Los índices justificados con `EXPLAIN PLAN` antes/después, las vistas materializadas, y el particionamiento de `REPRODUCCIONES` demuestran competencia en tuning de base de datos.
5. **Seguridad granular:** El esquema de roles y `PROFILE` cubre el requerimiento de segregación de acceso, con evidencia de restricción de acceso por rol.

---

## 9. Referencias Rápidas de Archivos

| Propósito | Archivo |
|-----------|---------|
| Enunciado académico | `Docs/Enunciado.md` |
| Épicas INVEST con trazabilidad | `Docs/Epicas.md` |
| Plan de desarrollo por iteraciones | `Docs/Plan_Desarrollo.md` |
| Resumen técnico del proyecto | `Docs/Resumen_Proyecto.md` |
| Script NT1 (Analítica) | `database/17_analitica_nt1.sql` |
| Script NT2 (PL/SQL) | `database/18_plsql_nt2_completo.sql` |
| Script NT3 (Transacciones) | `database/19_transacciones_nt3.sql` |
| Script NT4 (Índices) | `database/20_indices_nt4.sql` |
| Script NT5 (Roles) | `database/11_seguridad_roles_nt5.sql` |
| Validación final | `database/21_validacion_cierre.sql` |
| Runner de scripts | `database/run_all.sql` |
| Backend controllers | `minflix-backend/src/*/\*.controller.ts` |
| Backend analytics service | `minflix-backend/src/analytics/analytics.service.ts` |
| Frontend pages | `minflix-frontend/src/pages/*.tsx` |
