#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ -z "${DATABASE_URL:-}" ]]; then
  for env_file in .env.neon.local .env; do
    if [[ -f "$env_file" ]]; then
      DATABASE_URL="$(
        node --env-file="$env_file" -e \
          'process.stdout.write(process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "")'
      )"
      if [[ -n "$DATABASE_URL" ]]; then
        export DATABASE_URL
        break
      fi
    fi
  done
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to apply database migrations."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required."
  exit 1
fi

# Older psql/libpq builds can choke on Neon channel_binding.
DATABASE_URL="$(
  node -e 'const u=new URL(process.env.DATABASE_URL); u.searchParams.delete("channel_binding"); process.stdout.write(u.toString())'
)"
export DATABASE_URL

MIGRATIONS_DIR="$ROOT/backend/db/migrations"
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Migration directory not found: backend/db/migrations"
  exit 1
fi

psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 <<'SQL'
create table if not exists public.schema_migrations (
  version text primary key,
  checksum_sha256 text not null,
  applied_at timestamptz not null default now()
);
SQL

sql_quote() {
  node -e 'process.stdout.write("\x27" + process.argv[1].replaceAll("\x27", "\x27\x27") + "\x27")' "$1"
}

applied=0
for migration in "$MIGRATIONS_DIR"/*.sql; do
  [[ -e "$migration" ]] || continue
  version="$(basename "$migration")"
  if command -v shasum >/dev/null 2>&1; then
    checksum="$(shasum -a 256 "$migration" | awk '{print $1}')"
  elif command -v sha256sum >/dev/null 2>&1; then
    checksum="$(sha256sum "$migration" | awk '{print $1}')"
  else
    echo "A SHA-256 checksum tool (shasum or sha256sum) is required."
    exit 1
  fi

  version_sql="$(sql_quote "$version")"
  checksum_sql="$(sql_quote "$checksum")"

  recorded_checksum="$(
    psql "$DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 \
      -c "select checksum_sha256 from public.schema_migrations where version = ${version_sql}"
  )"

  if [[ -n "$recorded_checksum" ]]; then
    if [[ "$recorded_checksum" != "$checksum" ]]; then
      echo "Checksum mismatch for already-applied migration: $version"
      exit 1
    fi
    continue
  fi

  echo "Applying $version"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -1 \
    -f "$migration" \
    -c "insert into public.schema_migrations (version, checksum_sha256) values (${version_sql}, ${checksum_sql})"
  applied=$((applied + 1))
done

echo "Applied $applied migration(s) from backend/db/migrations."
