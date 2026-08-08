#!/usr/bin/env bash
set -euo pipefail
if [[ "${ALLOW_DEMO_SEED:-}" != "1" ]]; then
  echo "Refusing to seed demo data. Local QA only: ALLOW_DEMO_SEED=1 npm run db:seed-demo"
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
URL="$(node --env-file=.env -e 'process.stdout.write(process.env.DATABASE_URL||process.env.POSTGRES_URL||"")')"
if [[ -z "$URL" ]]; then echo "DATABASE_URL is required"; exit 1; fi
CLEAN="$(node -e 'const u=new URL(process.argv[1]); u.searchParams.delete("channel_binding"); process.stdout.write(u.toString())' "$URL")"
psql "$CLEAN" -v ON_ERROR_STOP=1 -f backend/db/seed/demo-seed.sql
echo "Demo seed applied (local QA)."
