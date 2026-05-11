-- ============================================================================
-- MinFlix - Nucleo 3 Transacciones y Concurrencia (NT3)
-- Ejecutar como owner de tablas (MINFLIX_APP en XEPDB1).
-- Requiere: scripts 01..18 aplicados.
-- Objetivo:
--   Transaccion 1: Registro atomico de Cliente + Plan + Perfil + Factura Inicial.
--   Transaccion 2: Facturacion masiva de ciclo con SAVEPOINT por usuario.
--   Transaccion 3: Eliminacion en cascada segura (hard delete integral).
--   Escenario de concurrencia: SELECT FOR UPDATE en cambio de plan.
-- ============================================================================

SET SERVEROUTPUT ON;

-- ============================================================================
-- SECCION A: Transaccion 1 — Registro atomico de Cliente + Plan + Perfil
-- + Factura Inicial
-- ============================================================================
-- Demuestra:
--   - Atomicidad: si falla cualquier paso, todo se revierte con ROLLBACK.
--   - Aislamiento: los inserts parciales no son visibles hasta el COMMIT.
--   - Consistencia: integridad referencial entre USUARIOS, PERFILES y
--     FACTURACIONES.
-- ============================================================================

DECLARE
  V_NOMBRE_PERFIL    VARCHAR2(80)  := 'Perfil Transaccion';
  V_EMAIL            VARCHAR2(180)  := 'transaccion.test@minflix.local';
  V_TELEFONO         VARCHAR2(30)   := '3001234567';
  V_FECHA_NAC        DATE           := TO_DATE('1995-08-15', 'YYYY-MM-DD');
  V_CIUDAD           VARCHAR2(120)  := 'Bogota';
  V_PASSWORD_HASH    VARCHAR2(255)  := '$2b$10$transaccion.hash.demo';
  V_PLAN_NOMBRE      VARCHAR2(40)   := 'BASICO';
  V_NOMBRE_PERFIL_INI VARCHAR2(80)  := 'Principal';

  V_ID_USUARIO       USUARIOS.ID_USUARIO%TYPE;
  V_ID_PLAN          PLANES.ID_PLAN%TYPE;
  V_PRECIO           PLANES.PRECIO_MENSUAL%TYPE;
  V_PERFIL_ID        PERFILES.ID_PERFIL%TYPE;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- TRANSACCION 1: Registro atomico de cliente ---');

  -- Paso 1: obtener datos del plan (lectura previa, no modifica datos)
  SELECT ID_PLAN, PRECIO_MENSUAL
    INTO V_ID_PLAN, V_PRECIO
    FROM PLANES
   WHERE UPPER(NOMBRE) = UPPER(V_PLAN_NOMBRE);

  -- Paso 2: insertar usuario
  INSERT INTO USUARIOS (
    NOMBRE, EMAIL, TELEFONO, FECHA_NACIMIENTO, CIUDAD_RESIDENCIA,
    PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN
  ) VALUES (
    V_NOMBRE_PERFIL, LOWER(TRIM(V_EMAIL)), V_TELEFONO, V_FECHA_NAC,
    V_CIUDAD, V_PASSWORD_HASH, 'usuario', 'ACTIVO', V_ID_PLAN
  )
  RETURNING ID_USUARIO INTO V_ID_USUARIO;

  DBMS_OUTPUT.PUT_LINE('Usuario insertado (sin commit): ID=' || V_ID_USUARIO);

  -- Paso 3: insertar perfil inicial
  INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL)
  VALUES (V_ID_USUARIO, V_NOMBRE_PERFIL_INI, 'adulto')
  RETURNING ID_PERFIL INTO V_PERFIL_ID;

  DBMS_OUTPUT.PUT_LINE('Perfil insertado (sin commit): ID=' || V_PERFIL_ID);

  -- Paso 4: generar factura inicial
  INSERT INTO FACTURACIONES (
    ID_USUARIO, PERIODO_ANIO, PERIODO_MES, FECHA_CORTE, FECHA_VENCIMIENTO,
    MONTO_BASE, DESCUENTO_REFERIDOS_PCT, DESCUENTO_FIDELIDAD_PCT, ESTADO_FACTURA
  ) VALUES (
    V_ID_USUARIO,
    EXTRACT(YEAR FROM SYSDATE),
    EXTRACT(MONTH FROM SYSDATE),
    TRUNC(SYSDATE),
    TRUNC(ADD_MONTHS(SYSDATE, 1)),
    V_PRECIO,
    0,
    0,
    'PENDIENTE'
  );

  DBMS_OUTPUT.PUT_LINE('Factura insertada (sin commit)');

  -- Paso 5: simular fallo condicional para demostrar rollback
  -- Comentar la siguiente linea para ejecutar exitoso, descomentar para demostrar rollback:
  -- RAISE_APPLICATION_ERROR(-20301, 'Simulacion de fallo en registro atomico');

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('COMMIT exitoso. Transaccion 1 completada.');

EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('ROLLBACK ejecutado: email duplicado (DUP_VAL_ON_INDEX)');
    RAISE_APPLICATION_ERROR(
      -20301,
      'Transaccion 1 fallida: el correo ya existe. ROLLBACK aplicado.'
    );
  WHEN OTHERS THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('ROLLBACK ejecutado: ' || SQLERRM);
    RAISE_APPLICATION_ERROR(
      -20302,
      'Transaccion 1 fallida: ' || SQLERRM || '. ROLLBACK aplicado.'
    );
END;
/

-- ============================================================================
-- SECCION B: Transaccion 2 — Facturacion masiva de ciclo con SAVEPOINT
-- ============================================================================
-- Demuestra:
--   - Uso de SAVEPOINT para aislar fallos por usuario dentro del lote.
--   - Si un usuario falla, se hace ROLLBACK TO SAVEPOINT y se continua.
--   - COMMIT al final del lote garantiza persistencia solo de los exitosos.
-- ============================================================================

DECLARE
  CURSOR CUR_USUARIOS_ACTIVOS IS
    SELECT ID_USUARIO, ID_PLAN
    FROM USUARIOS
    WHERE ESTADO_CUENTA = 'ACTIVO'
      AND ID_PLAN IS NOT NULL;

  V_ANIO         NUMBER := EXTRACT(YEAR FROM SYSDATE);
  V_MES          NUMBER := EXTRACT(MONTH FROM SYSDATE);
  V_PRECIO       PLANES.PRECIO_MENSUAL%TYPE;
  V_CONTADOR_OK  NUMBER := 0;
  V_CONTADOR_ERR NUMBER := 0;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- TRANSACCION 2: Facturacion masiva de ciclo ---');

  FOR R_USUARIO IN CUR_USUARIOS_ACTIVOS LOOP
    BEGIN
      -- SAVEPOINT por cada usuario
      SAVEPOINT SP_USUARIO;

      SELECT PRECIO_MENSUAL INTO V_PRECIO
      FROM PLANES WHERE ID_PLAN = R_USUARIO.ID_PLAN;

      INSERT INTO FACTURACIONES (
        ID_USUARIO, PERIODO_ANIO, PERIODO_MES, FECHA_CORTE,
        FECHA_VENCIMIENTO, MONTO_BASE, ESTADO_FACTURA
      ) VALUES (
        R_USUARIO.ID_USUARIO, V_ANIO, V_MES, TRUNC(SYSDATE),
        TRUNC(ADD_MONTHS(SYSDATE, 1)), V_PRECIO, 'PENDIENTE'
      );

      V_CONTADOR_OK := V_CONTADOR_OK + 1;
    EXCEPTION
      WHEN DUP_VAL_ON_INDEX THEN
        -- Ya existe factura para este usuario/periodo: rollback parcial y continuar
        ROLLBACK TO SAVEPOINT SP_USUARIO;
        V_CONTADOR_ERR := V_CONTADOR_ERR + 1;
        DBMS_OUTPUT.PUT_LINE(
          'SAVEPOINT rollback usuario ID=' || R_USUARIO.ID_USUARIO ||
          ': factura duplicada para este periodo'
        );
      WHEN OTHERS THEN
        ROLLBACK TO SAVEPOINT SP_USUARIO;
        V_CONTADOR_ERR := V_CONTADOR_ERR + 1;
        DBMS_OUTPUT.PUT_LINE(
          'SAVEPOINT rollback usuario ID=' || R_USUARIO.ID_USUARIO ||
          ': ' || SQLERRM
        );
    END;
  END LOOP;

  COMMIT;

  DBMS_OUTPUT.PUT_LINE(
    'Facturacion masiva finalizada. OK=' || V_CONTADOR_OK ||
    ' | Errores (rollback parcial)=' || V_CONTADOR_ERR
  );
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20311,
      'Transaccion 2 fallida completamente: ' || SQLERRM
    );
END;
/

-- ============================================================================
-- SECCION C: Transaccion 3 — Eliminacion en cascada segura (hard delete)
-- ============================================================================
-- Demuestra:
--   - Eliminacion controlada en orden inverso para respetar constraints FK.
--   - Uso de ROLLBACK en caso de error para no dejar datos inconsistentes.
--   - Soft-delete alternativo: UPDATE de estado en vez de DELETE.
-- ============================================================================

DECLARE
  V_ID_USUARIO NUMBER := -1; -- cambiar por un ID real para prueba
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- TRANSACCION 3: Eliminacion en cascada segura ---');

  -- Verificar que el usuario existe
  SELECT ID_USUARIO INTO V_ID_USUARIO
  FROM USUARIOS
  WHERE EMAIL = 'transaccion.test@minflix.local';

  -- Paso 1: eliminar reproducciones
  DELETE FROM REPRODUCCIONES WHERE ID_PERFIL IN (
    SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO
  );
  DBMS_OUTPUT.PUT_LINE('Reproducciones eliminadas: ' || SQL%ROWCOUNT);

  -- Paso 2: eliminar favoritos
  DELETE FROM FAVORITOS WHERE ID_PERFIL IN (
    SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO
  );
  DBMS_OUTPUT.PUT_LINE('Favoritos eliminados: ' || SQL%ROWCOUNT);

  -- Paso 3: eliminar calificaciones
  DELETE FROM CALIFICACIONES WHERE ID_PERFIL IN (
    SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO
  );
  DBMS_OUTPUT.PUT_LINE('Calificaciones eliminadas: ' || SQL%ROWCOUNT);

  -- Paso 4: eliminar reportes del usuario
  DELETE FROM REPORTES WHERE ID_PERFIL_REPORTADOR IN (
    SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO
  );
  DBMS_OUTPUT.PUT_LINE('Reportes eliminados: ' || SQL%ROWCOUNT);

  -- Paso 5: desligar moderaciones realizadas por el usuario
  UPDATE REPORTES
     SET ID_USUARIO_MODERADOR = NULL
   WHERE ID_USUARIO_MODERADOR = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Reportes moderados desligados: ' || SQL%ROWCOUNT);

  -- Paso 6: eliminar pagos antes de facturaciones por FK_PAGOS_FACTURACION
  DELETE FROM PAGOS WHERE ID_USUARIO = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Pagos eliminados: ' || SQL%ROWCOUNT);

  -- Paso 7: eliminar perfiles
  DELETE FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Perfiles eliminados: ' || SQL%ROWCOUNT);

  -- Paso 8: eliminar facturaciones
  DELETE FROM FACTURACIONES WHERE ID_USUARIO = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Facturaciones eliminadas: ' || SQL%ROWCOUNT);

  -- Paso 9: eliminar referidos
  DELETE FROM REFERIDOS
  WHERE ID_USUARIO_REFERENTE = V_ID_USUARIO
     OR ID_USUARIO_REFERIDO = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Referidos eliminados: ' || SQL%ROWCOUNT);

  -- Paso 10: eliminar empleado (si existe)
  DELETE FROM EMPLEADOS WHERE ID_USUARIO = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Empleados eliminados: ' || SQL%ROWCOUNT);

  -- Paso 11: eliminar usuario
  DELETE FROM USUARIOS WHERE ID_USUARIO = V_ID_USUARIO;
  DBMS_OUTPUT.PUT_LINE('Usuario eliminado: ' || SQL%ROWCOUNT);

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Hard delete completado y COMMIT aplicado.');

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('Usuario no encontrado para eliminar. Se omite.');
    ROLLBACK;
  WHEN OTHERS THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('ROLLBACK aplicado por error: ' || SQLERRM);
    RAISE_APPLICATION_ERROR(
      -20321,
      'Transaccion 3 fallida: ' || SQLERRM || '. ROLLBACK aplicado.'
    );
END;
/

-- ============================================================================
-- SECCION D: Escenario de Concurrencia — Cambio de plan con SELECT FOR UPDATE
-- ============================================================================
-- Demuestra:
--   - Control de bloqueos con SELECT FOR UPDATE en modificaciones competitivas.
--   - Sesion A bloquea la fila del usuario antes de cambiar su plan.
--   - Sesion B intenta cambiar el mismo plan y espera o recibe timeout.
--   Este bloque ANONIMO simula la sesion A.
--   Para probar completamente: abrir dos sesiones SQL*Plus/SQL Developer.
-- ============================================================================

DECLARE
  V_ID_USUARIO     NUMBER := -1;
  V_ID_PLAN_ACTUAL NUMBER;
  V_NUEVO_PLAN     VARCHAR2(40) := 'PREMIUM';
  V_ID_NUEVO_PLAN  NUMBER;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- CONCURRENCIA: Cambio de plan con SELECT FOR UPDATE ---');

  -- Identificar un usuario de prueba (seed)
  SELECT ID_USUARIO INTO V_ID_USUARIO
  FROM USUARIOS
  WHERE EMAIL = 'usuario.seed@minflix.local'
  FOR UPDATE WAIT 10;

  DBMS_OUTPUT.PUT_LINE(
    'Sesion A: bloqueo adquirido sobre usuario ID=' || V_ID_USUARIO
  );

  SELECT ID_PLAN INTO V_ID_PLAN_ACTUAL
  FROM USUARIOS
  WHERE ID_USUARIO = V_ID_USUARIO;

  SELECT ID_PLAN INTO V_ID_NUEVO_PLAN
  FROM PLANES
  WHERE UPPER(NOMBRE) = UPPER(V_NUEVO_PLAN);

  -- Simular procesamiento de la sesion A (5 segundos)
  DBMS_OUTPUT.PUT_LINE('Sesion A: procesando cambio de plan...');
  DBMS_LOCK.SLEEP(3);

  UPDATE USUARIOS
     SET ID_PLAN = V_ID_NUEVO_PLAN,
         FECHA_ACTUALIZACION = CURRENT_TIMESTAMP
   WHERE ID_USUARIO = V_ID_USUARIO;

  COMMIT;

  DBMS_OUTPUT.PUT_LINE(
    'Sesion A: plan cambiado a ' || V_NUEVO_PLAN || ' y COMMIT. Bloqueo liberado.'
  );

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('Usuario de prueba no encontrado.');
  WHEN OTHERS THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('Error en sesion A: ' || SQLERRM);
END;
/

-- ============================================================================
-- Instrucciones para prueba manual de concurrencia (dos sesiones):
-- ============================================================================
-- Sesion A (esta sesion):
--   Ejecutar el bloque anterior.
--   Mantendra el bloqueo FOR UPDATE durante ~3 segundos.
--
-- Sesion B (segunda ventana SQL):
--   Intentar ejecutar:
--     SELECT ID_PLAN FROM USUARIOS WHERE EMAIL='usuario.seed@minflix.local' FOR UPDATE;
--   Resultado esperado: la sesion B espera hasta que A haga COMMIT.
--   Si se usa NOWAIT: ORA-00054 (resource busy).
--   Si se usa WAIT N: espera N segundos y luego ORA-30006 si no se libera.
-- ============================================================================

COMMIT;
