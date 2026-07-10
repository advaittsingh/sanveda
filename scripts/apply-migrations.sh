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

PROJECT_REF="xkimzgtmrsrevpnawmmo"
FILES=(
  supabase/schema.sql
  supabase/schema-phase2.sql
  supabase/schema-phase3.sql
  supabase/schema-phase4-production.sql
  supabase/schema-phase5-sprint.sql
  supabase/schema-phase6-donation-ops.sql
  supabase/schema-phase7-donation-public.sql
  supabase/schema-phase8-campaign-admin-meta.sql
  supabase/schema-phase9-campaign-featured.sql
  supabase/schema-phase10-seed-compliance-documents.sql
)

if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]] && command -v supabase >/dev/null 2>&1; then
  supabase link --project-ref "$PROJECT_REF" --yes >/dev/null 2>&1 || true
  for file in "${FILES[@]}"; do
    echo "→ Applying $file (Supabase CLI)"
    supabase db query --linked -f "$file"
  done
  echo "✓ All migrations applied."
  exit 0
fi

if [[ -z "$DB_URL" ]]; then
  echo "Missing credentials. Add one of these to .env:"
  echo "  SUPABASE_DB_PASSWORD=<database password>"
  echo "  SUPABASE_ACCESS_TOKEN=<dashboard → Account → Access Tokens>"
  exit 1
fi

for file in "${FILES[@]}"; do
  echo "→ Applying $file"
  if command -v supabase >/dev/null 2>&1; then
    supabase db query --db-url "$DB_URL" -f "$file"
  else
    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$file"
  fi
done

echo "✓ All migrations applied."
