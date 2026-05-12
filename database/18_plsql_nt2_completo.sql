-- ============================================================================
-- MinFlix - Nucleo 2 PL/SQL Completo (NT2: Programacion PL/SQL)
-- Ejecutar como owner de tablas (MINFLIX_APP en XEPDB1).
-- Requiere: scripts 01..17 aplicados.
-- Objetivo:
--   Completar los requerimientos de NT2 que faltan en scripts anteriores:
--   - Cursores (2): cartera vencida y popularidad de catalogo.
--   - Procedimientos (2 nuevos + 1 existente = 3): registrar usuario,
--     cambiar plan, aplicar mora (ya existe en script 09).
--   - Funciones (1 nueva + 1 existente = 2): calcular monto, clasificacion
--     permitida (ya existe en script 03).
--   - Manejo de excepciones documentado en cada bloque.
-- ============================================================================

SET SERVEROUTPUT ON;
-- DBMS_OUTPUT muestra resultados de cursores y procedimientos en consola.

-- ============================================================================
-- SECCION A: Cursores (2 requeridos por NT2)
-- ============================================================================

-- --------------------------------------------------------------------------
-- Cursor A.1: Reporte de cartera vencida (>30 dias).
-- Recorre facturas pendientes cuya fecha de vencimiento excede 30 dias
-- respecto a la fecha actual, e imprime un resumen por consola.
-- --------------------------------------------------------------------------
DECLARE
  CURSOR CUR_CARTERA_VENCIDA IS
    SELECT
      F.ID_FACTURACION,
      F.ID_USUARIO,
      U.NOMBRE    AS NOMBRE_USUARIO,
      U.EMAIL,
      F.PERIODO_ANIO,
      F.PERIODO_MES,
      F.MONTO_FINAL,
      F.FECHA_VENCIMIENTO,
      TRUNC(SYSDATE) - F.FECHA_VENCIMIENTO AS DIAS_VENCIDA
    FROM FACTURACIONES F
    JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
    WHERE F.ESTADO_FACTURA = 'PENDIENTE'
      AND F.FECHA_VENCIMIENTO < TRUNC(SYSDATE) - 30
    ORDER BY DIAS_VENCIDA DESC;

  V_REGISTRO CUR_CARTERA_VENCIDA%ROWTYPE;
  V_TOTAL_VENCIDO NUMBER := 0;
  V_CANTIDAD      NUMBER := 0;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- REPORTE DE CARTERA VENCIDA (>30 DIAS) ---');

  OPEN CUR_CARTERA_VENCIDA;
  LOOP
    FETCH CUR_CARTERA_VENCIDA INTO V_REGISTRO;
    EXIT WHEN CUR_CARTERA_VENCIDA%NOTFOUND;

    V_CANTIDAD := V_CANTIDAD + 1;
    V_TOTAL_VENCIDO := V_TOTAL_VENCIDO + V_REGISTRO.MONTO_FINAL;

    DBMS_OUTPUT.PUT_LINE(
      'Factura #' || V_REGISTRO.ID_FACTURACION ||
      ' | Usuario: ' || V_REGISTRO.NOMBRE_USUARIO ||
      ' | Periodo: ' || V_REGISTRO.PERIODO_ANIO || '/' || V_REGISTRO.PERIODO_MES ||
      ' | Monto: ' || V_REGISTRO.MONTO_FINAL ||
      ' | Dias vencida: ' || V_REGISTRO.DIAS_VENCIDA
    );
  END LOOP;
  CLOSE CUR_CARTERA_VENCIDA;

  DBMS_OUTPUT.PUT_LINE('Total facturas vencidas: ' || V_CANTIDAD);
  DBMS_OUTPUT.PUT_LINE('Monto total vencido: ' || V_TOTAL_VENCIDO);
END;
/

-- --------------------------------------------------------------------------
-- Cursor A.2: Actualizacion de metricas de popularidad del catalogo.
-- Recorre contenidos que tienen reproducciones y calcula:
--   - total_reproducciones
--   - promedio_avance
--   - total_calificaciones
--   - promedio_puntaje
-- Almacena el resultado en una tabla temporal de auditoria/popularidad.
-- Nota: la tabla TMP_POPULARIDAD_CATALOGO se crea dinamicamente si no existe.
-- --------------------------------------------------------------------------
BEGIN
  EXECUTE IMMEDIATE '
    CREATE GLOBAL TEMPORARY TABLE TMP_POPULARIDAD_CATALOGO (
      ID_CONTENIDO          NUMBER PRIMARY KEY,
      TITULO                VARCHAR2(180),
      TOTAL_REPRODUCCIONES  NUMBER,
      PROMEDIO_AVANCE       NUMBER(5,2),
      TOTAL_CALIFICACIONES  NUMBER,
      PROMEDIO_PUNTAJE      NUMBER(3,2),
      FECHA_CALCULO         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ON COMMIT PRESERVE ROWS
  ';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE = -955 THEN
      -- ORA-00955: name is already used by an existing object
      NULL;
    ELSE
      RAISE;
    END IF;
END;
/

DECLARE
  CURSOR CUR_POPULARIDAD_CATALOGO IS
    SELECT
      C.ID_CONTENIDO,
      C.TITULO,
      COUNT(R.ID_REPRODUCCION) AS TOTAL_REPRODUCCIONES,
      ROUND(AVG(R.PORCENTAJE_AVANCE), 2) AS PROMEDIO_AVANCE,
      COUNT(CAL.ID_CALIFICACION) AS TOTAL_CALIFICACIONES,
      ROUND(AVG(CAL.PUNTAJE), 2) AS PROMEDIO_PUNTAJE
    FROM CONTENIDOS C
    LEFT JOIN REPRODUCCIONES R
      ON R.ID_CONTENIDO = C.ID_CONTENIDO
    LEFT JOIN CALIFICACIONES CAL
      ON CAL.ID_CONTENIDO = C.ID_CONTENIDO
    GROUP BY C.ID_CONTENIDO, C.TITULO
    HAVING COUNT(R.ID_REPRODUCCION) > 0
    ORDER BY COUNT(R.ID_REPRODUCCION) DESC;

  V_REGISTRO CUR_POPULARIDAD_CATALOGO%ROWTYPE;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- METRICAS DE POPULARIDAD DEL CATALOGO ---');

  OPEN CUR_POPULARIDAD_CATALOGO;
  LOOP
    FETCH CUR_POPULARIDAD_CATALOGO INTO V_REGISTRO;
    EXIT WHEN CUR_POPULARIDAD_CATALOGO%NOTFOUND;

    MERGE INTO TMP_POPULARIDAD_CATALOGO TMP
    USING (SELECT V_REGISTRO.ID_CONTENIDO AS ID_CONTENIDO FROM DUAL) SRC
    ON (TMP.ID_CONTENIDO = SRC.ID_CONTENIDO)
    WHEN MATCHED THEN
      UPDATE SET
        TMP.TITULO               = V_REGISTRO.TITULO,
        TMP.TOTAL_REPRODUCCIONES = V_REGISTRO.TOTAL_REPRODUCCIONES,
        TMP.PROMEDIO_AVANCE      = V_REGISTRO.PROMEDIO_AVANCE,
        TMP.TOTAL_CALIFICACIONES = V_REGISTRO.TOTAL_CALIFICACIONES,
        TMP.PROMEDIO_PUNTAJE     = V_REGISTRO.PROMEDIO_PUNTAJE,
        TMP.FECHA_CALCULO        = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN
      INSERT (ID_CONTENIDO, TITULO, TOTAL_REPRODUCCIONES, PROMEDIO_AVANCE,
              TOTAL_CALIFICACIONES, PROMEDIO_PUNTAJE, FECHA_CALCULO)
      VALUES (V_REGISTRO.ID_CONTENIDO, V_REGISTRO.TITULO,
              V_REGISTRO.TOTAL_REPRODUCCIONES, V_REGISTRO.PROMEDIO_AVANCE,
              V_REGISTRO.TOTAL_CALIFICACIONES, V_REGISTRO.PROMEDIO_PUNTAJE,
              CURRENT_TIMESTAMP);

    DBMS_OUTPUT.PUT_LINE(
      V_REGISTRO.TITULO || ' | Reproducciones: ' || V_REGISTRO.TOTAL_REPRODUCCIONES ||
      ' | Avance promedio: ' || NVL(V_REGISTRO.PROMEDIO_AVANCE, 0) || '% |' ||
      ' Calificaciones: ' || NVL(V_REGISTRO.TOTAL_CALIFICACIONES, 0) ||
      ' | Puntaje: ' || NVL(V_REGISTRO.PROMEDIO_PUNTAJE, 0)
    );
  END LOOP;
  CLOSE CUR_POPULARIDAD_CATALOGO;

  COMMIT;
END;
/

-- ============================================================================
-- SECCION B: Procedimientos Almacenados (2 nuevos requeridos por NT2)
-- ============================================================================

-- --------------------------------------------------------------------------
-- Procedimiento B.1: Registro integral de usuario con plan y perfil inicial.
-- Incluye validacion de email unico (captura DUP_VAL_ON_INDEX),
-- creacion de perfil inicial y generacion de factura de prueba.
-- Parametros:
--   P_NOMBRE, P_EMAIL, P_TELEFONO, P_FECHA_NACIMIENTO, P_CIUDAD_RESIDENCIA,
--   P_PASSWORD_HASH, P_PLAN_NOMBRE, P_NOMBRE_PERFIL, P_TIPO_PERFIL
-- Salida:
--   P_ID_USUARIO generado.
-- --------------------------------------------------------------------------
-- Nota: el procedimiento maneja COMMIT/ROLLBACK internamente.
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_USUARIO (
  P_NOMBRE           IN  VARCHAR2,
  P_EMAIL            IN  VARCHAR2,
  P_TELEFONO         IN  VARCHAR2,
  P_FECHA_NACIMIENTO IN  DATE,
  P_CIUDAD_RESIDENCIA IN VARCHAR2,
  P_PASSWORD_HASH    IN  VARCHAR2,
  P_PLAN_NOMBRE      IN  VARCHAR2,
  P_NOMBRE_PERFIL    IN  VARCHAR2,
  P_TIPO_PERFIL      IN  VARCHAR2 DEFAULT 'adulto',
  P_ID_USUARIO       OUT NUMBER
) IS
  V_ID_PLAN    PLANES.ID_PLAN%TYPE;
  V_PERFIL_ID  PERFILES.ID_PERFIL%TYPE;
BEGIN
  -- Obtener el ID del plan por nombre
  SELECT ID_PLAN INTO V_ID_PLAN
  FROM PLANES
  WHERE UPPER(NOMBRE) = UPPER(P_PLAN_NOMBRE);

  -- Insertar usuario
  INSERT INTO USUARIOS (
    NOMBRE, EMAIL, TELEFONO, FECHA_NACIMIENTO, CIUDAD_RESIDENCIA,
    PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN
  ) VALUES (
    P_NOMBRE, LOWER(TRIM(P_EMAIL)), P_TELEFONO, P_FECHA_NACIMIENTO,
    P_CIUDAD_RESIDENCIA, P_PASSWORD_HASH, 'usuario', 'ACTIVO', V_ID_PLAN
  )
  RETURNING ID_USUARIO INTO P_ID_USUARIO;

  -- Crear perfil inicial
  INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL)
  VALUES (P_ID_USUARIO, P_NOMBRE_PERFIL, LOWER(TRIM(P_TIPO_PERFIL)))
  RETURNING ID_PERFIL INTO V_PERFIL_ID;

  -- Generar factura inicial (simulada: periodo actual)
  INSERT INTO FACTURACIONES (
    ID_USUARIO, PERIODO_ANIO, PERIODO_MES, FECHA_CORTE, FECHA_VENCIMIENTO,
    MONTO_BASE, DESCUENTO_REFERIDOS_PCT, DESCUENTO_FIDELIDAD_PCT, MONTO_FINAL,
    ESTADO_FACTURA
  ) VALUES (
    P_ID_USUARIO,
    EXTRACT(YEAR FROM SYSDATE),
    EXTRACT(MONTH FROM SYSDATE),
    TRUNC(SYSDATE),
    TRUNC(ADD_MONTHS(SYSDATE, 1)),
    (SELECT PRECIO_MENSUAL FROM PLANES WHERE ID_PLAN = V_ID_PLAN),
    0,
    0,
    0,  -- se calculara via trigger
    'PENDIENTE'
  );

  COMMIT;

  DBMS_OUTPUT.PUT_LINE('Usuario registrado con ID: ' || P_ID_USUARIO ||
                       ' y perfil ID: ' || V_PERFIL_ID);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20101,
      'El plan especificado no existe'
    );
  WHEN DUP_VAL_ON_INDEX THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20102,
      'El correo electronico ya esta registrado en el sistema'
    );
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20103,
      'Error en registro de usuario: ' || SQLERRM
    );
END;
/

-- --------------------------------------------------------------------------
-- Procedimiento B.2: Cambio de plan con validacion de limites de perfiles.
-- Valida que el numero de perfiles actuales del usuario no exceda el limite
-- del nuevo plan. Si no caben, lanza excepcion controlada.
-- Parametros:
--   P_ID_USUARIO, P_NUEVO_PLAN_NOMBRE
-- --------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_CAMBIAR_PLAN (
  P_ID_USUARIO       IN NUMBER,
  P_NUEVO_PLAN_NOMBRE IN VARCHAR2
) IS
  V_ID_NUEVO_PLAN    PLANES.ID_PLAN%TYPE;
  V_LIMITE_NUEVO     PLANES.LIMITE_PERFILES%TYPE;
  V_PERFILES_ACTUALES NUMBER;
BEGIN
  -- Obtener datos del nuevo plan
  SELECT ID_PLAN, LIMITE_PERFILES
  INTO V_ID_NUEVO_PLAN, V_LIMITE_NUEVO
  FROM PLANES
  WHERE UPPER(NOMBRE) = UPPER(P_NUEVO_PLAN_NOMBRE);

  -- Contar perfiles actuales del usuario
  SELECT COUNT(*) INTO V_PERFILES_ACTUALES
  FROM PERFILES
  WHERE ID_USUARIO = P_ID_USUARIO;

  IF V_PERFILES_ACTUALES > V_LIMITE_NUEVO THEN
    RAISE_APPLICATION_ERROR(
      -20111,
      'El usuario tiene ' || V_PERFILES_ACTUALES ||
      ' perfiles y el plan ' || P_NUEVO_PLAN_NOMBRE ||
      ' solo permite ' || V_LIMITE_NUEVO ||
      '. Elimine perfiles antes de cambiar de plan.'
    );
  END IF;

  -- Actualizar plan del usuario
  UPDATE USUARIOS
     SET ID_PLAN = V_ID_NUEVO_PLAN,
         FECHA_ACTUALIZACION = CURRENT_TIMESTAMP
   WHERE ID_USUARIO = P_ID_USUARIO;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(
      -20112,
      'No existe el usuario especificado para cambiar de plan'
    );
  END IF;

  COMMIT;

  DBMS_OUTPUT.PUT_LINE(
    'Plan cambiado exitosamente para usuario ID: ' || P_ID_USUARIO ||
    ' al plan: ' || P_NUEVO_PLAN_NOMBRE
  );
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20113,
      'El plan especificado no existe'
    );
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20114,
      'Error al cambiar de plan: ' || SQLERRM
    );
END;
/

-- ============================================================================
-- SECCION C: Funciones (1 nueva requerida por NT2)
-- ============================================================================

-- --------------------------------------------------------------------------
-- Funcion C.1: Calculo dinamico de monto con descuentos por referidos
-- y fidelidad (>12 meses = 10%, >24 meses = 15%).
-- Retorna el monto final estimado para un usuario y periodo.
-- Parametros:
--   P_ID_USUARIO, P_PERIODO_ANIO, P_PERIODO_MES
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_CALCULAR_MONTO (
  P_ID_USUARIO    IN NUMBER,
  P_PERIODO_ANIO  IN NUMBER,
  P_PERIODO_MES   IN NUMBER
) RETURN NUMBER
IS
  V_MONTO_BASE          PLANES.PRECIO_MENSUAL%TYPE;
  V_DESC_REF_PCT        NUMBER(5,2) := 0;
  V_DESC_FID_PCT        NUMBER(5,2) := 0;
  V_MESES_ANTIGUEDAD    NUMBER;
  V_MONTO_FINAL         NUMBER(10,2);
BEGIN
  -- Obtener precio base del plan actual del usuario
  SELECT P.PRECIO_MENSUAL
    INTO V_MONTO_BASE
    FROM USUARIOS U
    JOIN PLANES P ON P.ID_PLAN = U.ID_PLAN
   WHERE U.ID_USUARIO = P_ID_USUARIO;

  -- Descuento por referidos validados
  SELECT COALESCE(SUM(R.DESCUENTO_PCT), 0)
    INTO V_DESC_REF_PCT
    FROM REFERIDOS R
   WHERE R.ID_USUARIO_REFERENTE = P_ID_USUARIO
     AND R.ESTADO_REFERIDO = 'VALIDADO';

  -- Limitar descuento por referidos a maximo 30%
  V_DESC_REF_PCT := LEAST(V_DESC_REF_PCT, 30);

  -- Calcular antiguedad en meses
  SELECT MONTHS_BETWEEN(SYSDATE, MIN(FECHA_CREACION))
    INTO V_MESES_ANTIGUEDAD
    FROM USUARIOS
   WHERE ID_USUARIO = P_ID_USUARIO;

  -- Descuento por fidelidad
  IF V_MESES_ANTIGUEDAD >= 24 THEN
    V_DESC_FID_PCT := 15;
  ELSIF V_MESES_ANTIGUEDAD >= 12 THEN
    V_DESC_FID_PCT := 10;
  END IF;

  -- Calcular monto final (limite total descuentos 100%)
  V_MONTO_FINAL := ROUND(
    V_MONTO_BASE * (1 - LEAST(V_DESC_REF_PCT + V_DESC_FID_PCT, 100) / 100),
    2
  );

  RETURN V_MONTO_FINAL;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 0;
  WHEN OTHERS THEN
    RETURN -1;
END;
/

-- --------------------------------------------------------------------------
-- Funcion C.2: Motor basico de recomendacion de contenido.
-- Dado un perfil, retorna el ID del contenido mas popular que:
--   1. No haya sido reproducido aun por ese perfil.
--   2. Comparta al menos un genero con los contenidos favoritos del perfil.
-- Si no hay favoritos, recomienda el contenido mas popular del catalogo.
-- Parametro: P_ID_PERFIL
-- Retorno: ID_CONTENIDO recomendado (NULL si no hay recomendacion).
-- --------------------------------------------------------------------------
-- Fallback incluido: si no hay favoritos, se usa popularidad global.
CREATE OR REPLACE FUNCTION FN_CONTENIDO_RECOMENDADO (
  P_ID_PERFIL IN NUMBER
) RETURN NUMBER
IS
  V_ID_RECOMENDADO CONTENIDOS.ID_CONTENIDO%TYPE;
BEGIN
  -- Primero intentar recomendacion por generos de favoritos del perfil
  SELECT ID_CONTENIDO
    INTO V_ID_RECOMENDADO
    FROM (
      SELECT C.ID_CONTENIDO, COUNT(R.ID_REPRODUCCION) AS POPULARIDAD
      FROM CONTENIDOS C
      JOIN CONTENIDOS_GENEROS CG
        ON CG.ID_CONTENIDO = C.ID_CONTENIDO
      LEFT JOIN REPRODUCCIONES R
        ON R.ID_CONTENIDO = C.ID_CONTENIDO
      WHERE CG.ID_GENERO IN (
        SELECT CG2.ID_GENERO
        FROM FAVORITOS F
        JOIN CONTENIDOS_GENEROS CG2
          ON CG2.ID_CONTENIDO = F.ID_CONTENIDO
        WHERE F.ID_PERFIL = P_ID_PERFIL
      )
      AND C.ID_CONTENIDO NOT IN (
        SELECT R.ID_CONTENIDO FROM REPRODUCCIONES R WHERE R.ID_PERFIL = P_ID_PERFIL
      )
      GROUP BY C.ID_CONTENIDO
      ORDER BY COUNT(R.ID_REPRODUCCION) DESC
    )
   WHERE ROWNUM = 1;

  RETURN V_ID_RECOMENDADO;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    -- Fallback: contenido mas popular del catalogo no visto
    BEGIN
      SELECT C.ID_CONTENIDO
        INTO V_ID_RECOMENDADO
        FROM CONTENIDOS C
        LEFT JOIN REPRODUCCIONES R
          ON R.ID_CONTENIDO = C.ID_CONTENIDO
       WHERE C.ID_CONTENIDO NOT IN (
         SELECT ID_CONTENIDO FROM REPRODUCCIONES WHERE ID_PERFIL = P_ID_PERFIL
       )
       GROUP BY C.ID_CONTENIDO
       ORDER BY COUNT(R.ID_REPRODUCCION) DESC
       FETCH FIRST 1 ROW ONLY;

      RETURN V_ID_RECOMENDADO;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RETURN NULL;
    END;
  WHEN OTHERS THEN
    RETURN NULL;
END;
/

COMMIT;

-- Grants de ejecucion para roles autorizados.
GRANT EXECUTE ON SP_REGISTRAR_USUARIO TO ROL_ADMIN;
GRANT EXECUTE ON SP_CAMBIAR_PLAN TO ROL_ADMIN;
GRANT EXECUTE ON FN_CALCULAR_MONTO TO ROL_ADMIN;
GRANT EXECUTE ON FN_CONTENIDO_RECOMENDADO TO ROL_ADMIN;

GRANT EXECUTE ON FN_CALCULAR_MONTO TO ROL_ANALISTA;
GRANT EXECUTE ON FN_CONTENIDO_RECOMENDADO TO ROL_ANALISTA;

-- ============================================================================
-- Verificacion final
-- ============================================================================
SELECT OBJECT_NAME, OBJECT_TYPE, STATUS
  FROM USER_OBJECTS
 WHERE OBJECT_NAME IN (
   'CUR_CARTERA_VENCIDA',      -- cursor (no aparece como objeto, verificado por bloque anonimo)
   'CUR_POPULARIDAD_CATALOGO', -- cursor (no aparece como objeto)
   'SP_REGISTRAR_USUARIO',
   'SP_CAMBIAR_PLAN',
   'SP_APLICAR_MORA_CUENTAS',  -- existente script 09
   'FN_CALCULAR_MONTO',
   'FN_CLASIFICACION_PERMITIDA_PARA_PERFIL', -- existente script 03
   'FN_CONTENIDO_RECOMENDADO'
 )
 ORDER BY OBJECT_TYPE, OBJECT_NAME;
