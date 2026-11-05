#!/usr/bin/env bash
set -e

echo "Running Alembic migrations..."
alembic upgrade head

SEED_FLAG=$(echo "${CANOPY_SEED_EMISSION_FACTORS_ONCE:-false}" | tr '[:upper:]' '[:lower:]')
if [ "$SEED_FLAG" = "true" ] || [ "$SEED_FLAG" = "1" ]; then
    echo "[CANOPY STARTUP] CANOPY_SEED_EMISSION_FACTORS_ONCE is enabled. Executing seed_emission_factors.py..."
    python scripts/seed_emission_factors.py
fi

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
