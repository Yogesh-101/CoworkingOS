#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> CoworkingOS + SereniBase backend setup"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop and retry."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
fi

if [ ! -f .env.local ]; then
  echo "Tip: copy .env.example to .env.local for VITE_USE_SERENIBASE=true"
fi

echo "==> Building and starting SereniBase (backend-only) + JWT + Coworking API"
docker compose up -d --build

echo ""
echo "Waiting for services (up to 3 minutes)…"
for i in $(seq 1 90); do
  if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
    echo "Coworking API is ready."
    break
  fi
  sleep 2
done

curl -s http://localhost:3001/health | head -c 500 || true
echo ""
echo ""
echo "Next steps:"
echo "  1. Set VITE_USE_SERENIBASE=true in .env.local"
echo "  2. npm run dev"
echo "  3. Sign in with OWNER_EMAIL / OWNER_PASSWORD (default admin@example.com / Admin@123)"
echo ""
echo "URLs:"
echo "  Frontend:     http://localhost:3000"
echo "  Coworking API: http://localhost:3001"
echo "  SereniBase:   http://localhost:8080/api/v1/health"
