#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.backend.pid"

if [ ! -f "$PID_FILE" ] || ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Backend is not running"
  rm -f "$PID_FILE"
  exit 0
fi

PID="$(cat "$PID_FILE")"
kill "$PID"
rm -f "$PID_FILE"
echo "Backend stopped (PID $PID)"
