# CoworkingOS Backend

Express + SQLite API for persistent workspace data.

## Stack

- **Express 4** — REST API
- **SQLite** (`better-sqlite3`) — file database at `backend/data/coworkingos.db`
- **Gemini** — server-side AI proxy (`GEMINI_API_KEY`, not exposed to browser)

## Quick start

```bash
# From repo root — runs frontend (:3000) and API (:4000) together
npm run dev

# Or run API only
cd backend && cp .env.example .env   # add GEMINI_API_KEY
npm run dev
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/bootstrap` | Full workspace snapshot |
| POST | `/api/sync` | Replace workspace state (used by frontend debounced persist) |
| POST | `/api/mutate` | Single action mutation `{ action, payload, context }` |
| POST | `/api/ai/generate` | Gemini proxy for Assist & Team Chat |
| POST | `/api/seed/reset` | Reset DB to demo seed data |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | API port |
| `DATABASE_PATH` | `./data/coworkingos.db` | SQLite file |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `GEMINI_API_KEY` | — | Google Gemini API key (server only) |

## Frontend integration

- Vite proxies `/api` → `http://localhost:4000` in dev
- On sign-in, frontend loads `/api/bootstrap` into Zustand
- Changes debounce-sync to `/api/sync` (~400ms)
- Set `VITE_USE_API=false` in `.env.local` to use in-memory mocks only
