# Local Development Setup (Windows + Docker)

This guide walks a new machine through running the stack with Docker for development, with Prisma Studio, backend, and frontend all in sync.

## Prerequisites
- Docker Desktop (v4.x+) with WSL2 backend enabled
- Node.js 18+ (only needed for utility scripts, not required if using Docker only)
- Git
- Free ports: `3000` (FE), `3001` (BE), `5434` (Postgres on host), `5555` (Prisma Studio)

## 1) Clone the repository
```powershell
git clone https://github.com/ThLin57/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen
```

## 2) Start the Dev Stack (Docker Compose)
This runs Postgres, the backend (watch mode), and the frontend dev server.

```powershell
# Bring up services in background with the dev profile
docker compose --profile dev up -d

# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Services started:
- `dacn_db`: Postgres listening on host `localhost:5434`
- `dacn_backend_dev`: Backend on `http://localhost:3001` (Express + Prisma)
- `dacn_frontend_dev`: Frontend on `http://localhost:3000` (CRA dev server)

The backend container boot command performs:
- `npx prisma migrate deploy` (retry until db ready)
- `npx prisma generate`
- `npm run dev` (nodemon)

## 3) Seed or Verify Data
If the database is empty, seed sample data.
```powershell
# Run seed from backend container
docker compose exec backend-dev node prisma/seed.js
```

You can re-run seeds any time; adjust scripts if you require idempotent behaviour.

## 4) Open Prisma Studio (for live DB edits)
Bind Prisma Studio to 0.0.0.0 so the host can access on port 5555:
```powershell
# Start Prisma Studio inside backend container
# (Keep this running in a terminal; Ctrl+C to stop studio)
docker compose exec backend-dev npx prisma studio --host 0.0.0.0 --port 5555 --browser none
```
Access: http://localhost:5555

- Any changes you make in Studio are immediately visible to backend APIs.
- The frontend dev server proxies API requests to `http://dacn_backend_dev:3001` via its `proxy` setting, so `fetch('/api/...')` from FE hits the backend container.

## 5) Verify Everything is in Sync
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- Prisma Studio: http://localhost:5555

Edit some records in Studio (e.g., `SinhVien`, `HoatDong`). Refresh FE pages to confirm changes reflect.

## 6) Stopping and Restarting
```powershell
# Stop all dev containers
docker compose --profile dev down

# Start again later
docker compose --profile dev up -d
```

## 7) Production (Optional)
Run the single production container that serves the built frontend from the backend image.
```powershell
# Build and run prod app
docker compose --profile prod up -d --build app

# Access backend+frontend at
# http://localhost:3001
```

## Troubleshooting
- Port conflicts: Change host bindings in `docker-compose.yml` if `3000`, `3001`, `5434`, or `5555` are in use.
- DB reset:
```powershell
docker compose --profile dev down -v
# then bring up again
docker compose --profile dev up -d
```
- Prisma generate/migrate issues: Exec into backend container and run:
```powershell
docker compose exec backend-dev sh -lc "npx prisma migrate deploy && npx prisma generate"
```
- Backend logs:
```powershell
docker compose logs -f backend-dev
```
- Frontend logs:
```powershell
docker compose logs -f frontend-dev
```
- Studio not opening: Ensure you started Studio with `--host 0.0.0.0 --port 5555` and port `5555` isn’t blocked.
- CORS/JWT: In dev, the FE proxies to the backend container, so CORS is minimal. Ensure you are logged in and tokens are valid.
