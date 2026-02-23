# Prueba técnica fullstack - FinanzasApp

Aplicación fullstack para gestión de movimientos financieros (ingresos/egresos), administración de usuarios y reportes, construida con Next.js (`pages` router), TypeScript, Tailwind, Prisma, Better Auth y PostgreSQL (Supabase).

## Estado de cumplimiento de la prueba

Revisión del código actual:

- Roles y permisos con RBAC implementados en frontend y backend.
- Autenticación con Better Auth + GitHub implementada.
- Nuevos usuarios con rol por defecto `ADMIN` implementado.
- Home con navegación a movimientos, usuarios y reportes implementado.
- Movimientos con listado, creación, edición y eliminación implementado.
- Gestión de usuarios (listado y edición de nombre/rol) implementado.
- Reportes con resumen, gráfica y descarga CSV implementado.
- Endpoints REST en `pages/api` implementados y protegidos.
- Documentación OpenAPI/Swagger en `/api/docs` + UI en `/docs` implementada.
- Pruebas unitarias: 3 archivos de test implementados (`vitest`).

## Tecnologías principales

- Next.js 15 (`pages` router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Better Auth (GitHub OAuth)
- Prisma + PostgreSQL (Supabase)
- Swagger UI + OpenAPI
- Vitest

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior
- Base de datos PostgreSQL (recomendado Supabase)
- App OAuth de GitHub configurada (se puede configurar desde https://github.com/settings/developers)

## Variables de entorno

Crea el archivo `.env` en la raíz del proyecto con estas variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
GITHUB_CLIENT_ID="tu_github_client_id"
GITHUB_CLIENT_SECRET="tu_github_client_secret"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

Notas:

- En GitHub OAuth usa como callback URL: `http://localhost:3000/api/auth/callback/github`.

## Ejecución local

1. Instalar dependencias:

```bash
npm install
```

2. Aplicar migraciones en la base de datos local/desarrollo:

```bash
npx prisma migrate dev
```

3. Ejecutar el proyecto:

```bash
npm run dev
```

4. Abrir en el navegador:

- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs`

## Scripts útiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

## Despliegue en Vercel

### 1) Preparar OAuth de GitHub para producción

En tu app de GitHub agrega:

- Homepage URL: `https://TU_DOMINIO_VERCEL`
- Authorization callback URL: `https://TU_DOMINIO_VERCEL/api/auth/callback/github`

### 2) Crear proyecto en Vercel

- Importa este repositorio en Vercel.
- Framework preset: Next.js.

### 3) Configurar variables de entorno en Vercel

Agrega las mismas variables del `.env`, ajustando:

- `NEXT_PUBLIC_BETTER_AUTH_URL=https://TU_DOMINIO_VERCEL`
- `DATABASE_URL` apuntando a tu base de datos de producción.

### 4) Comando de build recomendado

En `Build Command` de Vercel usa:

```bash
npx prisma generate && next build
```

### 5) Ejecutar migraciones en producción

Antes o justo después del primer deploy, ejecuta contra la BD de producción:

```bash
npx prisma migrate deploy
```

### 6) Verificación post-deploy

- Login con GitHub funcional.
- Endpoints protegidos responden según rol.
- Reportes y descarga CSV funcionan.
- Documentación disponible en `https://TU_DOMINIO_VERCEL/docs`.

## API y documentación

- OpenAPI JSON: `/api/docs`
- Interfaz Swagger: `/docs`
- Endpoints principales:
  - `GET/POST /api/movements`
  - `GET/PUT/DELETE /api/movements/{id}`
  - `GET /api/users`
  - `GET/PUT /api/users/{id}`
  - `GET /api/reports` y `GET /api/reports?format=csv`
