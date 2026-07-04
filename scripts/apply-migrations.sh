#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_URL="${DATABASE_URL:-}"
if [[ -z "$DB_URL" && -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
  DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.xkimzgtmrsrevpnawmmo.supabase.co:5432/postgres"
fi

if [[ -z "$DB_URL" ]]; then
  echo "Missing DATABASE_URL or SUPABASE_DB_PASSWORD in .env"
  echo "Get password: Supabase Dashboard → Project Settings → Database"
  exit 1
fi

FILES=(
  supabase/schema.sql
  supabase/schema-phase2.sql
  supabase/schema-phase3.sql
  supabase/schema-phase4-production.sql
  supabase/schema-phase5-sprint.sql
)

for file in "${FILES[@]}"; do
  echo "→ Applying $file"
  if command -v supabase >/dev/null 2>&1; then
    supabase db query --db-url "$DB_URL" -f "$file"
  else
    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$file"
  fi
done

echo "✓ All migrations applied."
