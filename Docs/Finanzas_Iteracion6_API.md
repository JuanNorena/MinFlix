# Iteracion 6 - Finanzas API y Estado de Cuenta

## 1. Objetivo
Implementar la cobertura funcional de la Epica 5 (Finanzas) para exponer:
1. Resumen financiero por cuenta autenticada.
2. Historial de facturas.
3. Historial de pagos.
4. Relaciones de referidos con filtros por tipo y estado.

## 2. Cambios de Backend (NestJS)
### 2.1 Nuevo modulo
Se agrego el modulo `finance` en `minflix-backend/src/finance` con el patron:
1. `entities/`
2. `dto/`
3. `contracts/`
4. `finance.service.ts`
5. `finance.controller.ts`
6. `finance.module.ts`
7. `finance.service.spec.ts`

### 2.2 Endpoints
Todos protegidos por JWT (`JwtAuthGuard`):
1. `GET /api/v1/finance/summary`
2. `GET /api/v1/finance/invoices`
3. `GET /api/v1/finance/payments`
4. `GET /api/v1/finance/referrals`

### 2.3 Regla de mapeo
1. Se validan cuentas autenticadas antes de consultar datos.
2. Se transforman agregados Oracle (`SUM`, `MAX`) a numero seguro para contrato API.
3. Se mantiene trazabilidad de periodos (`periodoAnio`, `periodoMes`) en pagos y facturas.

## 3. Cambios de Frontend (React)
### 3.1 Nueva vista
1. Pagina: `minflix-frontend/src/pages/BillingPage.tsx`
2. Ruta protegida: `/account/billing`
3. Acceso directo desde `BrowsePage` mediante boton `Facturacion`.

### 3.2 Bloques UI
1. Tarjetas de resumen (estado cuenta, total pagado, factura vigente).
2. Seccion de facturas con filtro por estado.
3. Seccion de pagos con filtro por estado transaccional.
4. Seccion de referidos con filtros por estado y tipo de relacion.

## 4. SQL secuencial agregado
Se creo el script:
1. `database/15_finanzas_vistas_api_iteracion6.sql`

Contenido principal:
1. Indice `IDX_FACTURACIONES_USR_PERIODO` para consultas por periodo.
2. Vista `VW_FIN_RESUMEN_USUARIO`.
3. Vista `VW_FIN_FACTURAS_DETALLE`.
4. Vista `VW_FIN_PAGOS_DETALLE`.
5. Vista `VW_FIN_REFERIDOS_DETALLE`.

## 5. Validacion local ejecutada
### 5.1 Backend
1. `npm test -- finance.service.spec.ts`.
2. `npm run build`.
3. `npm run lint`.

### 5.2 Frontend
1. `npm run lint`.
2. `npm run build`.

## 6. Consultas de verificacion SQL (post script 15)
```sql
SELECT VIEW_NAME
FROM USER_VIEWS
WHERE VIEW_NAME IN (
  'VW_FIN_RESUMEN_USUARIO',
  'VW_FIN_FACTURAS_DETALLE',
  'VW_FIN_PAGOS_DETALLE',
  'VW_FIN_REFERIDOS_DETALLE'
)
ORDER BY VIEW_NAME;
```

```sql
SELECT INDEX_NAME
FROM USER_INDEXES
WHERE INDEX_NAME = 'IDX_FACTURACIONES_USR_PERIODO';
```

```sql
SELECT ID_USUARIO, TOTAL_FACTURAS, FACTURAS_PENDIENTES_VENCIDAS,
       TOTAL_PAGADO_EXITOSO, DESCUENTO_REFERIDOS_ACTIVO_PCT
FROM VW_FIN_RESUMEN_USUARIO
ORDER BY ID_USUARIO
FETCH FIRST 10 ROWS ONLY;
```

## 7. Nota de ejecucion MCP Oracle
La ejecucion del script debe realizarse con las credenciales Oracle definidas en `minflix-backend/.env` y en orden secuencial, manteniendo evidencia de salida para la sustentacion.
