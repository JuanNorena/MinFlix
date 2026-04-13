-- ============================================================================
-- MinFlix - Seed de Usuarios por Rol (Login de Aplicacion)
-- Ejecutar como owner de tablas (SYSTEM en entorno actual).
-- Requiere: scripts 01..12 aplicados.
-- Objetivo: crear o actualizar cuentas de login para todos los roles funcionales.
-- ============================================================================

DECLARE
  PROCEDURE UPSERT_USUARIO_ROL (
    P_NOMBRE         IN VARCHAR2,
    P_EMAIL          IN VARCHAR2,
    P_TELEFONO       IN VARCHAR2,
    P_FECHA_NAC      IN DATE,
    P_CIUDAD         IN VARCHAR2,
    P_PASSWORD_HASH  IN VARCHAR2,
    P_ROL            IN VARCHAR2,
    P_PLAN_NOMBRE    IN VARCHAR2,
    P_NOMBRE_PERFIL  IN VARCHAR2,
    P_TIPO_PERFIL    IN VARCHAR2
  )
  IS
    V_ID_USUARIO USUARIOS.ID_USUARIO%TYPE;
    V_ID_PLAN    PLANES.ID_PLAN%TYPE;
    V_PERFILES   NUMBER;
  BEGIN
    SELECT ID_PLAN
      INTO V_ID_PLAN
      FROM PLANES
     WHERE UPPER(NOMBRE) = UPPER(P_PLAN_NOMBRE);

    BEGIN
      SELECT ID_USUARIO
        INTO V_ID_USUARIO
        FROM USUARIOS
       WHERE UPPER(EMAIL) = UPPER(P_EMAIL);

      UPDATE USUARIOS
         SET NOMBRE = P_NOMBRE,
           TELEFONO = P_TELEFONO,
           FECHA_NACIMIENTO = P_FECHA_NAC,
           CIUDAD_RESIDENCIA = P_CIUDAD,
             PASSWORD_HASH = P_PASSWORD_HASH,
             ROL = LOWER(P_ROL),
             ESTADO_CUENTA = 'ACTIVO',
             ID_PLAN = V_ID_PLAN,
             FECHA_ACTUALIZACION = CURRENT_TIMESTAMP
       WHERE ID_USUARIO = V_ID_USUARIO;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        INSERT INTO USUARIOS (
          NOMBRE,
          EMAIL,
          TELEFONO,
          FECHA_NACIMIENTO,
          CIUDAD_RESIDENCIA,
          PASSWORD_HASH,
          ROL,
          ESTADO_CUENTA,
          ID_PLAN
        )
        VALUES (
          P_NOMBRE,
          LOWER(P_EMAIL),
          P_TELEFONO,
          P_FECHA_NAC,
          P_CIUDAD,
          P_PASSWORD_HASH,
          LOWER(P_ROL),
          'ACTIVO',
          V_ID_PLAN
        )
        RETURNING ID_USUARIO INTO V_ID_USUARIO;
    END;

    SELECT COUNT(*)
      INTO V_PERFILES
      FROM PERFILES
     WHERE ID_USUARIO = V_ID_USUARIO;

    IF V_PERFILES = 0 THEN
      INSERT INTO PERFILES (
        ID_USUARIO,
        NOMBRE,
        TIPO_PERFIL
      )
      VALUES (
        V_ID_USUARIO,
        P_NOMBRE_PERFIL,
        LOWER(P_TIPO_PERFIL)
      );
    END IF;
  END;
BEGIN
  -- Rol ADMIN
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Administrador Seed MinFlix',
    P_EMAIL => 'admin.seed@minflix.local',
    P_TELEFONO => '3001001001',
    P_FECHA_NAC => DATE '1988-02-14',
    P_CIUDAD => 'Bogota',
    P_PASSWORD_HASH => '$2b$12$9YOyzR8lA5IpG7fXbnJbjus609kMoQcKlPhKWlIdTT9kaTyiEdyHO',
    P_ROL => 'admin',
    P_PLAN_NOMBRE => 'PREMIUM',
    P_NOMBRE_PERFIL => 'Admin Principal',
    P_TIPO_PERFIL => 'adulto'
  );

  -- Rol SOPORTE
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Soporte Seed MinFlix',
    P_EMAIL => 'soporte.seed@minflix.local',
    P_TELEFONO => '3001001002',
    P_FECHA_NAC => DATE '1990-06-21',
    P_CIUDAD => 'Medellin',
    P_PASSWORD_HASH => '$2b$12$0OMoICYdJ2/AhFT1PSNth.wVG/CudeQo0e8SR2PFlHDu6ppPH4hR6',
    P_ROL => 'soporte',
    P_PLAN_NOMBRE => 'ESTANDAR',
    P_NOMBRE_PERFIL => 'Soporte Operativo',
    P_TIPO_PERFIL => 'adulto'
  );

  -- Rol CONTENIDO
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Contenido Seed MinFlix',
    P_EMAIL => 'contenido.seed@minflix.local',
    P_TELEFONO => '3001001003',
    P_FECHA_NAC => DATE '1992-09-03',
    P_CIUDAD => 'Cali',
    P_PASSWORD_HASH => '$2b$12$PCItDAzF3jT7.IV2IC2Fe.tCIJNs5YtJJ1YGCSpf/C94i3YEdHgSq',
    P_ROL => 'contenido',
    P_PLAN_NOMBRE => 'ESTANDAR',
    P_NOMBRE_PERFIL => 'Editor Catalogo',
    P_TIPO_PERFIL => 'adulto'
  );

  -- Rol ANALISTA
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Analista Seed MinFlix',
    P_EMAIL => 'analista.seed@minflix.local',
    P_TELEFONO => '3001001004',
    P_FECHA_NAC => DATE '1994-12-11',
    P_CIUDAD => 'Barranquilla',
    P_PASSWORD_HASH => '$2b$12$dz33nUH5jjgTfKYIoprZUeiz27v4Dbuk2yG/djxcjGkVumzRN09.G',
    P_ROL => 'analista',
    P_PLAN_NOMBRE => 'ESTANDAR',
    P_NOMBRE_PERFIL => 'Analista BI',
    P_TIPO_PERFIL => 'adulto'
  );

  -- Rol USUARIO
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Usuario Seed MinFlix',
    P_EMAIL => 'usuario.seed@minflix.local',
    P_TELEFONO => '3001001005',
    P_FECHA_NAC => DATE '1998-04-19',
    P_CIUDAD => 'Bucaramanga',
    P_PASSWORD_HASH => '$2b$12$d2eFssRciA2SIAxpDKqo.usdqL5Zvj9YlTPiXEXBywpo.ueOxqX2S',
    P_ROL => 'usuario',
    P_PLAN_NOMBRE => 'BASICO',
    P_NOMBRE_PERFIL => 'Usuario Demo',
    P_TIPO_PERFIL => 'adulto'
  );

  COMMIT;
END;
/

-- Consulta de verificacion sugerida:
-- SELECT ID_USUARIO, EMAIL, ROL, ESTADO_CUENTA FROM USUARIOS
-- WHERE EMAIL LIKE '%seed@minflix.local' ORDER BY EMAIL;
