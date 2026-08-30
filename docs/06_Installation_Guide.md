# EduCast — Installation Guide

How to install and run the EduCast stack (database, backend, frontend). Two paths are provided: **Docker (recommended)** and **native**.

| | |
|---|---|
| **Project** | EduCast — Demand-Driven Tutoring Marketplace |
| **Components** | PostgreSQL 16 · Go/Gin backend · React Native (Expo) frontend |
| **Repository** | https://github.com/dakshkanaujia/Educast.git |

---

## 1. Prerequisites

### For the Docker path (recommended)
- **Docker** and **Docker Compose** (Docker Desktop on macOS/Windows, or Docker Engine on Linux).
- ~2 GB free disk for images.

### For the native path
- **Go 1.25+**
- **Node.js 18+** and **npm**
- **PostgreSQL 16** (or run just the DB container via Docker)
- **python3** (only needed to run the API test suite)

## 2. Get the Code

```bash
git clone https://github.com/dakshkanaujia/Educast.git
cd Educast
```

## 3. Option A — Docker Compose (whole stack)

This is the fastest path to a working system. It builds and starts three containers: `db`, `backend`, `frontend`.

```bash
docker compose up --build
```

What happens:
- **db** — PostgreSQL 16 starts and, on a **fresh** data volume, applies the schema from `backend/migrations/` automatically.
- **backend** — waits for the database to be healthy, then serves the API on **http://localhost:8080**.
- **frontend** — Expo web dev server on **http://localhost:8081**.

Verify:
```bash
curl http://localhost:8080/health      # -> {"status":"ok"}
# open http://localhost:8081 in a browser for the app
```

Run in the background instead:
```bash
docker compose up -d --build
docker compose ps        # view status
docker compose logs -f   # follow logs
```

Stop:
```bash
docker compose down        # stop containers (keeps the database volume)
docker compose down -v     # stop AND wipe the database volume (fresh start)
```

### 3.1 Ports

| Service | Container port | Host port |
|---|---|---|
| PostgreSQL | 5432 | 5432 |
| Backend API | 8080 | 8080 |
| Frontend (Expo web) | 8081 | 8081 |

### 3.2 Default environment (set in `docker-compose.yml`)

| Variable | Value |
|---|---|
| `DB_HOST` | `db` |
| `DB_PORT` | `5432` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `DB_NAME` | `educast` |
| `JWT_SECRET` | `change_me_in_production` |
| `SERVER_PORT` | `8080` |

> **Security:** change `JWT_SECRET` (and the DB password) before deploying anywhere real.

## 4. Option B — Native (recommended while developing)

### 4.1 Database
Run just Postgres in Docker (simplest), or use a local install:
```bash
docker compose up -d db
```
Or, with a local PostgreSQL, create the database and apply migrations in order:
```bash
psql -U postgres -c "CREATE DATABASE educast;"
psql -U postgres -d educast -f backend/migrations/001_initial_schema_postgres.sql
psql -U postgres -d educast -f backend/migrations/002_bid_scheduling_and_reviews.sql
psql -U postgres -d educast -f backend/migrations/003_bid_negotiation.sql
```

### 4.2 Backend
```bash
cd backend
cp .env.example .env      # edit DB credentials / JWT secret if needed
go mod download
go run main.go
```
The API comes up on **http://localhost:8080**. Check: `curl http://localhost:8080/health`.

Helper scripts (run a detached backend during local dev):
```bash
./scripts/start-backend.sh   # builds & runs the backend in the background
./scripts/stop-backend.sh    # stops it
```

### 4.3 Frontend
```bash
cd frontend
npm install
npm run web        # or: npm start, then press "w" for web
```
This opens the Expo dev server. Press `w` for web, or scan the QR code with **Expo Go** on a device.

> **Physical device:** the frontend defaults to `http://localhost:8080` for the API (`frontend/src/services/config.js`). On a real phone, `localhost` is the phone, not your computer — change it to your machine's LAN IP (e.g. `http://192.168.1.20:8080`).

## 5. Applying New/Updated Migrations (Important)

The Docker `db` container runs migration scripts **only when the data directory is empty** (i.e. on a brand-new volume). If you add or change a migration and your volume already exists, it will **not** be picked up automatically. Two options:

**Option 1 — fresh start (destructive; wipes data):**
```bash
docker compose down -v && docker compose up -d --build
```

**Option 2 — apply manually (non-destructive):**
```bash
docker compose exec -T db psql -U postgres -d educast -f - < backend/migrations/00X_your_migration.sql
```
The provided migrations are additive and idempotent (`IF NOT EXISTS`), so re-applying them is safe.

## 6. Running the Test Suite

With the stack running:
```bash
./scripts/api_test.sh
# optionally target another base URL:
./scripts/api_test.sh http://localhost:8080
```
Expected: `TOTAL: 33  PASS: 33  FAIL: 0`. See `docs/03_Test_Cases_and_Validation_Report.md`.

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker not running | Start Docker Desktop / `dockerd` and retry |
| Frontend exits with `Cannot determine the project's Expo SDK version` | Stale image built before deps were installed | Rebuild: `docker compose up -d --build` (a plain `up` never rebuilds) |
| `relation "reviews" does not exist` / missing column | New migration didn't apply to an existing volume | See §5 (apply manually, or `down -v` for a fresh start) |
| Backend can't reach DB | Wrong host/credentials | In Docker, `DB_HOST` must be `db` (not `localhost`); check compose env |
| `/health` returns 000 / connection refused | Backend not up yet | Wait for the `backend` container to be healthy; check `docker compose logs backend` |
| Port already in use (8080/8081/5432) | Another process bound the port | Stop the other process or change the host port mapping in `docker-compose.yml` |
| Frontend can't reach API on a phone | `localhost` points to the phone | Set your machine's LAN IP in `frontend/src/services/config.js` |

## 8. Uninstall / Clean Up

```bash
docker compose down -v          # remove containers + database volume
docker image rm educast-backend educast-frontend educast-db   # remove built images (optional)
```
