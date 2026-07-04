#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="xkimzgtmrsrevpnawmmo"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "Sanveda production setup"
echo "========================"

if [[ ! -f .env ]]; then
  cat > .env <<EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=
VITE_RAZORPAY_KEY_ID=
SUPABASE_DB_PASSWORD=
DATABASE_URL=
EOF
  echo "Created .env — fill in VITE_SUPABASE_ANON_KEY and SUPABASE_DB_PASSWORD"
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

if [[ -z "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
  echo "Add VITE_SUPABASE_ANON_KEY to .env (Dashboard → Project Settings → API → anon public)"
  exit 1
fi

if [[ -n "${SUPABASE_DB_PASSWORD:-}" || -n "${DATABASE_URL:-}" ]]; then
  bash scripts/apply-migrations.sh
else
  echo "Skip migrations: set SUPABASE_DB_PASSWORD in .env, then run: npm run db:migrate"
fi

if command -v vercel >/dev/null 2>&1; then
  echo "→ Setting Vercel env vars"
  printf '%s' "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production --force 2>/dev/null || true
  printf '%s' "$VITE_SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production --force 2>/dev/null || true
  if [[ -n "${VITE_RAZORPAY_KEY_ID:-}" ]]; then
    printf '%s' "$VITE_RAZORPAY_KEY_ID" | vercel env add VITE_RAZORPAY_KEY_ID production --force 2>/dev/null || true
  fi
  echo "→ Deploying to Vercel"
  vercel --prod --yes
fi

echo ""
echo "Next: create Auth user in Supabase, then run scripts/bootstrap-admin.sql in SQL Editor"
