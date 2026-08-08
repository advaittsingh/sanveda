#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
URL="$(node --env-file=.env -e 'process.stdout.write(process.env.DATABASE_URL_UNPOOLED||process.env.POSTGRES_URL_NON_POOLING||process.env.DATABASE_URL||process.env.POSTGRES_URL||"")')"
if [[ -z "$URL" ]]; then echo "DATABASE_URL is required"; exit 1; fi
CLEAN="$(node -e 'const u=new URL(process.argv[1]); u.searchParams.delete("channel_binding"); process.stdout.write(u.toString())' "$URL")"
psql "$CLEAN" -v ON_ERROR_STOP=1 -f backend/db/seed/purge-demo-seed.sql
echo "Demo seed purged."
