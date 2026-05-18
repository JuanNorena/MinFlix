-- ============================================================================
-- MinFlix - Iteracion 7: Roles robustos M:N + PK compuesta FAVORITOS
-- Ejecutar como MINFLIX_APP después de 01_bootstrap... y 18_plsql...
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Nueva tabla ROLES_USUARIOS (M:N)
-- Permite múltiples roles por usuario sin duplicar datos en USUARIOS.
-- --------------------------------------------------------------------------
CREATE TABLE ROLES_USUARIOS (
  ID_USUARIO       NUMBER NOT NULL,
  ROL              VARCHAR2(30) NOT NULL,
  FECHA_ASIGNACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT PK_ROLES_USUARIOS PRIMARY KEY (ID_USUARIO, ROL),
  CONSTRAINT FK_ROLES_USUARIOS_USUARIO FOREIGN KEY (ID_USUARIO)
    REFERENCES USUARIOS(ID_USUARIO) ON DELETE CASCADE,
  CONSTRAINT CK_ROLES_USUARIOS_ROL CHECK (ROL IN ('admin','soporte','contenido','analista','usuario'))
);

CREATE INDEX IDX_ROLES_USUARIOS_ROL ON ROLES_USUARIOS(ROL);

-- Migrar roles existentes desde USUARIOS.ROL (una sola vez)
INSERT INTO ROLES_USUARIOS (ID_USUARIO, ROL)
SELECT ID_USUARIO, ROL FROM USUARIOS WHERE ROL IS NOT NULL;

COMMIT;

-- --------------------------------------------------------------------------
-- 2. Eliminar columna ROL de USUARIOS (idempotente)
-- --------------------------------------------------------------------------
DECLARE
  V_EXISTE NUMBER := 0;
BEGIN
  SELECT COUNT(*) INTO V_EXISTE
  FROM USER_TAB_COLUMNS
  WHERE TABLE_NAME = 'USUARIOS' AND COLUMN_NAME = 'ROL';

  IF V_EXISTE = 1 THEN
    -- Eliminar constraint de chequeo primero
    BEGIN
      EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS DROP CONSTRAINT CK_USUARIOS_ROL';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    EXECUTE IMMEDIATE 'ALTER TABLE USUARIOS DROP COLUMN ROL';
  END IF;
END;
/

-- --------------------------------------------------------------------------
-- 3. Refactor FAVORITOS: eliminar ID_FAVORITO, convertir UK en PK compuesta
-- --------------------------------------------------------------------------
-- Paso 3.1: eliminar trigger dependiente
DROP TRIGGER TRG_FAVORITOS_REGLAS_BI;

-- Paso 3.2: eliminar índice y constraints
DROP INDEX IDX_FAVORITOS_PERFIL_FECHA;
ALTER TABLE FAVORITOS DROP CONSTRAINT UK_FAVORITOS_PERFIL_CONTENIDO;
ALTER TABLE FAVORITOS DROP CONSTRAINT FK_FAVORITOS_PERFIL;
ALTER TABLE FAVORITOS DROP CONSTRAINT FK_FAVORITOS_CONTENIDO;

-- Paso 3.3: eliminar columna PK antigua
ALTER TABLE FAVORITOS DROP COLUMN ID_FAVORITO;

-- Paso 3.4: crear nueva estructura con PK compuesta
ALTER TABLE FAVORITOS ADD (
  CONSTRAINT PK_FAVORITOS PRIMARY KEY (ID_PERFIL, ID_CONTENIDO),
  CONSTRAINT FK_FAVORITOS_PERFIL FOREIGN KEY (ID_PERFIL)
    REFERENCES PERFILES(ID_PERFIL) ON DELETE CASCADE,
  CONSTRAINT FK_FAVORITOS_CONTENIDO FOREIGN KEY (ID_CONTENIDO)
    REFERENCES CONTENIDOS(ID_CONTENIDO) ON DELETE CASCADE
);

-- Paso 3.5: recrear índice de soporte
CREATE INDEX IDX_FAVORITOS_PERFIL_FECHA
  ON FAVORITOS (ID_PERFIL, FECHA_ADICION DESC);

-- Paso 3.6: recrear trigger (ya no usa ID_FAVORITO)
CREATE OR REPLACE TRIGGER TRG_FAVORITOS_REGLAS_BI
BEFORE INSERT ON FAVORITOS
FOR EACH ROW
DECLARE
  V_TIPO_PERFIL   PERFILES.TIPO_PERFIL%TYPE;
  V_CLASIFICACION CONTENIDOS.CLASIFICACION_EDAD%TYPE;
BEGIN
  SELECT P.TIPO_PERFIL, C.CLASIFICACION_EDAD
    INTO V_TIPO_PERFIL, V_CLASIFICACION
    FROM PERFILES P
    INNER JOIN CONTENIDOS C ON C.ID_CONTENIDO = :NEW.ID_CONTENIDO
   WHERE P.ID_PERFIL = :NEW.ID_PERFIL;

  IF FN_CLASIFICACION_PERMITIDA_PARA_PERFIL(V_TIPO_PERFIL, V_CLASIFICACION) = 0 THEN
    RAISE_APPLICATION_ERROR(-20031, 'El perfil seleccionado no puede agregar este contenido a favoritos');
  END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20032, 'No existe el perfil o contenido asociado para registrar favorito');
END;
/

COMMIT;
