# ⚙️ MinFlix - Backend (NestJS)

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Este directorio contiene la API RESTful de MinFlix, construida con **NestJS**. Actúa como el puente orquestador entre el cliente web (React) y nuestro robusto motor de base de datos (Oracle).

---

## 🏛️ Arquitectura y Rol en el Proyecto

Dado que la arquitectura de MinFlix está orientada a bases de datos (donde Oracle maneja la lógica de negocio fuerte mediante PL/SQL, Triggers y Constraints), el rol de este backend está enfocado en:

1. **Orquestación y Enrutamiento**: Exponer endpoints REST limpios (`/api/v1/...`) para que el frontend los consuma.
2. **Seguridad Perimetral**:
   - Gestión de sesiones estáticas y sin estado mediante **JWT (JSON Web Tokens)**.
   - Implementación de **Passport.js** para estrategias de autenticación (Local y JWT).
   - Sanitización de entradas (Helmet, Class-Validator) antes de enviarlas a Oracle para evitar inyecciones.
3. **Delegación de Responsabilidades a Oracle**:
   - El backend **no** calcula métricas financieras complejas ni cruza datos analíticos masivos en memoria (Node.js). En su lugar, invoca **Procedimientos Almacenados**, funciones o consulta **Vistas Materializadas** directamente en Oracle.
   - Los errores de integridad (ej. "Límite de perfiles alcanzado") son capturados desde las excepciones generadas por Oracle (ORA-XXXXX) y mapeados a respuestas HTTP semánticas (400 Bad Request, 409 Conflict).

---

## 🛠️ Tecnologías Principales

- **Framework**: NestJS (Arquitectura modular: Controllers, Services, Guards).
- **Lenguaje**: TypeScript (Tipado estricto alineado con el modelo de DB).
- **Conexión a BD**: `oracledb` (Driver nativo) y `TypeORM` para mapeo de entidades sencillas, combinando Raw SQL para llamadas a PL/SQL.
- **Validación**: `class-validator`, `class-transformer` (DTOs).
- **Documentación**: Swagger / OpenAPI integrado automáticamente.

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
- Node.js v18 o superior.
- Base de datos Oracle ejecutándose con el esquema de MinFlix cargado (ver `database/README.md`).

### Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Copia el archivo de ejemplo y configura tu conexión a Oracle:
   ```bash
   cp .env.example .env
   ```
   *Asegúrate de que `DB_USER`, `DB_PASSWORD` y `DB_CONNECTION_STRING` apunten a tu esquema local.*

3. **Ejecutar en Desarrollo**:
   ```bash
   npm run start:dev
   ```

4. **Verificar Documentación**:
   Navega a `http://localhost:3000/api/docs` para visualizar la especificación Swagger completa de todos los endpoints disponibles.

---

## 🧩 Estructura de Módulos (Épicas)

El código está estructurado en módulos que reflejan las Épicas INVEST del proyecto:
- `AuthModule`: Login, registro y emisión de JWT.
- `CatalogModule`: Lectura de películas, series, etc. (Consultas optimizadas a Oracle).
- `PlaybackModule`: Tracking de reproducciones (Actualizaciones de alta frecuencia a tablas particionadas).
- `CommunityModule`: Favoritos y calificaciones.
- `FinanceModule`: Integración con simuladores de pago y lectura de vistas financieras.
- `AnalyticsModule`: Lectura exclusiva de Vistas Materializadas y cubos OLAP en Oracle.
