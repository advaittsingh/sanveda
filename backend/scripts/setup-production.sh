#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "Sanveda production setup"
echo "========================"

if [[ ! -f .env ]]; then
  cat > .env <<'EOF'
DATABASE_URL=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
VITE_RAZORPAY_KEY_ID=
EOF
  echo "Created .env — fill in the required production values."
fi

DATABASE_URL="$(
  node --env-file=.env -e \
    'process.stdout.write(process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "")'
)"
export DATABASE_URL

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL is required in .env."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required for production setup."
  exit 1
fi

bash backend/scripts/apply-migrations.sh
bash backend/scripts/verify-migrations.sh

echo ""
echo "Database schema setup completed. Application deployment is a separate step."
