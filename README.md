# MinFlix - Plataforma de Streaming Multimedia

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

MinFlix es un proyecto académico y técnico diseñado para construir una plataforma de streaming robusta con una **arquitectura empresarial**. El proyecto demuestra el uso avanzado de modelado de datos, reglas de negocio fuertes centralizadas en base de datos y una implementación full-stack trazable mediante metodologías ágiles (Épicas INVEST).

---

## Equipo de Desarrollo
- Juan Sebastian Norena Espinosa
- Daniel Eduardo Jurado Celemin
- Samuel Andres Castaño Montes

---

## Características Principales

- **Catálogo Multimedia**: Administración completa de películas, series, documentales, música y podcasts.
- **Gestión de Cuentas y Perfiles**: Soporte multi-perfil por cuenta, con restricciones basadas en planes de suscripción y perfiles infantiles.
- **Tracking de Reproducción**: Registro en tiempo real del progreso de visualización, permitiendo continuar donde se dejó.
- **Interacción Comunitaria**: Sistema de favoritos, calificaciones, reseñas y reporte de contenido.
- **Módulo Financiero**: Simulador de pagos, facturación mensual, cobros, descuentos por referidos y renovaciones.
- **Analítica Avanzada**: Dashboards y reportes ejecutivos alimentados por vistas materializadas y OLAP.

---

## Arquitectura del Sistema

MinFlix sigue una arquitectura por capas bien definida:

1. **Capa de Persistencia (Oracle Database)**
   - Motor principal de almacenamiento.
   - Validaciones y reglas de negocio críticas implementadas vía **SQL y PL/SQL** (Triggers, Procedures, Functions).
   - Uso de Vistas Materializadas y particionamiento para rendimiento analítico.

2. **Capa de Negocio / Backend (NestJS)**
   - API RESTful central.
   - Autenticación y autorización basada en JWT y Passport.js.
   - Orquestación segura entre el cliente y la base de datos Oracle.

3. **Capa de Presentación / Frontend (React)**
   - Interfaces dinámicas basadas en roles de usuario.
   - Experiencia de usuario fluida con animaciones y diseño responsivo (TailwindCSS + Framer Motion).
   - Consumo eficiente de API mediante React Query.

---

## Tecnologías Utilizadas

### Base de Datos
- Oracle Database
- SQL y PL/SQL avanzado

### Backend (`minflix-backend`)
- **Framework**: NestJS (TypeScript)
- **ORM/Driver**: TypeORM, `oracledb`
- **Seguridad**: Passport.js (Local & JWT), Helmet, bcrypt
- **Calidad**: ESLint, Jest, Supertest, Swagger (OpenAPI)

### Frontend (`minflix-frontend`)
- **Core**: React, TypeScript, Vite
- **Navegación & Estado**: React Router DOM, TanStack React Query
- **Estilos & UI**: TailwindCSS, Framer Motion, Lucide React
- **Formularios**: React Hook Form, Zod

---

## Guía de Instalación y Ejecución

### Prerrequisitos
- Node.js (v18+)
- npm o pnpm (recomendado)
- Oracle Database (19c+) con un esquema configurado.

### 1. Ejecución Rápida (Recomendado)
Desde la raíz del proyecto en Windows:
```powershell
.\start-dev.ps1
```
*Este script iniciará ambos entornos (Frontend y Backend) simultáneamente.*

### 2. Ejecución Manual

**Backend:**
```bash
cd minflix-backend
cp .env.example .env # Configurar credenciales de Oracle
npm install
npm run start:dev
```
*Swagger disponible en: `http://localhost:3000/api/docs`*

**Frontend:**
```bash
cd minflix-frontend
cp .env.example .env # Configurar VITE_API_URL
npm install
npm run dev
```
*Aplicación disponible en: `http://localhost:5173`*

### 3. Base de Datos (Oracle)
Ejecutar los scripts de la carpeta `database/` en orden secuencial (del `01` al `21`) para inicializar el esquema, estructuras, reglas PL/SQL y datos semilla.
Se puede utilizar el script maestro `database/run_all.sql` a través de SQLcl o SQL*Plus.

>  **Nota:** El script `00_drop_all.sql` es destructivo y solo debe usarse para reiniciar completamente el entorno de base de datos.

---

##  Documentación Técnica

Para un detalle exhaustivo del diseño, modelado y plan de proyecto, consulte la carpeta `Docs/`:

-  [Definición del Proyecto (Documento Técnico Principal)](./Docs/Definicion_Proyecto.md)
-  [Plan de Desarrollo](./Docs/Plan_Desarrollo.md)
-  [Épicas INVEST](./Docs/Epicas.md)
-  [Guía de Diseño UI](./Docs/Guia_Diseno_UI.md)

---

##  Seguridad y Autenticación
- Integración obligatoria con **Passport.js**.
- Las contraseñas se encriptan con `bcrypt` en la base de datos mediante triggers en Oracle.
- Los flujos principales (reproducción, finanzas, comunidad) requieren autenticación mediante **JWT**.

---

##  Estado de Validación
- Pruebas de integración Frontend/Backend validadas en todos los módulos (Catálogo, Reproducción, Finanzas, etc.).
- Compilación (`build`) y análisis estático (`lint`) exitosos en ambos repositorios.
- Reglas de calidad aplicadas, incluyendo documentación con `TSDoc`.
