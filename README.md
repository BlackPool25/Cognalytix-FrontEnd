# Cognalytix — Frontend

React (Vite) UI for the Cognalytix journaling product: **self-discovery mirror** aesthetic from `reference.jsx`, wired to the Spring Boot API in `../source`.

## Prerequisites

- **Node.js 20+** (for Vite 6 / React 19)
- **Backend** running with the same auth and journal contracts documented in [`../source/README.md`](../source/README.md) (default API port **8000**).

## Quick start (development)

1. Start PostgreSQL and the Spring Boot app from the `source` folder (`./mvnw spring-boot:run`).
2. In this folder:

   ```bash
   npm install
   npm run dev
   ```

3. Open **http://localhost:5173**. The Vite dev server **proxies `/api`** to `http://localhost:8000`, so the browser calls same-origin `/api/...` and avoids CORS issues during local development.

## Authentication

- **Register:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Refresh:** `POST /api/auth/refresh` (automatic on `401` once per request)
- **Logout:** `POST /api/auth/logout` (revokes the refresh token)

Access tokens are stored in **`localStorage`** together with the refresh token and public user fields (`name`, `email`, `role`). Protected app routes require a valid session; unauthenticated users are redirected to **`/login`**.

## API surface used by the UI

| Area | Endpoints |
|------|-----------|
| Journals | `GET/POST /api/journals`, `GET/PUT /api/journals/{id}`, `POST .../reanalyze` |
| Growth mirror | `GET /api/insights/growth/latest?entryId=` |

List responses use Spring **`Page`** JSON (`content`, `totalElements`, …). Journal list items omit heavy **`sections`** until you open an entry (`GET` by id).

## Production / deployment

Build static assets:

```bash
npm run build
```

Output is in **`dist/`**.

**API base URL**

- **Same host as the UI** (recommended): serve `dist` behind the same origin as the API and leave **`VITE_API_BASE` unset** so requests stay relative (`/api/...`).
- **Separate origin**: set **`VITE_API_BASE`** to the full backend origin (e.g. `https://api.example.com`). The backend must allow **CORS** for your frontend origin (not configured in the repo by default).

Example build with an explicit API origin:

```bash
VITE_API_BASE=https://your-api.example.com npm run build
```

## Project layout

| Path | Role |
|------|------|
| `src/api/` | Thin fetch layer: `client.js` (JWT + refresh), `authApi.js`, `journalsApi.js`, `insightsApi.js` |
| `src/context/AuthContext.jsx` | Session + login / register / logout |
| `src/layouts/MainLayout.jsx` | Sidebar + themed shell (`reference.jsx` styling) |
| `src/pages/` | Home, Write, Journal, Insights, Login, Register |
| `src/theme.js` | Design tokens (`getT`, intensity colors) |
| `reference.jsx` | Original single-file mock (kept as a visual reference; app code lives under `src/`) |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server with `/api` proxy |
| `npm run build` | Production bundle |
| `npm run preview` | Preview the production build locally |

## Proxy target

Override the dev proxy target if the API is not on port 8000:

```bash
VITE_PROXY_TARGET=http://localhost:9000 npm run dev
```

(`vite.config.js` reads `VITE_PROXY_TARGET`; defaults to `http://localhost:8000`.)
