# Mini-X

A simplified Twitter/X clone built as a learning project for modern full-stack development.

- **Backend:** Node.js, Express, TypeScript, Prisma, Zod, PostgreSQL, JWT auth, Supabase Storage
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router, React Hook Form, Axios

```
mini-x/
├── backend/                 # Express API + Prisma
├── frontend/                # React SPA
├── docker-compose.dev.yml   # Local development stack
├── docker-compose.prod.yml  # Production stack
└── README.md
```

---

## Features

- Register / login / logout with access token + rotating refresh token (httpOnly cookie)
- Global home feed and following feed
- Create, edit, delete posts (text + image upload)
- Replies / threads with ancestor chain
- Likes, follows, profile tabs (posts, replies, likes)
- Avatar upload via Supabase Storage
- Cursor-based infinite scroll
- Zod validation on both client and server

---

## Prerequisites

- Node.js 22+
- PostgreSQL 16+ (or Docker)
- A Supabase project with public buckets: `avatars` and `posts`
- npm

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ACCESS_TOKEN_SECRET` | JWT secret (≥ 32 characters) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase service/secret key |
| `PORT` | API port (default `3000`) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `CORS_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |

Example:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/mini-x
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret_at_least_32_chars
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (browser-accessible) |

Example:

```env
VITE_API_URL=http://localhost:3000
```

---

## Local setup (without Docker for the apps)

### 1. Database

From `backend/` you can start only Postgres:

```bash
cd backend
docker compose up -d
```

Or use the root dev compose Postgres service.

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed   # optional demo data (password: 123456)
npm run dev
```

API: `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

---

## Docker

### Development

Runs Postgres + backend (`npm run dev`) + frontend (`npm run dev`) with live bind mounts.

```bash
# from repo root — daily use (reuses existing images)
docker compose -f docker-compose.dev.yml up -d

# only when Dockerfile.dev / base image needs a rebuild
docker compose -f docker-compose.dev.yml up -d --build
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3000  
- Postgres: localhost:5432  

Source changes on the host are reflected in the containers. Container `node_modules` live in **named Docker volumes** (Linux binaries). That is separate from host `node_modules`.

- The IDE / TypeScript on Windows need a **host** install: `cd backend && npm i` and `cd frontend && npm i`. Empty host `node_modules` → red import errors even while Docker works.
- Inside the container, each start runs `npm i` against the volume (fast after the first time). That does **not** populate the host folder.

**Do not run dev and prod compose at the same time** — both bind host port `3000` (and Postgres `5432`). If prod owns `:3000`, the Vite app at `:5173` will call the prod API and fail CORS (`Network Error`).

```bash
# switch to dev
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.dev.yml up -d
```

`--build` is optional for day-to-day work. Use it when you change a Dockerfile or need a fresh image. The first `up` still builds images if they do not exist yet.

If the backend/frontend loops on `npm i` errors (`ENOTEMPTY`, missing modules), recreate the dependency volumes:

```bash
docker compose -f docker-compose.dev.yml down
docker volume rm mini-x-dev_backend_node_modules mini-x-dev_frontend_node_modules
docker compose -f docker-compose.dev.yml up -d
```

Do **not** delete `package-lock.json` on the host — Docker production builds need it.

Seed demo users (password `123456`):

```bash
docker exec mini-x-backend-dev npx prisma db seed
```

### Production

Builds optimized images. Docker layer caching rebuilds only layers that changed.

```bash
# from repo root
docker compose -f docker-compose.prod.yml up -d --build
```

After images exist and only app config/env changed:

```bash
docker compose -f docker-compose.prod.yml up -d
```

- Frontend (nginx): http://localhost (port 80 — no `:port` in the URL)
- Backend: http://localhost:3000

Seed demo data:

```bash
docker exec mini-x-backend-prod npx prisma db seed
```

Optional overrides:

```bash
CORS_ORIGIN=http://localhost \
VITE_API_URL=http://localhost:3000 \
POSTGRES_PASSWORD=root \
docker compose -f docker-compose.prod.yml up -d --build
```

> `VITE_API_URL` is baked into the frontend **at build time**. Set it to the API URL the browser will call.
> Production Dockerfiles use `npm ci` (requires a lockfile in sync with `package.json`).

---

## Backend architecture

```
Request → Route → Middleware (auth / validate / upload)
        → Controller → Service → Prisma / Supabase
        → apiSuccess / AppError → errorHandler
```

### Main folders

| Path | Role |
|------|------|
| `src/routes/` | HTTP routes |
| `src/controllers/` | Thin request/response adapters |
| `src/services/` | Business logic + DB |
| `src/middlewares/` | Auth, Zod validation, upload, errors |
| `src/validation/` | Zod schemas |
| `prisma/` | Schema, migrations, seed |

### Auth model

- **Access token:** JWT in `Authorization: Bearer <token>` (short-lived)
- **Refresh token:** random token in httpOnly cookie + `sessions` table (rotated on refresh)
- Endpoints: `POST /login`, `POST /refreshToken`, `POST /logout`

### API response envelope

Success:

```json
{ "data": { ... }, "meta": { "nextCursor": "..." } }
```

Error:

```json
{ "error": { "message": "...", "details": ["..."] } }
```

### Important routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | No | Login |
| POST | `/refreshToken` | Cookie | Refresh access token |
| POST | `/logout` | Cookie | Logout |
| GET | `/posts` | Yes | Global feed |
| GET | `/posts/feedFollowing` | Yes | Following feed |
| GET | `/posts/:postId` | No | Post + ancestors |
| GET | `/posts/:postId/replies` | No | Thread replies |
| POST | `/posts` | Yes | Create post (`multipart`) |
| PATCH | `/posts/:postId` | Yes | Edit post |
| DELETE | `/posts/:postId` | Yes | Delete post |
| POST/DELETE | `/posts/:postId/likes` | Yes | Like / unlike |
| POST | `/users` | No | Register |
| GET | `/users/:id` | Optional | Profile |
| GET | `/users/:id/posts` | Optional | User posts |
| GET | `/users/:id/replies` | Yes | User replies |
| GET | `/users/:id/likes` | Owner | Liked posts |
| POST/DELETE | `/users/:id/follow` | Yes | Follow / unfollow |
| GET | `/users/:id/followers` | Yes | Followers |
| GET | `/users/:id/following` | Yes | Following |
| PATCH | `/users/:id` | Owner | Edit profile |
| PATCH | `/users/:id/avatar` | Owner | Avatar upload |

### Backend scripts

```bash
npm run dev       # tsx watch
npm run build     # prisma generate + tsc
npm start         # node dist/src/server.js
npx prisma db seed
```

---

## Frontend architecture

```
src/
  api/           # Axios client + resource modules
  schemas/       # Zod form schemas
  stores/        # Zustand (auth, UI)
  hooks/         # Pagination, body scroll lock
  components/    # UI + features
  pages/         # Route screens
  types/         # Shared API types
  lib/           # Helpers (countries, dates, cn)
```

### Stack choices

| Library | Why |
|---------|-----|
| React Router | SPA routing + auth guards |
| Zustand | Lightweight global auth/UI state |
| Axios | Interceptors for Bearer token + refresh on `401` |
| Zod + RHF | Typed form validation aligned with the API |
| Tailwind v4 | Utility styling + design tokens |

### Auth flow (browser)

1. `POST /login` → stores access token in memory, refresh cookie is set by the API  
2. Request interceptor attaches `Authorization: Bearer ...`  
3. On `401`, client calls `/refreshToken` with credentials and retries  
4. On bootstrap, app tries `/refreshToken` to restore the session  

### Main UI routes

| Path | Screen |
|------|--------|
| `/login`, `/register` | Auth |
| `/` | Home (global feed) |
| `/following` | Following feed |
| `/posts/:postId` | Post + ancestors + replies |
| `/users/:id` | Profile |
| `/settings` | Edit account / avatar / delete |

### Frontend scripts

```bash
npm run dev
npm run build
npm run preview
```

---

## Seed users

After `npx prisma db seed` (from `backend/`):

- Password for all users: `123456`
- Example: `alice_wonder`

---

## Design notes

- Brand: **minix** (Outfit + Manrope)
- Accent teal on ink/paper surfaces
- Twitter-like layout (left nav + centered feed), distinct visual identity

---

## Troubleshooting

**CORS errors**  
Ensure `CORS_ORIGIN` matches the exact frontend origin (including port).

**Refresh / logout not working**  
Frontend must call the API with `withCredentials: true` (already configured in Axios).

**Image uploads fail**  
Create Supabase buckets `avatars` and `posts` and confirm `SUPABASE_*` env vars.

**Prisma client missing**  
Run `npx prisma generate` inside `backend/`.

**Production frontend calls wrong API**  
Rebuild frontend with the correct `VITE_API_URL` build arg.

---

## License

ISC — learning / personal project.
