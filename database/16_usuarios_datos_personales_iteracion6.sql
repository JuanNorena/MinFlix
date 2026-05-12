-- ============================================================================
-- MinFlix - Iteracion 6 (Datos Personales de Cuenta)
-- Ejecutar como owner de tablas (SYSTEM en entorno actual).
-- Requiere: scripts 01..15 aplicados.
-- Objetivo:
--   1) Alinear USUARIOS con enunciado: telefono, fecha de nacimiento y ciudad.
--   2) Mantener compatibilidad con datos existentes mediante backfill idempotente.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Bloque idempotente de evolucion de esquema:
--   - agrega columnas si no existen,
--   - rellena valores nulos (backfill),
--   - agrega constraints y marca NOT NULL.
-- --------------------------------------------------------------------------
DECLARE
  V_EXISTE NUMBER := 0;
BEGIN
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_TAB_COLUMNS
   WHERE TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'TELEFONO';

  IF V_EXISTE = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS ADD (TELEFONO VARCHAR2(30))';
  END IF;

  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_TAB_COLUMNS
   WHERE TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'FECHA_NACIMIENTO';

  IF V_EXISTE = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS ADD (FECHA_NACIMIENTO DATE)';
  END IF;

  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_TAB_COLUMNS
   WHERE TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'CIUDAD_RESIDENCIA';

  IF V_EXISTE = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS ADD (CIUDAD_RESIDENCIA VARCHAR2(120))';
  END IF;

  -- Backfill controlado para registros existentes.
  EXECUTE IMMEDIATE q'[
    UPDATE USUARIOS
       SET TELEFONO = '3000000000'
     WHERE TELEFONO IS NULL
  ]';

  EXECUTE IMMEDIATE q'[
    UPDATE USUARIOS
       SET FECHA_NACIMIENTO = DATE '1990-01-01'
     WHERE FECHA_NACIMIENTO IS NULL
  ]';

  EXECUTE IMMEDIATE q'[
    UPDATE USUARIOS
       SET CIUDAD_RESIDENCIA = 'Bogota'
     WHERE CIUDAD_RESIDENCIA IS NULL
  ]';

  -- Constraints de validacion (solo si no existen).
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_CONSTRAINTS
   WHERE CONSTRAINT_NAME = 'CK_USUARIOS_TELEFONO';

  IF V_EXISTE = 0 THEN
    EXECUTE IMMEDIATE q'[
      ALTER TABLE USUARIOS
      ADD CONSTRAINT CK_USUARIOS_TELEFONO
      CHECK (REGEXP_LIKE(TELEFONO, '^[0-9]{7,15}$'))
    ]';
  END IF;

  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_CONSTRAINTS
   WHERE CONSTRAINT_NAME = 'CK_USUARIOS_CIUDAD';

  IF V_EXISTE = 0 THEN
    EXECUTE IMMEDIATE q'[
      ALTER TABLE USUARIOS
      ADD CONSTRAINT CK_USUARIOS_CIUDAD
      CHECK (LENGTH(TRIM(CIUDAD_RESIDENCIA)) >= 2)
    ]';
  END IF;

  -- Finalmente, marcar columnas como obligatorias.
  EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS MODIFY (TELEFONO NOT NULL)';
  EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS MODIFY (FECHA_NACIMIENTO NOT NULL)';
  EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS MODIFY (CIUDAD_RESIDENCIA NOT NULL)';
END;
/

COMMENT ON COLUMN USUARIOS.TELEFONO IS
  'Telefono de contacto del titular de cuenta para soporte y recuperacion.';

COMMENT ON COLUMN USUARIOS.FECHA_NACIMIENTO IS
  'Fecha de nacimiento del titular para validaciones de negocio y segmentacion.';

COMMENT ON COLUMN USUARIOS.CIUDAD_RESIDENCIA IS
  'Ciudad de residencia para analitica de consumo e ingresos por territorio.';

COMMIT;
