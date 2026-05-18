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
  -- Cursor explicito: facturas pendientes vencidas >30 dias.
  -- JOIN a USUARIOS para traer nombre y email del titular.
  -- Filtra: estado PENDIENTE y fecha de vencimiento anterior a hoy-30.
  -- Ordena de la mas vieja a la mas reciente para priorizar cobro.
  CURSOR CUR_CARTERA_VENCIDA IS
    SELECT
      F.ID_FACTURACION,                         -- PK de la factura
      F.ID_USUARIO,                             -- FK al usuario deudor
      U.NOMBRE    AS NOMBRE_USUARIO,            -- Nombre del titular (legible)
      U.EMAIL,                                  -- Correo para contacto de cobro
      F.PERIODO_ANIO,                           -- Anio de facturacion
      F.PERIODO_MES,                            -- Mes de facturacion
      F.MONTO_FINAL,                            -- Monto con descuentos aplicados
      F.FECHA_VENCIMIENTO,                      -- Fecha limite de pago
      TRUNC(SYSDATE) - F.FECHA_VENCIMIENTO AS DIAS_VENCIDA  -- Diferencia en dias
    FROM FACTURACIONES F
    JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
    WHERE F.ESTADO_FACTURA = 'PENDIENTE'
      AND F.FECHA_VENCIMIENTO < TRUNC(SYSDATE) - 30
    ORDER BY DIAS_VENCIDA DESC;

  -- Variable de registro que almacena una fila del cursor
  V_REGISTRO CUR_CARTERA_VENCIDA%ROWTYPE;
  -- Acumulador del monto total vencido en moneda local
  V_TOTAL_VENCIDO NUMBER := 0;
  -- Contador de facturas vencidas encontradas
  V_CANTIDAD      NUMBER := 0;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- REPORTE DE CARTERA VENCIDA (>30 DIAS) ---');

  -- Abrir el cursor: Oracle ejecuta el SELECT y prepara el conjunto de resultados
  OPEN CUR_CARTERA_VENCIDA;
  LOOP
    -- Extraer la siguiente fila del cursor hacia la variable de registro
    FETCH CUR_CARTERA_VENCIDA INTO V_REGISTRO;
    -- Salir del loop cuando no queden mas filas (%NOTFOUND = TRUE)
    EXIT WHEN CUR_CARTERA_VENCIDA%NOTFOUND;

    -- Incrementar contador de facturas procesadas
    V_CANTIDAD := V_CANTIDAD + 1;
    -- Sumar el monto de esta factura al total acumulado
    V_TOTAL_VENCIDO := V_TOTAL_VENCIDO + V_REGISTRO.MONTO_FINAL;

    -- Imprimir detalle de la factura vencida en consola
    DBMS_OUTPUT.PUT_LINE(
      'Factura #' || V_REGISTRO.ID_FACTURACION ||
      ' | Usuario: ' || V_REGISTRO.NOMBRE_USUARIO ||
      ' | Periodo: ' || V_REGISTRO.PERIODO_ANIO || '/' || V_REGISTRO.PERIODO_MES ||
      ' | Monto: ' || V_REGISTRO.MONTO_FINAL ||
      ' | Dias vencida: ' || V_REGISTRO.DIAS_VENCIDA
    );
  END LOOP;
  -- Cerrar el cursor para liberar memoria y locks
  CLOSE CUR_CARTERA_VENCIDA;

  -- Mostrar totales acumulados del reporte
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
-- Bloque anonimo para crear tabla temporal de forma idempotente.
-- Si ya existe (ORA-00955), se ignora silenciosamente para permitir re-ejecucion.
BEGIN
  -- DDL dinamico: ejecuta CREATE TABLE en tiempo de ejecucion
  EXECUTE IMMEDIATE '
    CREATE GLOBAL TEMPORARY TABLE TMP_POPULARIDAD_CATALOGO (
      ID_CONTENIDO          NUMBER PRIMARY KEY,  -- PK del contenido evaluado
      TITULO                VARCHAR2(180),       -- Titulo para referencia humana
      TOTAL_REPRODUCCIONES  NUMBER,              -- Cantidad de sesiones de reproduccion
      PROMEDIO_AVANCE       NUMBER(5,2),         -- Porcentaje medio de visionado
      TOTAL_CALIFICACIONES  NUMBER,              -- Numero de calificaciones recibidas
      PROMEDIO_PUNTAJE      NUMBER(3,2),         -- Puntaje promedio (escala 1-5)
      FECHA_CALCULO         TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Momento del calculo
    ) ON COMMIT PRESERVE ROWS  -- Conserva datos entre transacciones en la sesion
  ';
EXCEPTION
  WHEN OTHERS THEN
    -- ORA-00955: el objeto ya existe (re-ejecucion del script)
    IF SQLCODE = -955 THEN
      -- ORA-00955: name is already used by an existing object
      NULL;  -- Ignorar: la tabla temporal ya existe, no es error
    ELSE
      -- Cualquier otro error se propaga para detener la ejecucion
      RAISE;
    END IF;
END;
/

DECLARE
  -- Cursor explicito: metricas de popularidad del catalogo multimedia.
  -- LEFT JOIN permite incluir contenidos aunque no tengan calificaciones.
  -- HAVING garantiza que solo se consideren contenidos con al menos 1 reproduccion.
  -- Ordena por cantidad de reproducciones (mas populares primero).
  CURSOR CUR_POPULARIDAD_CATALOGO IS
    SELECT
      C.ID_CONTENIDO,                                    -- PK del contenido
      C.TITULO,                                          -- Titulo legible del contenido
      COUNT(R.ID_REPRODUCCION) AS TOTAL_REPRODUCCIONES, -- Sesiones de visionado
      ROUND(AVG(R.PORCENTAJE_AVANCE), 2) AS PROMEDIO_AVANCE,  -- Avance promedio en %
      COUNT(CAL.ID_CALIFICACION) AS TOTAL_CALIFICACIONES,     -- Reviews recibidas
      ROUND(AVG(CAL.PUNTAJE), 2) AS PROMEDIO_PUNTAJE          -- Puntaje medio 1-5
    FROM CONTENIDOS C
    LEFT JOIN REPRODUCCIONES R
      ON R.ID_CONTENIDO = C.ID_CONTENIDO
    LEFT JOIN CALIFICACIONES CAL
      ON CAL.ID_CONTENIDO = C.ID_CONTENIDO
    GROUP BY C.ID_CONTENIDO, C.TITULO
    HAVING COUNT(R.ID_REPRODUCCION) > 0
    ORDER BY COUNT(R.ID_REPRODUCCION) DESC;

  -- Variable de registro para almacenar cada fila del cursor
  V_REGISTRO CUR_POPULARIDAD_CATALOGO%ROWTYPE;
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- METRICAS DE POPULARIDAD DEL CATALOGO ---');

  -- Abrir cursor y preparar el conjunto de resultados
  OPEN CUR_POPULARIDAD_CATALOGO;
  LOOP
    -- Leer siguiente fila del cursor
    FETCH CUR_POPULARIDAD_CATALOGO INTO V_REGISTRO;
    -- Terminar loop cuando no queden filas por procesar
    EXIT WHEN CUR_POPULARIDAD_CATALOGO%NOTFOUND;

    -- MERGE INTO: actualiza fila existente o inserta nueva en tabla temporal.
    -- DUAL es una tabla dummy de Oracle para generar una fila fuente.
    -- Esto permite ejecutar el script varias veces sin duplicar datos.
    MERGE INTO TMP_POPULARIDAD_CATALOGO TMP
    USING (SELECT V_REGISTRO.ID_CONTENIDO AS ID_CONTENIDO FROM DUAL) SRC
    ON (TMP.ID_CONTENIDO = SRC.ID_CONTENIDO)
    WHEN MATCHED THEN
      -- Si el contenido ya existe: actualizar metricas y fecha de calculo
      UPDATE SET
        TMP.TITULO               = V_REGISTRO.TITULO,
        TMP.TOTAL_REPRODUCCIONES = V_REGISTRO.TOTAL_REPRODUCCIONES,
        TMP.PROMEDIO_AVANCE      = V_REGISTRO.PROMEDIO_AVANCE,
        TMP.TOTAL_CALIFICACIONES = V_REGISTRO.TOTAL_CALIFICACIONES,
        TMP.PROMEDIO_PUNTAJE     = V_REGISTRO.PROMEDIO_PUNTAJE,
        TMP.FECHA_CALCULO        = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN
      -- Si es la primera vez: insertar nueva fila con todas las metricas
      INSERT (ID_CONTENIDO, TITULO, TOTAL_REPRODUCCIONES, PROMEDIO_AVANCE,
              TOTAL_CALIFICACIONES, PROMEDIO_PUNTAJE, FECHA_CALCULO)
      VALUES (V_REGISTRO.ID_CONTENIDO, V_REGISTRO.TITULO,
              V_REGISTRO.TOTAL_REPRODUCCIONES, V_REGISTRO.PROMEDIO_AVANCE,
              V_REGISTRO.TOTAL_CALIFICACIONES, V_REGISTRO.PROMEDIO_PUNTAJE,
              CURRENT_TIMESTAMP);

    -- Imprimir metricas por contenido en consola (NVL evita NULL en output)
    DBMS_OUTPUT.PUT_LINE(
      V_REGISTRO.TITULO || ' | Reproducciones: ' || V_REGISTRO.TOTAL_REPRODUCCIONES ||
      ' | Avance promedio: ' || NVL(V_REGISTRO.PROMEDIO_AVANCE, 0) || '% |' ||
      ' Calificaciones: ' || NVL(V_REGISTRO.TOTAL_CALIFICACIONES, 0) ||
      ' | Puntaje: ' || NVL(V_REGISTRO.PROMEDIO_PUNTAJE, 0)
    );
  END LOOP;
  -- Liberar recursos del cursor
  CLOSE CUR_POPULARIDAD_CATALOGO;

  -- Confirmar transaccion para persistir datos en tabla temporal (ON COMMIT PRESERVE ROWS)
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
-- Registro atomico de usuario: si falla cualquier paso, todo se revierte.
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_USUARIO (
  P_NOMBRE           IN  VARCHAR2,   -- Nombre completo del titular de la cuenta
  P_EMAIL            IN  VARCHAR2,   -- Correo unico (UK) para login
  P_TELEFONO         IN  VARCHAR2,   -- Numero de contacto del usuario
  P_FECHA_NACIMIENTO IN  DATE,       -- Fecha de nacimiento para control parental
  P_CIUDAD_RESIDENCIA IN VARCHAR2,   -- Ciudad de residencia (analitica territorial)
  P_PASSWORD_HASH    IN  VARCHAR2,   -- Hash bcrypt de la contrasena (no texto plano)
  P_PLAN_NOMBRE      IN  VARCHAR2,   -- Nombre del plan comercial (BASICO, ESTANDAR, PREMIUM)
  P_NOMBRE_PERFIL    IN  VARCHAR2,   -- Nombre del perfil inicial de reproduccion
  P_TIPO_PERFIL      IN  VARCHAR2 DEFAULT 'adulto',  -- adulto o infantil (control parental)
  P_ID_USUARIO       OUT NUMBER      -- ID generado del nuevo usuario (retorno al caller)
) IS
  -- Variable interna: ID del plan resuelto por nombre
  V_ID_PLAN    PLANES.ID_PLAN%TYPE;
  -- Variable interna: ID del perfil creado para output/debug
  V_PERFIL_ID  PERFILES.ID_PERFIL%TYPE;
BEGIN
  -- Paso 1: resolver el ID del plan a partir de su nombre.
  -- UPPER() en ambos lados hace la busqueda case-insensitive.
  SELECT ID_PLAN INTO V_ID_PLAN
  FROM PLANES
  WHERE UPPER(NOMBRE) = UPPER(P_PLAN_NOMBRE);

  -- Paso 2: insertar la cuenta principal en USUARIOS.
  -- LOWER(TRIM()) normaliza el email para evitar duplicados por espacios o mayusculas.
  INSERT INTO USUARIOS (
    NOMBRE, EMAIL, TELEFONO, FECHA_NACIMIENTO, CIUDAD_RESIDENCIA,
    PASSWORD_HASH, ESTADO_CUENTA, ID_PLAN
  ) VALUES (
    P_NOMBRE, LOWER(TRIM(P_EMAIL)), P_TELEFONO, P_FECHA_NACIMIENTO,
    P_CIUDAD_RESIDENCIA, P_PASSWORD_HASH, 'ACTIVO', V_ID_PLAN
  )
  -- Capturar el ID autogenerado para retornarlo al caller
  RETURNING ID_USUARIO INTO P_ID_USUARIO;

  -- Asignar rol por defecto 'usuario' en la tabla de roles M:N
  INSERT INTO ROLES_USUARIOS (ID_USUARIO, ROL) VALUES (P_ID_USUARIO, 'usuario');

  -- Paso 3: crear el perfil de reproduccion inicial vinculado al usuario.
  -- LOWER(TRIM()) normaliza el tipo de perfil (adulto/infantil).
  INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL)
  VALUES (P_ID_USUARIO, P_NOMBRE_PERFIL, LOWER(TRIM(P_TIPO_PERFIL)))
  RETURNING ID_PERFIL INTO V_PERFIL_ID;

  -- Paso 4: generar la factura inicial del periodo en curso.
  -- EXTRACT obtiene anio y mes actual. TRUNC(SYSDATE) elimina la hora.
  -- ADD_MONTHS(SYSDATE, 1) calcula vencimiento a 30 dias.
  -- MONTO_FINAL = 0 porque el trigger de facturacion lo calculara.
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

  -- Confirmar transaccion: todos los inserts anteriores se hacen permanentes
  COMMIT;

  -- Imprimir confirmacion con IDs generados para debug/log
  DBMS_OUTPUT.PUT_LINE('Usuario registrado con ID: ' || P_ID_USUARIO ||
                       ' y perfil ID: ' || V_PERFIL_ID);
EXCEPTION
  -- Si el plan no existe en la tabla PLANES
  WHEN NO_DATA_FOUND THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20101,
      'El plan especificado no existe'
    );
  -- Si el email ya esta registrado (UK violada)
  WHEN DUP_VAL_ON_INDEX THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20102,
      'El correo electronico ya esta registrado en el sistema'
    );
  -- Cualquier otro error inesperado (espacio de tabla, constraint, etc.)
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
  P_ID_USUARIO       IN NUMBER,       -- ID del usuario que solicita el cambio
  P_NUEVO_PLAN_NOMBRE IN VARCHAR2     -- Nombre del plan destino (ej. 'PREMIUM')
) IS
  -- Variable interna: ID del plan destino resuelto por nombre
  V_ID_NUEVO_PLAN    PLANES.ID_PLAN%TYPE;
  -- Variable interna: limite de perfiles permitido por el plan destino
  V_LIMITE_NUEVO     PLANES.LIMITE_PERFILES%TYPE;
  -- Variable interna: cantidad actual de perfiles del usuario
  V_PERFILES_ACTUALES NUMBER;
BEGIN
  -- Paso 1: resolver ID y limite del plan destino.
  -- UPPER() en ambos lados permite buscar sin importar mayusculas/minusculas.
  SELECT ID_PLAN, LIMITE_PERFILES
  INTO V_ID_NUEVO_PLAN, V_LIMITE_NUEVO
  FROM PLANES
  WHERE UPPER(NOMBRE) = UPPER(P_NUEVO_PLAN_NOMBRE);

  -- Paso 2: contar cuantos perfiles tiene el usuario actualmente.
  SELECT COUNT(*) INTO V_PERFILES_ACTUALES
  FROM PERFILES
  WHERE ID_USUARIO = P_ID_USUARIO;

  -- Paso 3: validar regla de negocio: los perfiles actuales deben caber en el nuevo plan.
  -- Si excede el limite, se rechaza la operacion antes de modificar datos.
  IF V_PERFILES_ACTUALES > V_LIMITE_NUEVO THEN
    RAISE_APPLICATION_ERROR(
      -20111,
      'El usuario tiene ' || V_PERFILES_ACTUALES ||
      ' perfiles y el plan ' || P_NUEVO_PLAN_NOMBRE ||
      ' solo permite ' || V_LIMITE_NUEVO ||
      '. Elimine perfiles antes de cambiar de plan.'
    );
  END IF;

  -- Paso 4: actualizar el plan del usuario y marcar fecha de modificacion.
  UPDATE USUARIOS
     SET ID_PLAN = V_ID_NUEVO_PLAN,
         FECHA_ACTUALIZACION = CURRENT_TIMESTAMP
   WHERE ID_USUARIO = P_ID_USUARIO;

  -- Paso 5: verificar que el UPDATE afecto exactamente 1 fila.
  -- Si afecto 0 filas, el usuario no existe.
  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(
      -20112,
      'No existe el usuario especificado para cambiar de plan'
    );
  END IF;

  -- Confirmar cambio de plan
  COMMIT;

  -- Confirmacion por consola para auditoria manual
  DBMS_OUTPUT.PUT_LINE(
    'Plan cambiado exitosamente para usuario ID: ' || P_ID_USUARIO ||
    ' al plan: ' || P_NUEVO_PLAN_NOMBRE
  );
EXCEPTION
  -- Si el plan destino no existe en la tabla PLANES
  WHEN NO_DATA_FOUND THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(
      -20113,
      'El plan especificado no existe'
    );
  -- Cualquier otro error (constraint, espacio, timeout)
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
  P_ID_USUARIO    IN NUMBER,   -- ID del usuario a facturar
  P_PERIODO_ANIO  IN NUMBER,   -- Anio del periodo de facturacion (ej. 2025)
  P_PERIODO_MES   IN NUMBER    -- Mes del periodo de facturacion (1-12)
) RETURN NUMBER
IS
  -- Precio mensual del plan actual del usuario (moneda local)
  V_MONTO_BASE          PLANES.PRECIO_MENSUAL%TYPE;
  -- Porcentaje acumulado de descuento por referidos (0-30)
  V_DESC_REF_PCT        NUMBER(5,2) := 0;
  -- Porcentaje de descuento por fidelidad/antiguedad (0, 10 o 15)
  V_DESC_FID_PCT        NUMBER(5,2) := 0;
  -- Antiguedad de la cuenta en meses desde la creacion
  V_MESES_ANTIGUEDAD    NUMBER;
  -- Resultado final redondeado a 2 decimales
  V_MONTO_FINAL         NUMBER(10,2);
BEGIN
  -- Paso 1: obtener precio base del plan actual del usuario.
  -- JOIN con PLANES para traer el precio mensual vigente.
  SELECT P.PRECIO_MENSUAL
    INTO V_MONTO_BASE
    FROM USUARIOS U
    JOIN PLANES P ON P.ID_PLAN = U.ID_PLAN
   WHERE U.ID_USUARIO = P_ID_USUARIO;

  -- Paso 2: calcular descuento por referidos validados.
  -- Solo suma DESCUENTO_PCT de referidos en estado 'VALIDADO'.
  -- COALESCE evita NULL si el usuario no tiene referidos.
  SELECT COALESCE(SUM(R.DESCUENTO_PCT), 0)
    INTO V_DESC_REF_PCT
    FROM REFERIDOS R
   WHERE R.ID_USUARIO_REFERENTE = P_ID_USUARIO
     AND R.ESTADO_REFERIDO = 'VALIDADO';

  -- Paso 3: cap de descuento por referidos al 30% maximo.
  -- LEAST(x, 30) retorna el valor menor entre x y 30.
  V_DESC_REF_PCT := LEAST(V_DESC_REF_PCT, 30);

  -- Paso 4: calcular antiguedad de la cuenta en meses.
  -- MONTHS_BETWEEN compara SYSDATE con la fecha de creacion del usuario.
  SELECT MONTHS_BETWEEN(SYSDATE, MIN(FECHA_CREACION))
    INTO V_MESES_ANTIGUEDAD
    FROM USUARIOS
   WHERE ID_USUARIO = P_ID_USUARIO;

  -- Paso 5: aplicar descuento por fidelidad segun antiguedad.
  -- >24 meses = 15% | >=12 meses = 10% | <12 meses = 0%
  IF V_MESES_ANTIGUEDAD >= 24 THEN
    V_DESC_FID_PCT := 15;
  ELSIF V_MESES_ANTIGUEDAD >= 12 THEN
    V_DESC_FID_PCT := 10;
  END IF;

  -- Paso 6: calcular monto final aplicando descuentos acumulados.
  -- LEAST(v_ref + v_fid, 100) garantiza que el descuento total no exceda 100%.
  -- ROUND(..., 2) redondea a 2 decimales para facturacion.
  V_MONTO_FINAL := ROUND(
    V_MONTO_BASE * (1 - LEAST(V_DESC_REF_PCT + V_DESC_FID_PCT, 100) / 100),
    2
  );

  RETURN V_MONTO_FINAL;
EXCEPTION
  -- Si el usuario no tiene plan asignado: retornar 0
  WHEN NO_DATA_FOUND THEN
    RETURN 0;
  -- Cualquier otro error inesperado: retornar -1 como senal de error
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
  P_ID_PERFIL IN NUMBER   -- ID del perfil de reproduccion que solicita recomendacion
) RETURN NUMBER
IS
  -- Variable de retorno: ID del contenido recomendado (NULL si no hay)
  V_ID_RECOMENDADO CONTENIDOS.ID_CONTENIDO%TYPE;
BEGIN
  -- Estrategia 1: recomendar contenido del mismo genero que los favoritos del perfil.
  -- Subconsulta interna: obtener generos de los favoritos del perfil.
  -- Filtrar contenidos que NO hayan sido reproducidos por este perfil.
  -- Ordenar por popularidad (cantidad de reproducciones global).
  -- ROWNUM = 1 retorna solo el mas popular que cumpla las condiciones.
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
        -- Generos asociados a los contenidos favoritos de este perfil
        SELECT CG2.ID_GENERO
        FROM FAVORITOS F
        JOIN CONTENIDOS_GENEROS CG2
          ON CG2.ID_CONTENIDO = F.ID_CONTENIDO
        WHERE F.ID_PERFIL = P_ID_PERFIL
      )
      -- Excluir contenidos que el perfil ya ha reproducido
      AND C.ID_CONTENIDO NOT IN (
        SELECT R.ID_CONTENIDO FROM REPRODUCCIONES R WHERE R.ID_PERFIL = P_ID_PERFIL
      )
      GROUP BY C.ID_CONTENIDO
      ORDER BY COUNT(R.ID_REPRODUCCION) DESC
    )
   WHERE ROWNUM = 1;

  RETURN V_ID_RECOMENDADO;
EXCEPTION
  -- Si el perfil no tiene favoritos o no hay contenidos del mismo genero no vistos
  WHEN NO_DATA_FOUND THEN
    -- Fallback: recomendar el contenido mas popular del catalogo que no haya visto
    BEGIN
      SELECT C.ID_CONTENIDO
        INTO V_ID_RECOMENDADO
        FROM CONTENIDOS C
        LEFT JOIN REPRODUCCIONES R
          ON R.ID_CONTENIDO = C.ID_CONTENIDO
       WHERE C.ID_CONTENIDO NOT IN (
         -- Excluir todo contenido ya reproducido por este perfil
         SELECT ID_CONTENIDO FROM REPRODUCCIONES WHERE ID_PERFIL = P_ID_PERFIL
       )
       GROUP BY C.ID_CONTENIDO
       ORDER BY COUNT(R.ID_REPRODUCCION) DESC
       FETCH FIRST 1 ROW ONLY;

      RETURN V_ID_RECOMENDADO;
    EXCEPTION
      -- Si el perfil ya ha visto todo el catalogo: no hay recomendacion
      WHEN NO_DATA_FOUND THEN
        RETURN NULL;
    END;
  -- Cualquier otro error inesperado: retornar NULL como senal de fallo
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
