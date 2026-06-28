#!/usr/bin/env bash

set -euo pipefail

# SuryaShield AI Launcher (Linux)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""
BACKEND_READY=0
FRONTEND_READY=0

cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

need_cmd() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing command: $cmd"
    echo "$hint"
    exit 1
  fi
}

setup_backend() {
  cd "$PROJECT_DIR/backend"
  need_cmd "python3" "Install Python 3 first, then retry."

  if [[ ! -f "venv/bin/activate" ]]; then
    echo "Backend virtual environment not found. Creating backend/venv..."
    python3 -m venv venv
  fi

  # shellcheck disable=SC1091
  source "venv/bin/activate"

  if ! python -m pip --version >/dev/null 2>&1; then
    python -m ensurepip --upgrade
  fi

  echo "Installing backend dependencies if needed..."
  python -m pip install --upgrade pip >/dev/null
  python -m pip install -r requirements.txt
}

setup_frontend() {
  cd "$PROJECT_DIR/frontend"
  need_cmd "npm" "Install Node.js + npm first, then retry."

  if [[ ! -d "node_modules" ]]; then
    echo "Frontend node_modules not found. Installing dependencies..."
    npm install
  fi
}

trap cleanup EXIT INT TERM

clear
printf "\n"
printf " ============================================\n"
printf "   SuryaShield AI - Solar Flare Prediction\n"
printf "   Predicting the Sun's storms before they \n"
printf "   strike Earth.\n"
printf " ============================================\n"
printf "\n"

printf "Preparing backend environment...\n"
setup_backend

printf "Preparing frontend environment...\n"
setup_frontend

printf "[1/2] Starting Backend (FastAPI + PyTorch)...\n"
(
  cd "$PROJECT_DIR/backend"
  # shellcheck disable=SC1091
  source "venv/bin/activate"
  echo "Backend starting on http://localhost:8000"
  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 3
if kill -0 "$BACKEND_PID" 2>/dev/null; then
  BACKEND_READY=1
fi

printf "[2/2] Starting Frontend (Next.js + Three.js)...\n"
(
  cd "$PROJECT_DIR/frontend"
  echo "Frontend starting on http://localhost:3000"
  npm run dev
) &
FRONTEND_PID=$!

# Wait for frontend to compile
sleep 5
if kill -0 "$FRONTEND_PID" 2>/dev/null; then
  FRONTEND_READY=1
fi

if [[ "$BACKEND_READY" -eq 1 && "$FRONTEND_READY" -eq 1 ]]; then
  printf "\n"
  printf " ============================================\n"
  printf "   Both services are starting!\n"
  printf "\n"
  printf "   Frontend:  http://localhost:3000\n"
  printf "   Backend:   http://localhost:8000\n"
  printf "   Dashboard: http://localhost:3000/dashboard\n"
  printf " ============================================\n"
  printf "\n"
  printf " Opening browser in 5 seconds...\n"
  sleep 5

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:3000" >/dev/null 2>&1 || true
  else
    echo "xdg-open not found. Open http://localhost:3000 manually."
  fi
else
  echo "One or more services failed to start."
  echo "Backend running:  $BACKEND_READY"
  echo "Frontend running: $FRONTEND_READY"
  echo "Check errors above, fix them, and run ./run.sh again."
  exit 1
fi

echo "Press Enter to stop services and close this launcher."
read -r
