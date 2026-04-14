# Iteracion 7 - Analitica Ejecutiva y NT1

## 1. Objetivo
Implementar la cobertura funcional de la Epica 6 (Analitica y Reporteria Ejecutiva) para exponer:
1. Metricas de consumo por ciudad, categoria, genero, dispositivo y plan.
2. Metricas financieras por ciudad, plan y periodo.
3. Metricas de rendimiento interno por departamento y periodo de ingreso.

Adicionalmente, cumplir los requerimientos del Nucleo Tecnico NT1 de la materia:
- Particionamiento de tabla REPRODUCCIONES por rango de fecha.
- Vistas materializadas de calificaciones y metricas financieras.
- Consultas parametrizadas con DEFINE y &&.
- PIVOT / UNPIVOT sobre reproducciones y usuarios.
- Agrupamientos avanzados: ROLLUP, CUBE, GROUPING(), GROUPING SETS.

## 2. Cambios de Backend (NestJS)
### 2.1 Nuevo modulo
Se agrego el modulo `analytics` en `minflix-backend/src/analytics` con el patron:
1. `contracts/analytics-view.types.ts`
2. `dto/analytics-consumption-query.dto.ts`
3. `dto/analytics-finance-query.dto.ts`
4. `dto/analytics-performance-query.dto.ts`
5. `analytics.service.ts`
6. `analytics.controller.ts`
7. `analytics.module.ts`

> El modulo no usa `TypeOrmModule.forFeature` ya que las vistas analiticas no tienen clave primaria mapeada.
> En su lugar, el servicio inyecta `DataSource` directamente para ejecutar raw SQL con parametros posicionales Oracle (`:1`, `:2`, ...).

### 2.2 Endpoints
Todos protegidos por JWT (`JwtAuthGuard`) y restringidos a roles `admin` y `analista`:
1. `GET /api/v1/analytics/consumption`
2. `GET /api/v1/analytics/finance`
3. `GET /api/v1/analytics/internal-performance`

### 2.3 Regla de mapeo
1. Se valida el rol antes de consultar (`assertAnalyticsRole`): arroja `ForbiddenException` si el rol no es `admin` ni `analista`.
2. Los valores numericos de Oracle retornados como string se normalizan via helper `toNumber()`.
3. Los filtros de cada endpoint son opcionales; si no se envian, la consulta retorna el agregado completo de la vista.
4. Los parametros se inyectan de forma posicional (`:1`, `:2`) para compatibilidad con el driver `oracledb`.

## 3. Cambios de Frontend (React)
### 3.1 Nueva vista
1. Pagina: `minflix-frontend/src/pages/AnalyticsDashboardPage.tsx`
2. Ruta protegida: `/analytics/dashboard`
3. Acceso directo desde `BrowsePage` mediante boton `Analitica` visible solo para roles `admin` y `analista`.

### 3.2 Bloques UI
1. Guard de rol inline: si el usuario no es `admin` ni `analista`, muestra tarjeta "Acceso restringido" con link a `/browse`.
2. Selector de pestana (`<select className="nf-input">`): Consumo, Finanzas, Rendimiento.
3. Pestana Consumo: filtros de ciudad, categoria, genero, dispositivo y plan + boton Consultar.
4. Pestana Finanzas: filtros de ciudad, plan, anio y mes + boton Consultar con formato de moneda COP.
5. Pestana Rendimiento: filtros de departamento y anio + boton Consultar.
6. Resultados renderizados como tarjetas `nf-moderation-card` alineadas al patron de `ReportsModerationPage`.

## 4. SQL secuencial agregado
Se creo el script:
1. `database/17_analitica_nt1.sql`

Contenido principal:
1. **Seccion A - Particionamiento:** Recreacion de tabla REPRODUCCIONES con `PARTITION BY RANGE (FECHA_INICIO)` en 5 particiones: `P_2024`, `P_2025_Q1`, `P_2025_Q2`, `P_2025_Q3`, `P_FUTURO`. Incluye backup previo, drop, recreacion, reinsercion de datos y recreacion del trigger `TRG_REPRODUCCIONES_REGLAS_BIU` e indices locales.
2. **Seccion B - Vistas Materializadas:** `MV_CALIFICACIONES_PROMEDIO` (promedio, min, max de calificaciones por contenido y genero) y `MV_METRICAS_FINANCIERAS` (totales de facturacion por plan y periodo). Ambas con `BUILD IMMEDIATE REFRESH ON DEMAND`.
3. **Seccion C - Consultas Parametrizadas:** Tres consultas con `DEFINE` y `&&` para top N contenidos por ciudad, ingresos por rango de fechas y calificaciones por genero.
4. **Seccion D - PIVOT / UNPIVOT:** PIVOT de reproducciones por dispositivo x mes (columnas MES_1..MES_12), PIVOT de usuarios por plan x ciudad (top 5 ciudades del seed), UNPIVOT de ambos para desnormalizar resultados.
5. **Seccion E - Agrupamientos avanzados:** `ROLLUP(PERIODO_ANIO, PERIODO_MES)`, `CUBE(ULTIMO_DISPOSITIVO, YEAR)`, etiquetas con `GROUPING()` y `GROUPING SETS` sobre ciudad y plan.
6. **Seccion F - Vistas de API:** `VW_ANALITICA_CONSUMO`, `VW_ANALITICA_FINANZAS`, `VW_ANALITICA_RENDIMIENTO` + GRANTs a `ROL_ANALISTA` y `ROL_ADMIN`.

## 5. Validacion local ejecutada
### 5.1 Backend
1. `npm run build` — sin errores de compilacion TypeScript.
2. `npm run lint` — sin advertencias ESLint/TSDoc.

### 5.2 Frontend
1. `npm run lint` — sin advertencias.
2. `npm run build` — bundle generado correctamente.

## 6. Consultas de verificacion SQL (post script 17)
```sql
-- Verificar vistas de API creadas
SELECT VIEW_NAME
FROM USER_VIEWS
WHERE VIEW_NAME IN (
  'VW_ANALITICA_CONSUMO',
  'VW_ANALITICA_FINANZAS',
  'VW_ANALITICA_RENDIMIENTO'
)
ORDER BY VIEW_NAME;
```

```sql
-- Verificar vistas materializadas creadas
SELECT MVIEW_NAME
FROM USER_MVIEWS
WHERE MVIEW_NAME IN (
  'MV_CALIFICACIONES_PROMEDIO',
  'MV_METRICAS_FINANCIERAS'
)
ORDER BY MVIEW_NAME;
```

```sql
-- Verificar particionamiento de REPRODUCCIONES
SELECT PARTITION_NAME, HIGH_VALUE
FROM USER_TAB_PARTITIONS
WHERE TABLE_NAME = 'REPRODUCCIONES'
ORDER BY PARTITION_POSITION;
```

```sql
-- Muestra de datos de consumo
SELECT CIUDAD_RESIDENCIA, CATEGORIA, GENERO, ULTIMO_DISPOSITIVO, PLAN,
       TOTAL_REPRODUCCIONES, PERFILES_UNICOS, PROMEDIO_AVANCE
FROM VW_ANALITICA_CONSUMO
WHERE ROWNUM <= 5;
```

```sql
-- Muestra de datos financieros
SELECT CIUDAD_RESIDENCIA, PLAN, PERIODO_ANIO, PERIODO_MES,
       TOTAL_FACTURAS, INGRESOS_TOTALES, INGRESOS_COBRADOS
FROM VW_ANALITICA_FINANZAS
WHERE ROWNUM <= 5;
```

```sql
-- Muestra de rendimiento interno
SELECT DEPARTAMENTO, TOTAL_EMPLEADOS, EMPLEADOS_ACTIVOS, ANIO_INGRESO
FROM VW_ANALITICA_RENDIMIENTO
ORDER BY DEPARTAMENTO, ANIO_INGRESO;
```

## 7. Nota de ejecucion MCP Oracle
La ejecucion del script debe realizarse como usuario `MINFLIX_APP` en `XEPDB1` (o `FREEPDB1` segun la instalacion). El script es idempotente: incluye `DROP ... IF EXISTS` para objetos recreables y backup previo de REPRODUCCIONES para el paso de particionamiento. Mantener evidencia de salida para la sustentacion de NT1.
