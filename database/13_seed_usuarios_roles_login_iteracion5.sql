-- ============================================================================
-- MinFlix - Seed de Usuarios por Rol (Login de Aplicacion)
-- Ejecutar como owner de tablas (SYSTEM en entorno actual).
-- Requiere: scripts 01..12 aplicados.
-- Objetivo: crear o actualizar cuentas de login para todos los roles funcionales.
-- ============================================================================

DECLARE
  -- ------------------------------------------------------------------------
  -- Procedimiento UPSERT_USUARIO_ROL
  -- 1) Resuelve el plan por nombre.
  -- 2) Si el email existe, actualiza datos, rol y plan.
  -- 3) Si no existe, inserta el usuario.
  -- 4) Garantiza al menos 1 perfil por cuenta.
  -- ------------------------------------------------------------------------
  PROCEDURE UPSERT_USUARIO_ROL (
    P_NOMBRE         IN VARCHAR2,      -- Nombre completo del usuario (ej: 'Administrador Seed MinFlix')
    P_EMAIL          IN VARCHAR2,      -- Email de login, case-insensitive, almacenado en minusculas
    P_TELEFONO       IN VARCHAR2,      -- Numero de telefono del usuario
    P_FECHA_NAC      IN DATE,          -- Fecha de nacimiento (usado para control parental)
    P_CIUDAD         IN VARCHAR2,      -- Ciudad de residencia para analitica geografica
    P_PASSWORD_HASH  IN VARCHAR2,      -- Hash bcrypt de la contrasena (generado por backend)
    P_ROL            IN VARCHAR2,      -- Rol funcional: admin|soporte|contenido|analista|usuario
    P_PLAN_NOMBRE    IN VARCHAR2,      -- Nombre del plan: BASICO|ESTANDAR|PREMIUM
    P_NOMBRE_PERFIL  IN VARCHAR2,      -- Nombre del perfil a crear (ej: 'Admin Principal')
    P_TIPO_PERFIL    IN VARCHAR2       -- Tipo de perfil: adulto|infantil (para control parental)
  )
  IS
    V_ID_USUARIO USUARIOS.ID_USUARIO%TYPE;      -- ID resuelto del usuario
    V_ID_PLAN    PLANES.ID_PLAN%TYPE;           -- ID del plan para asignar al usuario
    V_PERFILES   NUMBER;                         -- Contador para validar si existen perfiles
  BEGIN
    -- Resolver el ID del plan por nombre.
    SELECT ID_PLAN
      INTO V_ID_PLAN
      FROM PLANES
     WHERE UPPER(NOMBRE) = UPPER(P_PLAN_NOMBRE);

    BEGIN
      -- Buscar usuario por email (case-insensitive).
      SELECT ID_USUARIO
        INTO V_ID_USUARIO
        FROM USUARIOS
       WHERE UPPER(EMAIL) = UPPER(P_EMAIL);

      -- Si existe, actualizar datos personales, rol y plan.
      UPDATE USUARIOS
         SET NOMBRE = P_NOMBRE,                                   -- Actualizar nombre
             TELEFONO = P_TELEFONO,                               -- Actualizar telefono
             FECHA_NACIMIENTO = P_FECHA_NAC,                      -- Actualizar fecha nacimiento
             CIUDAD_RESIDENCIA = P_CIUDAD,                        -- Actualizar ciudad
             PASSWORD_HASH = P_PASSWORD_HASH,                     -- Actualizar hash password
             ROL = LOWER(P_ROL),                                  -- Normalizar rol a minusculas
             ESTADO_CUENTA = 'ACTIVO',                            -- Reactivar si estaba suspendido
             ID_PLAN = V_ID_PLAN,                                 -- Cambiar plan
             FECHA_ACTUALIZACION = CURRENT_TIMESTAMP              -- Marcar como modificado
       WHERE ID_USUARIO = V_ID_USUARIO;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        INSERT INTO USUARIOS (
          NOMBRE,                          -- Nombre completo
          EMAIL,                           -- Email de login (normalizando a minusculas)
          TELEFONO,                        -- Telefono del usuario
          FECHA_NACIMIENTO,                -- Fecha nacimiento
          CIUDAD_RESIDENCIA,               -- Ciudad de residencia
          PASSWORD_HASH,                   -- Hash bcrypt de password
          ROL,                             -- Rol en el sistema
          ESTADO_CUENTA,                   -- Estado inicial: ACTIVO
          ID_PLAN                          -- Plan inicial
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

    -- Validar si ya existe un perfil para la cuenta.
    SELECT COUNT(*)
      INTO V_PERFILES
      FROM PERFILES
     WHERE ID_USUARIO = V_ID_USUARIO;

    -- Insertar perfil inicial si no hay perfiles registrados.
    IF V_PERFILES = 0 THEN
      INSERT INTO PERFILES (
        ID_USUARIO,                        -- FK: usuario propietario del perfil
        NOMBRE,                            -- Nombre descriptivo del perfil
        TIPO_PERFIL                        -- adulto|infantil para control parental
      )
      VALUES (
        V_ID_USUARIO,
        P_NOMBRE_PERFIL,
        LOWER(P_TIPO_PERFIL)
      );
    END IF;
  END;
BEGIN
  -- Rol ADMIN: Administrador del sistema con acceso completo a todas las funcionalidades
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Administrador Seed MinFlix',     -- Nombre completo
    P_EMAIL => 'admin.seed@minflix.local',        -- Email unico para acceso
    P_TELEFONO => '3001001001',                   -- Telefono de contacto
    P_FECHA_NAC => DATE '1988-02-14',             -- Fecha nacimiento
    P_CIUDAD => 'Bogota',                         -- Ciudad de residencia
    P_PASSWORD_HASH => '$2b$12$9YOyzR8lA5IpG7fXbnJbjus609kMoQcKlPhKWlIdTT9kaTyiEdyHO', -- bcrypt hash
    P_ROL => 'admin',                             -- Rol funcional: acceso operativo amplio
    P_PLAN_NOMBRE => 'PREMIUM',                   -- Plan: acceso a todo contenido
    P_NOMBRE_PERFIL => 'Admin Principal',         -- Perfil principal
    P_TIPO_PERFIL => 'adulto'                     -- Tipo de perfil
  );

  -- Rol SOPORTE: Agente de soporte para moderacion de reportes
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Soporte Seed MinFlix',           -- Nombre completo
    P_EMAIL => 'soporte.seed@minflix.local',      -- Email unico
    P_TELEFONO => '3001001002',                   -- Telefono contacto
    P_FECHA_NAC => DATE '1990-06-21',             -- Fecha nacimiento
    P_CIUDAD => 'Medellin',                       -- Ciudad de residencia
    P_PASSWORD_HASH => '$2b$12$0OMoICYdJ2/AhFT1PSNth.wVG/CudeQo0e8SR2PFlHDu6ppPH4hR6', -- bcrypt hash
    P_ROL => 'soporte',                           -- Rol funcional: manejo de reportes
    P_PLAN_NOMBRE => 'ESTANDAR',                  -- Plan: acceso operativo
    P_NOMBRE_PERFIL => 'Soporte Operativo',       -- Perfil de trabajo
    P_TIPO_PERFIL => 'adulto'                     -- Tipo de perfil
  );

  -- Rol CONTENIDO: Editor de catalogo para publicar y mantener contenidos
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Contenido Seed MinFlix',         -- Nombre completo
    P_EMAIL => 'contenido.seed@minflix.local',    -- Email unico
    P_TELEFONO => '3001001003',                   -- Telefono contacto
    P_FECHA_NAC => DATE '1992-09-03',             -- Fecha nacimiento
    P_CIUDAD => 'Cali',                           -- Ciudad de residencia
    P_PASSWORD_HASH => '$2b$12$PCItDAzF3jT7.IV2IC2Fe.tCIJNs5YtJJ1YGCSpf/C94i3YEdHgSq', -- bcrypt hash
    P_ROL => 'contenido',                         -- Rol funcional: edicion de catalogo
    P_PLAN_NOMBRE => 'ESTANDAR',                  -- Plan: acceso operativo
    P_NOMBRE_PERFIL => 'Editor Catalogo',         -- Perfil editorial
    P_TIPO_PERFIL => 'adulto'                     -- Tipo de perfil
  );

  -- Rol ANALISTA: Analista de datos para reportes y estadisticas (solo lectura)
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Analista Seed MinFlix',          -- Nombre completo
    P_EMAIL => 'analista.seed@minflix.local',     -- Email unico
    P_TELEFONO => '3001001004',                   -- Telefono contacto
    P_FECHA_NAC => DATE '1994-12-11',             -- Fecha nacimiento
    P_CIUDAD => 'Barranquilla',                   -- Ciudad de residencia
    P_PASSWORD_HASH => '$2b$12$dz33nUH5jjgTfKYIoprZUeiz27v4Dbuk2yG/djxcjGkVumzRN09.G', -- bcrypt hash
    P_ROL => 'analista',                          -- Rol funcional: solo lectura para analitica
    P_PLAN_NOMBRE => 'ESTANDAR',                  -- Plan: acceso operativo
    P_NOMBRE_PERFIL => 'Analista BI',             -- Perfil para reportes
    P_TIPO_PERFIL => 'adulto'                     -- Tipo de perfil
  );

  -- Rol USUARIO: Usuario regular de la plataforma (consumidor de contenidos)
  UPSERT_USUARIO_ROL(
    P_NOMBRE => 'Usuario Seed MinFlix',           -- Nombre completo
    P_EMAIL => 'usuario.seed@minflix.local',      -- Email unico
    P_TELEFONO => '3001001005',                   -- Telefono contacto
    P_FECHA_NAC => DATE '1998-04-19',             -- Fecha nacimiento
    P_CIUDAD => 'Bucaramanga',                    -- Ciudad de residencia
    P_PASSWORD_HASH => '$2b$12$d2eFssRciA2SIAxpDKqo.usdqL5Zvj9YlTPiXEXBywpo.ueOxqX2S', -- bcrypt hash
    P_ROL => 'usuario',                           -- Rol funcional: consumidor de contenido
    P_PLAN_NOMBRE => 'BASICO',                    -- Plan: acceso limitado
    P_NOMBRE_PERFIL => 'Usuario Demo',            -- Perfil personal
    P_TIPO_PERFIL => 'adulto'                     -- Tipo de perfil
  );

  -- Commit explicito para persistir cambios del seed.
  COMMIT;
END;
/

-- Consulta de verificacion sugerida:
-- SELECT ID_USUARIO, EMAIL, ROL, ESTADO_CUENTA FROM USUARIOS
-- WHERE EMAIL LIKE '%seed@minflix.local' ORDER BY EMAIL;
