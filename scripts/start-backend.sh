#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
PID_FILE="$ROOT_DIR/.backend.pid"
LOG_FILE="$ROOT_DIR/backend.log"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Backend already running (PID $(cat "$PID_FILE"))"
  exit 0
fi

echo "Starting Postgres (docker compose)..."
(cd "$ROOT_DIR" && docker compose up -d db)

echo "Waiting for Postgres to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' educast-db 2>/dev/null)" = "healthy" ]; do
  sleep 1
done

echo "Building backend..."
cd "$BACKEND_DIR"
go build -o "$ROOT_DIR/.backend-bin" .

echo "Starting backend..."
nohup "$ROOT_DIR/.backend-bin" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "Backend started (PID $(cat "$PID_FILE")), logs: $LOG_FILE"
