# MinFlix - Arquitectura de Base de Datos (Oracle)

![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

Este directorio contiene el núcleo del proyecto MinFlix. Dado que este es un proyecto de grado enfocado en **Bases de Datos**, la arquitectura está diseñada bajo el paradigma de **Fat Database** (Base de datos robusta), donde la base de datos no es solo un repositorio de persistencia, sino el motor principal que garantiza la integridad, seguridad y reglas de negocio del sistema.

---

## 🎯 Enfoque Técnico y Justificación

A diferencia de las arquitecturas modernas donde el backend asume toda la lógica, en MinFlix el esquema de Oracle es el guardián absoluto de los datos. Se ha implementado un uso intensivo de **PL/SQL** para garantizar que ninguna aplicación externa pueda corromper el estado del negocio.

### Características Clave Implementadas:

1. **Lógica de Negocio Centralizada (PL/SQL)**:
   - Uso extensivo de **Procedimientos Almacenados (Stored Procedures)** y **Funciones** para operaciones transaccionales complejas (ej. facturación mensual, creación de perfiles).
   - **Manejo de Excepciones** avanzado en PL/SQL para capturar y auditar errores de concurrencia o violaciones de reglas de negocio antes de que lleguen al backend.

2. **Integridad Activa (Triggers)**:
   - **Triggers Before/After Insert/Update**: Validaciones complejas que no se pueden cubrir con simples `CHECK constraints`. Por ejemplo: validación de límites de perfiles según el plan de suscripción del usuario, encriptación de contraseñas (`bcrypt` simulado/delegado), y auditoría de cambios.

3. **Optimización y Rendimiento**:
   - **Vistas Materializadas (Materialized Views)**: Utilizadas intensivamente en el módulo de *Analítica* y *Finanzas* para precalcular métricas ejecutivas pesadas (ingresos mensuales, reproducciones por género) y reducir la carga de CPU en consultas en tiempo real.
   - **Estrategias de Indexación**: Creación de índices B-Tree y Bitmap (si aplica) en columnas de alta concurrencia (ej. búsquedas del catálogo, historiales de reproducción).
   - **Particionamiento de Tablas**: Diseño pensado para tablas de crecimiento masivo (como el tracking de reproducciones) particionadas por rangos de fecha para optimizar el particionado y purgado de datos.

4. **Concurrencia y Transaccionalidad**:
   - Gestión explícita de transacciones (`COMMIT`, `ROLLBACK`).
   - Uso de cursores (`CURSORS`) explícitos e implícitos para procesamiento por lotes dentro de la base de datos (ej. rutinas de cierre financiero).

5. **Seguridad**:
   - Modelo de privilegios basado en **Roles**.
   - Vistas de seguridad para limitar el acceso directo a las tablas base.

---

## Estructura de Scripts y Versionamiento

El despliegue de la base de datos está estrictamente versionado para simular un pipeline de CI/CD de bases de datos. Los scripts deben ejecutarse en orden del `01` al `21`.

### Fases de Despliegue:
- **`01` a `02`**: Bootstrap y Catálogo Base (DDL principal).
- **`03` a `10`**: Reglas de negocio progresivas (Perfiles, Reproducciones, Comunidad, Finanzas).
- **`11`**: Seguridad y Roles.
- **`12`**: Diccionario de datos y comentarios del modelo físico.
- **`13` a `14`**: Datos Semilla (Seeders) para probar el sistema inmediatamente.
- **`15` a `16`**: Vistas para consumo de API.
- **`17` a `20`**: Objetos Avanzados (Vistas materializadas, PL/SQL avanzado, Índices, Transacciones).
- **`21`**: Script de validación de cierre (Verificación de integridad).

---

## 🚀 Guía de Ejecución

Para inicializar la base de datos desde cero:

1. Asegúrate de tener conexión a tu instancia de Oracle (19c recomendado) con un usuario con privilegios de DBA o privilegios suficientes para crear usuarios/esquemas.
2. Abre tu terminal de SQL*Plus o SQLcl en este directorio (`database/`).
3. Ejecuta el script maestro:
   ```sql
   @run_all.sql
   ```
4. Revisa los logs en consola para confirmar que no hay errores de compilación (`PL/SQL procedure successfully completed`).

> **Peligro**: El script `00_drop_all.sql` elimina todo el esquema. Úsalo solo en entornos de desarrollo para reiniciar las pruebas.
