-- ============================================================================
-- MinFlix - Iteracion 1 (Reglas de Perfiles)
-- Ejecutar como owner de tablas (SYSTEM en entorno actual).
-- Requiere: 01_bootstrap_oracle_iteracion1.sql y 02_catalogo_base_iteracion2.sql
-- ============================================================================

-- --------------------------------------------------------------------------
-- Regla 1: limite de perfiles por plan en base de datos.
-- --------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_PERFILES_LIMITE_PLAN_BI
BEFORE INSERT ON PERFILES
FOR EACH ROW
DECLARE
  V_LIMITE PLANES.LIMITE_PERFILES%TYPE;
  V_ACTUALES NUMBER;
BEGIN
  SELECT NVL(P.LIMITE_PERFILES, 1)
    INTO V_LIMITE
    FROM USUARIOS U
    LEFT JOIN PLANES P ON P.ID_PLAN = U.ID_PLAN
   WHERE U.ID_USUARIO = :NEW.ID_USUARIO;

  SELECT COUNT(*)
    INTO V_ACTUALES
    FROM PERFILES PR
   WHERE PR.ID_USUARIO = :NEW.ID_USUARIO;

  IF V_ACTUALES >= V_LIMITE THEN
    RAISE_APPLICATION_ERROR(
      -20011,
      'La cuenta supera el limite de perfiles permitido por su plan'
    );
  END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(
      -20012,
      'No existe la cuenta asociada para crear el perfil'
    );
END;
/

-- --------------------------------------------------------------------------
-- Regla 2: clasificacion permitida para perfil infantil (regla reutilizable).
-- Devuelve 1 cuando el perfil puede consumir la clasificacion recibida.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_CLASIFICACION_PERMITIDA_PARA_PERFIL (
  P_TIPO_PERFIL IN VARCHAR2,
  P_CLASIFICACION_EDAD IN VARCHAR2
) RETURN NUMBER
IS
  V_TIPO_PERFIL VARCHAR2(20) := LOWER(TRIM(NVL(P_TIPO_PERFIL, 'adulto')));
  V_CLASIFICACION VARCHAR2(10) := UPPER(TRIM(NVL(P_CLASIFICACION_EDAD, 'TP')));
BEGIN
  IF V_TIPO_PERFIL = 'infantil' AND V_CLASIFICACION IN ('+16', '+18') THEN
    RETURN 0;
  END IF;

  RETURN 1;
END;
/

-- --------------------------------------------------------------------------
-- Vista de apoyo para listar contenido visible por perfil segun clasificacion.
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_CONTENIDO_VISIBLE_POR_PERFIL AS
SELECT
  P.ID_PERFIL,
  P.ID_USUARIO,
  P.NOMBRE AS NOMBRE_PERFIL,
  P.TIPO_PERFIL,
  C.ID_CONTENIDO,
  C.TITULO,
  C.CLASIFICACION_EDAD,
  C.TIPO_CONTENIDO,
  C.ID_CATEGORIA,
  C.ES_EXCLUSIVO,
  C.FECHA_ADICION
FROM PERFILES P
INNER JOIN CONTENIDOS C
  ON FN_CLASIFICACION_PERMITIDA_PARA_PERFIL(
       P.TIPO_PERFIL,
       C.CLASIFICACION_EDAD
     ) = 1;

COMMIT;
