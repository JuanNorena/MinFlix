-- ============================================================================
-- MinFlix - Iteracion 6 (Finanzas API Read Models)
-- Ejecutar como owner de tablas (SYSTEM en entorno actual).
-- Requiere: scripts 01..14 aplicados.
-- Objetivo:
--   1) Crear vistas de lectura para endpoints financieros.
--   2) Agregar indice por periodo para acelerar historial de facturas.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Bloque idempotente: crea el indice solo si no existe.
-- Mejora filtros por usuario y periodos (anio/mes/corte).
-- --------------------------------------------------------------------------
DECLARE
  V_EXISTE NUMBER := 0;
BEGIN
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_INDEXES
   WHERE INDEX_NAME = 'IDX_FACTURACIONES_USR_PERIODO';

  IF V_EXISTE = 0 THEN
    EXECUTE IMMEDIATE '
      CREATE INDEX IDX_FACTURACIONES_USR_PERIODO
          ON FACTURACIONES (
            ID_USUARIO,
            PERIODO_ANIO DESC,
            PERIODO_MES DESC,
            FECHA_CORTE DESC
          )';
  END IF;
END;
/

-- --------------------------------------------------------------------------
-- Vista VW_FIN_RESUMEN_USUARIO
-- Resume estado financiero por usuario: total facturas, pendientes/vencidas,
-- pagos exitosos y descuento activo por referidos.
-- ID_FACTURA_VIGENTE usa DENSE_RANK para obtener la ultima factura del periodo.
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_FIN_RESUMEN_USUARIO AS
SELECT
  U.ID_USUARIO,                              -- PK del usuario titular
  U.EMAIL,                                   -- Correo electronico del usuario
  U.ESTADO_CUENTA,                           -- Estado: ACTIVO, SUSPENDIDO, CANCELADO
  -- Subconsulta escalar: total de facturas emitidas a este usuario
  (
    SELECT COUNT(*)
      FROM FACTURACIONES F
     WHERE F.ID_USUARIO = U.ID_USUARIO
  ) AS TOTAL_FACTURAS,
  -- Subconsulta escalar: facturas con estado PENDIENTE o VENCIDA (cartera)
  (
    SELECT COUNT(*)
      FROM FACTURACIONES F
     WHERE F.ID_USUARIO = U.ID_USUARIO
       AND F.ESTADO_FACTURA IN ('PENDIENTE', 'VENCIDA')
  ) AS FACTURAS_PENDIENTES_VENCIDAS,
  -- Subconsulta escalar: suma de pagos exitosos realizados por el usuario
  (
    SELECT NVL(SUM(P.MONTO), 0)
      FROM PAGOS P
     WHERE P.ID_USUARIO = U.ID_USUARIO
       AND P.ESTADO_TRANSACCION = 'EXITOSO'
  ) AS TOTAL_PAGADO_EXITOSO,
  -- Subconsulta escalar: maximo descuento por referidos validados del usuario
  (
    SELECT NVL(MAX(R.DESCUENTO_PCT), 0)
      FROM REFERIDOS R
     WHERE (R.ID_USUARIO_REFERENTE = U.ID_USUARIO
        OR R.ID_USUARIO_REFERIDO = U.ID_USUARIO)
       AND R.ESTADO_REFERIDO = 'VALIDADO'
  ) AS DESCUENTO_REFERIDOS_ACTIVO_PCT,
  -- Subconsulta escalar: ID de la factura mas reciente (ultimo periodo/corte)
  -- KEEP (DENSE_RANK LAST) retiene el ID de la ultima fila segun el ORDER BY
  (
    SELECT MAX(F.ID_FACTURACION)
      KEEP (DENSE_RANK LAST ORDER BY F.PERIODO_ANIO, F.PERIODO_MES, F.FECHA_CORTE)
      FROM FACTURACIONES F
     WHERE F.ID_USUARIO = U.ID_USUARIO
  ) AS ID_FACTURA_VIGENTE
FROM USUARIOS U;

-- --------------------------------------------------------------------------
-- Vista VW_FIN_FACTURAS_DETALLE
-- Lista facturas con datos del usuario para el endpoint de historial.
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_FIN_FACTURAS_DETALLE AS
SELECT
  F.ID_FACTURACION,           -- PK de la factura
  F.ID_USUARIO,               -- FK al usuario facturado
  U.EMAIL AS USUARIO_EMAIL,   -- Correo del titular (legible para UI)
  F.PERIODO_ANIO,             -- Anio del periodo facturado
  F.PERIODO_MES,              -- Mes del periodo facturado
  F.FECHA_CORTE,              -- Fecha de cierre del periodo
  F.FECHA_VENCIMIENTO,        -- Fecha limite de pago
  F.MONTO_BASE,               -- Monto antes de descuentos
  F.DESCUENTO_REFERIDOS_PCT,  -- Descuento por referidos (%)
  F.DESCUENTO_FIDELIDAD_PCT,  -- Descuento por antiguedad (%)
  F.MONTO_FINAL,              -- Monto a pagar despues de descuentos
  F.ESTADO_FACTURA,           -- Estado: PENDIENTE, PAGADA, VENCIDA
  F.FECHA_PAGO                -- Fecha real de pago (NULL si aun no paga)
FROM FACTURACIONES F
-- JOIN obligatorio: traer email del usuario para referencia humana
JOIN USUARIOS U
  ON U.ID_USUARIO = F.ID_USUARIO;

-- --------------------------------------------------------------------------
-- Vista VW_FIN_PAGOS_DETALLE
-- Detalla pagos y referencia a periodo facturado.
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_FIN_PAGOS_DETALLE AS
SELECT
  P.ID_PAGO,                  -- PK del pago
  P.ID_FACTURACION,           -- FK a la factura asociada
  P.ID_USUARIO,               -- FK al usuario que realizo el pago
  U.EMAIL AS USUARIO_EMAIL,   -- Correo del titular (legible para UI)
  F.PERIODO_ANIO,             -- Anio del periodo pagado
  F.PERIODO_MES,              -- Mes del periodo pagado
  P.FECHA_PAGO,               -- Fecha y hora del pago
  P.MONTO,                    -- Monto pagado en moneda local
  P.METODO_PAGO,              -- Metodo: tarjeta, pse, transferencia, etc.
  P.ESTADO_TRANSACCION,       -- Estado: EXITOSO, FALLIDO, PENDIENTE
  P.REFERENCIA_PAGO           -- Codigo de referencia del gateway de pagos
FROM PAGOS P
-- JOIN obligatorio: traer email del usuario
JOIN USUARIOS U
  ON U.ID_USUARIO = P.ID_USUARIO
-- JOIN obligatorio: traer periodo facturado asociado al pago
JOIN FACTURACIONES F
  ON F.ID_FACTURACION = P.ID_FACTURACION;

-- --------------------------------------------------------------------------
-- Vista VW_FIN_REFERIDOS_DETALLE
-- Muestra relaciones de referido con emails para consumo en UI.
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_FIN_REFERIDOS_DETALLE AS
SELECT
  R.ID_REFERIDO,               -- PK de la relacion de referido
  R.ID_USUARIO_REFERENTE,      -- FK al usuario que invito
  U_REF.EMAIL AS EMAIL_REFERENTE,  -- Correo del invitador (legible para UI)
  R.ID_USUARIO_REFERIDO,       -- FK al usuario invitado
  U_REFD.EMAIL AS EMAIL_REFERIDO,  -- Correo del invitado (legible para UI)
  R.FECHA_REFERIDO,            -- Fecha en que se creo la relacion
  R.ESTADO_REFERIDO,           -- Estado: PENDIENTE, VALIDADO, RECHAZADO
  R.DESCUENTO_PCT              -- Porcentaje de descuento otorgado al invitador
FROM REFERIDOS R
-- JOIN obligatorio: traer email del usuario referente (invitador)
JOIN USUARIOS U_REF
  ON U_REF.ID_USUARIO = R.ID_USUARIO_REFERENTE
-- JOIN obligatorio: traer email del usuario referido (invitado)
JOIN USUARIOS U_REFD
  ON U_REFD.ID_USUARIO = R.ID_USUARIO_REFERIDO;

COMMENT ON TABLE VW_FIN_RESUMEN_USUARIO IS
  'Resumen financiero por cuenta para consumo de API de estado de cuenta.';

COMMENT ON TABLE VW_FIN_FACTURAS_DETALLE IS
  'Vista de facturas con datos de cuenta para endpoint /finance/invoices.';

COMMENT ON TABLE VW_FIN_PAGOS_DETALLE IS
  'Vista de pagos con metadatos de periodo para endpoint /finance/payments.';

COMMENT ON TABLE VW_FIN_REFERIDOS_DETALLE IS
  'Vista de relaciones de referidos para endpoint /finance/referrals.';

-- Grants para roles con acceso a finanzas (admin/analista).
GRANT SELECT ON VW_FIN_RESUMEN_USUARIO TO ROL_ADMIN;
GRANT SELECT ON VW_FIN_FACTURAS_DETALLE TO ROL_ADMIN;
GRANT SELECT ON VW_FIN_PAGOS_DETALLE TO ROL_ADMIN;
GRANT SELECT ON VW_FIN_REFERIDOS_DETALLE TO ROL_ADMIN;

GRANT SELECT ON VW_FIN_RESUMEN_USUARIO TO ROL_ANALISTA;
GRANT SELECT ON VW_FIN_FACTURAS_DETALLE TO ROL_ANALISTA;
GRANT SELECT ON VW_FIN_PAGOS_DETALLE TO ROL_ANALISTA;
GRANT SELECT ON VW_FIN_REFERIDOS_DETALLE TO ROL_ANALISTA;

COMMIT;
