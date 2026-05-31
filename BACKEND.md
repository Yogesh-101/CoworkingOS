# CoworkingOS + SereniBase Backend

Production stack using [SereniBase](https://github.com/aptlogica/sereni-base) **backend only** (REST API + PostgreSQL), plus a minimal JWT provider and CoworkingOS BFF.

## Architecture

```
CoworkingOS (React)  →  Coworking API (:3001)  →  SereniBase REST (:8080)
                              ↓
                        JWT provider (:8081)
                              ↓
                        PostgreSQL (:5432)
```

- **SereniBase** stores the full workspace snapshot in a dedicated table (`coworking_snapshot`).
- **Coworking API** bootstraps workspace/base/table on first run and exposes `/api/v1/auth/login` and `/api/v1/workspace`.
- **JWT provider** implements the auth contract SereniBase expects (not included in upstream `docker-compose.yaml` alone).

## Quick start

```bash
# 1. Start backend
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh

# 2. Enable API mode for frontend
echo 'VITE_USE_SERENIBASE=true' >> .env.local
echo 'VITE_API_URL=' >> .env.local

# 3. Run frontend
npm install
npm run dev
```

Sign in at **http://localhost:3000** with:

| Field | Default |
|-------|---------|
| Email | `admin@example.com` |
| Password | `Admin@123` |

(Set via `OWNER_EMAIL` / `OWNER_PASSWORD` in `.env` for Docker.)

## Services

| Service | Port | URL |
|---------|------|-----|
| Coworking API | 3001 | http://localhost:3001/health |
| SereniBase REST | 8080 | http://localhost:8080/api/v1/health |
| JWT provider | 8081 | http://localhost:8081/health |
| PostgreSQL | 5432 | localhost:5432 |

## Commands

```bash
# Start
docker compose up -d

# Logs
docker compose logs -f coworking-api serenibase-rest

# Stop (keep data)
docker compose down

# Reset all data
docker compose down -v
```

## Demo vs production mode

| Mode | Env | Behavior |
|------|-----|----------|
| Demo | `VITE_USE_SERENIBASE` unset | In-memory Zustand seed, role picker |
| Production | `VITE_USE_SERENIBASE=true` | SereniBase login, persisted workspace |

## Reference

SereniBase setup guide: [SETUP_COMPLETE_GUIDE.md](https://github.com/aptlogica/sereni-base/blob/develop/build/SETUP_COMPLETE_GUIDE.md)
