# MinFlix - Seed de Credenciales por Rol (Oracle MCP)

Fecha: 2026-04-10

## 1. Objetivo
Este documento deja trazabilidad completa del seed de cuentas de aplicacion por rol, ejecutado contra Oracle usando el MCP de SQLcl en VS Code.

Incluye:
- Usuarios de login para todos los roles funcionales de MinFlix.
- Credenciales (correo y contrasena) para pruebas de inicio de sesion.
- Pasos detallados para repetir la ejecucion y validar resultados.

## 2. Archivo de Seed
Script creado en el proyecto:
- database/13_seed_usuarios_roles_login_iteracion5.sql

Caracteristicas del script:
- Idempotente: si el correo ya existe, actualiza datos y hash de contrasena.
- Si el correo no existe, inserta la cuenta.
- Garantiza al menos 1 perfil por cuenta seeded.
- Deja la cuenta en estado ACTIVO.

## 3. Credenciales de Login por Rol (Aplicacion)
Estas son cuentas de USUARIOS para autenticarse en la API/web de MinFlix.

| Rol | Correo | Contrasena | Plan | Perfil Inicial |
|---|---|---|---|---|
| admin | admin.seed@minflix.local | Admin123* | PREMIUM | Admin Principal |
| soporte | soporte.seed@minflix.local | Soporte123* | ESTANDAR | Soporte Operativo |
| contenido | contenido.seed@minflix.local | Contenido123* | ESTANDAR | Editor Catalogo |
| analista | analista.seed@minflix.local | Analista123* | ESTANDAR | Analista BI |
| usuario | usuario.seed@minflix.local | Usuario123* | BASICO | Usuario Demo |

## 4. Paso a Paso Detallado (VS Code + MCP Oracle)
### Paso 1: Verificar conexion activa en MCP
En el chat de VS Code con el MCP SQLcl, ejecutar:

```sql
select user from dual;
```

Resultado esperado:
- Usuario conectado: SYSTEM (o el owner equivalente con permisos sobre tablas MinFlix).

### Paso 2: Ejecutar el seed
Ejecutar el contenido del script de seed.

Nota importante:
- En este entorno MCP, el comando de ejecucion por archivo con @ puede estar restringido.
- Si eso ocurre, copiar y ejecutar el bloque SQL del archivo en linea desde el MCP.

Archivo fuente:
- database/13_seed_usuarios_roles_login_iteracion5.sql

### Paso 3: Validar usuarios creados/actualizados
Ejecutar:

```sql
select id_usuario, email, rol, estado_cuenta
from usuarios
where email like '%seed@minflix.local'
order by email;
```

Resultado esperado:
- 5 filas (admin, soporte, contenido, analista, usuario).
- Estado ACTIVO en todas.

### Paso 4: Validar perfiles asociados
Ejecutar:

```sql
select p.id_perfil, p.id_usuario, u.email, p.nombre, p.tipo_perfil
from perfiles p
join usuarios u on u.id_usuario = p.id_usuario
where u.email like '%seed@minflix.local'
order by u.email;
```

Resultado esperado:
- 5 filas, un perfil por cada cuenta seeded.
- Tipo de perfil adulto.

### Paso 5: Probar login de cada rol
Usar la API de autenticacion (backend en ejecucion):

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin.seed@minflix.local",
  "password": "Admin123*"
}
```

Repetir para cada correo del cuadro de credenciales.

Resultado esperado:
- accessToken valido.
- payload del usuario con rol correspondiente.

## 5. Evidencia de ejecucion real en Oracle (MCP)
En la ejecucion del seed por MCP se validaron estas filas:

- admin.seed@minflix.local (rol admin, id_usuario 21)
- soporte.seed@minflix.local (rol soporte, id_usuario 22)
- contenido.seed@minflix.local (rol contenido, id_usuario 23)
- analista.seed@minflix.local (rol analista, id_usuario 24)
- usuario.seed@minflix.local (rol usuario, id_usuario 25)

Y perfiles:
- Admin Principal, Soporte Operativo, Editor Catalogo, Analista BI, Usuario Demo.

## 6. Seguridad (importante)
Estas credenciales son solo para entorno academico/local.

Antes de despliegue real:
- Rotar todas las contrasenas.
- Mover secretos a variables de entorno/secret manager.
- Evitar publicar este archivo fuera del entorno controlado del equipo.
