Development without heavy Docker rebuilds

- Goal: live reload frontend and backend using bind mounts and nodemon/CRA dev server.
- Result: no image rebuild on code changes; only rebuild when package.json changes.

Prerequisites
- Docker Desktop (Compose v2+)
- Windows PowerShell

Services (dev)
- backend-dev: Node 18, runs `npm run dev` with nodemon on port 3001
- frontend-dev: CRA dev server on port 3000, proxies `/api` to backend-dev

Start Dev Environment
1) Ensure the production app is stopped to free port 3001:

```powershell
docker-compose stop app
```

2) Start Postgres once (background):

```powershell
docker-compose up -d db
```

3) Start backend + frontend in dev mode (live reload):

```powershell
docker-compose up backend-dev frontend-dev
```

Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

Notes
- First run will execute `npm install` inside both dev containers and generate Prisma client.
- File watching in Docker on Windows can be flaky; we enabled polling via env vars.
- CRA proxy is configured in `frontend/package.json` so requests to `/api/*` are forwarded to `http://localhost:3001`.

Common Tasks
- Rebuild only if dependencies change:

```powershell
docker-compose build backend-dev
docker-compose build frontend-dev
```

- View logs:

```powershell
docker-compose logs -f backend-dev
docker-compose logs -f frontend-dev
```

- Clean up Docker disk usage:

```powershell
docker system df
docker system prune -f
docker builder prune -f
docker image prune -f
docker volume prune -f
```

Troubleshooting
- Port 3001 already in use: stop prod app `docker-compose stop app` or `docker-compose down`.
- Prisma client missing: `docker-compose exec backend-dev sh -lc "npx prisma generate"`.
- Node modules cache: we use named volumes `backend_node_modules` and `frontend_node_modules` to keep installs inside the containers.
