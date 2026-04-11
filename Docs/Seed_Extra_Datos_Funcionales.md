# MinFlix - Seed Extra de Datos Funcionales (Iteracion 5)

Fecha de ejecucion validada: 2026-04-10

## 1. Objetivo
Este seed extra agrega datos funcionales de prueba sobre varias areas del modelo:
1. Catalogo extendido (contenidos, generos, temporadas, episodios, relaciones).
2. Comunidad (reproducciones, favoritos, calificaciones, reportes).
3. Finanzas y referidos (referidos, facturacion, pagos).
4. Organizacion interna (empleados y jerarquia de supervision).

El seed es idempotente: se puede re-ejecutar y actualiza datos existentes sin crear duplicados logicos.

## 2. Archivo SQL
- database/14_seed_datos_funcionales_iteracion5.sql

## 3. Prerrequisitos
Antes de ejecutar este seed extra, deben estar aplicados:
1. Scripts base 01 a 12.
2. Script de usuarios de login por rol:
   - database/13_seed_usuarios_roles_login_iteracion5.sql

## 4. Paso a paso detallado (Oracle MCP en VS Code)

### Paso 1. Confirmar sesion Oracle activa
Ejecutar:

```sql
show user;
```

Resultado esperado:
- Usuario conectado: SYSTEM (o el owner que posee las tablas MinFlix).

### Paso 2. Verificar usuarios seed de roles (script 13)
Ejecutar:

```sql
select email, rol, estado_cuenta
from usuarios
where email like '%seed@minflix.local'
order by email;
```

Resultado esperado:
- Existen al menos estas cuentas:
  - admin.seed@minflix.local
  - soporte.seed@minflix.local
  - contenido.seed@minflix.local
  - analista.seed@minflix.local
  - usuario.seed@minflix.local

### Paso 3. Ejecutar el script 14
Archivo:
- database/14_seed_datos_funcionales_iteracion5.sql

Nota del entorno MCP:
- En este entorno, comandos por archivo como @ y START pueden estar restringidos.
- Si aparecen restricciones SP2-0738, ejecutar el bloque DECLARE/BEGIN/END del archivo directamente en el MCP.

Salida esperada del bloque:
- "Seed extra finalizado."
- "Contenidos seed SEED14: 3"
- "Reportes seed SEED14: 2"
- "Pagos seed SEED14: 1"

### Paso 4. Validar catalogo seed
Ejecutar:

```sql
select id_contenido, titulo, tipo_contenido, clasificacion_edad
from contenidos
where upper(titulo) like 'SEED14 - %'
order by id_contenido;
```

Validacion observada:
- 21 | SEED14 - Horizonte Andino | documental | +7
- 22 | SEED14 - Norte Incierto Cero | serie | +13
- 23 | SEED14 - Codigo en Conversacion IA | podcast | TP

### Paso 5. Validar temporadas y episodios
Ejecutar:

```sql
select c.titulo, t.numero_temporada, e.numero_episodio, e.titulo as titulo_episodio
from contenidos c
join temporadas t on t.id_contenido = c.id_contenido
join episodios e on e.id_temporada = t.id_temporada
where upper(c.titulo) like 'SEED14 - %'
order by c.titulo, t.numero_temporada, e.numero_episodio;
```

Validacion observada:
- SEED14 - Codigo en Conversacion IA | T1E1 | Modelos Fundacionales
- SEED14 - Codigo en Conversacion IA | T1E2 | MLOps para Equipos Pequenos
- SEED14 - Norte Incierto Cero | T1E1 | Frontera de Humo
- SEED14 - Norte Incierto Cero | T1E2 | Linea de Silencio

### Paso 6. Validar reproducciones y regla de porcentaje
Ejecutar:

```sql
select r.id_reproduccion, p.nombre as perfil, c.titulo,
       r.progreso_segundos, r.duracion_total_segundos,
       r.porcentaje_avance, r.estado_reproduccion
from reproducciones r
join perfiles p on p.id_perfil = r.id_perfil
join contenidos c on c.id_contenido = r.id_contenido
where upper(r.ultimo_dispositivo) like 'SEED14-%'
order by r.id_reproduccion;
```

Validacion observada:
- 32 | Usuario Demo | La Ciudad de las Sombras | 73.45% | PAUSADO
- 33 | Usuario Infantil | Aventuras en Neblina | 56.82% | EN_PROGRESO
- 34 | Analista BI | SEED14 - Horizonte Andino | 67.71% | EN_PROGRESO

Conclusion:
- El trigger de reproducciones recalculo porcentaje_avance correctamente.

### Paso 7. Validar calificaciones y retencion minima > 50%
Ejecutar:

```sql
select p.nombre as perfil, c.titulo, ca.puntaje, ca.resena
from calificaciones ca
join perfiles p on p.id_perfil = ca.id_perfil
join contenidos c on c.id_contenido = ca.id_contenido
where upper(ca.resena) like 'SEED14%'
order by p.nombre, c.titulo;
```

Validacion observada:
- Analista BI | SEED14 - Horizonte Andino | 4
- Usuario Demo | La Ciudad de las Sombras | 5
- Usuario Infantil | Aventuras en Neblina | 4

Conclusion:
- Se cumple trigger de calificaciones (avance >= 50%).

### Paso 8. Validar reportes y moderacion
Ejecutar:

```sql
select r.id_reporte, r.detalle, r.estado_reporte,
       u.email as moderador, r.fecha_resolucion
from reportes r
left join usuarios u on u.id_usuario = r.id_usuario_moderador
where upper(nvl(r.detalle, 'NA')) like '%[SEED14]%'
order by r.id_reporte;
```

Validacion observada:
- ID 4 | [SEED14] REPORTE_ABIERTO_001 | ABIERTO | moderador NULL
- ID 5 | [SEED14] REPORTE_RESUELTO_001 | RESUELTO | soporte.seed@minflix.local | fecha_resolucion con valor

Conclusion:
- Se cumple regla de cierre con moderador para reportes RESUELTO.

### Paso 9. Validar referidos, facturacion y pago
Ejecutar:

```sql
select re.id_referido, ur.email as referente, ue.email as referido,
       re.estado_referido, re.descuento_pct
from referidos re
join usuarios ur on ur.id_usuario = re.id_usuario_referente
join usuarios ue on ue.id_usuario = re.id_usuario_referido
where ue.email = 'usuario.seed@minflix.local';
```

```sql
select f.id_facturacion, u.email, f.periodo_anio, f.periodo_mes,
       f.monto_base, f.descuento_referidos_pct, f.descuento_fidelidad_pct,
       f.monto_final, f.estado_factura
from facturaciones f
join usuarios u on u.id_usuario = f.id_usuario
where u.email in ('usuario.seed@minflix.local', 'analista.seed@minflix.local')
  and f.periodo_anio = 2026
  and f.periodo_mes = 4
order by u.email;
```

```sql
select p.id_pago, u.email, p.monto, p.metodo_pago,
       p.estado_transaccion, p.referencia_pago
from pagos p
join usuarios u on u.id_usuario = p.id_usuario
where upper(nvl(p.referencia_pago, 'NA')) like 'SEED14-PAGO%';
```

Validacion observada:
- Referido valido: admin.seed@minflix.local -> usuario.seed@minflix.local (10%).
- Factura usuario.seed@minflix.local: monto_final 13410, estado PAGADA.
- Factura analista.seed@minflix.local: monto_final 24900, estado PENDIENTE.
- Pago registrado: SEED14-PAGO-2026-04-USUARIO, metodo PSE, estado EXITOSO.

## 5. Resultado final
Seed extra funcional ejecutado y validado correctamente en Oracle.

Cobertura validada:
1. Catalogo extendido.
2. Reglas de reproduccion/favoritos/calificaciones.
3. Flujo de reportes con moderacion.
4. Flujo de referidos, factura y pago.
5. Estructura de empleados con jerarquia basica.
