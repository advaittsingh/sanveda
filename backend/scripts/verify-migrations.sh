#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MIGRATIONS_DIR="$ROOT/backend/db/migrations"

if [[ -z "${DATABASE_URL:-}" ]]; then
  for env_file in "$ROOT/.env.neon.local" "$ROOT/.env"; do
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

if [[ -n "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(
    node -e 'const u=new URL(process.env.DATABASE_URL); u.searchParams.delete("channel_binding"); process.stdout.write(u.toString())'
  )"
  export DATABASE_URL
fi

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Migration directory not found: backend/db/migrations"
  exit 1
fi

migrations=("$MIGRATIONS_DIR"/*.sql)
if [[ ! -e "${migrations[0]}" ]]; then
  migration_count=0
else
  migration_count="${#migrations[@]}"
fi

if [[ "$migration_count" -lt 4 ]]; then
  echo "Expected at least four ordered SQL migrations."
  exit 1
fi

if awk '
  BEGIN { found = 0 }
  /auth\.uid|auth\.users|(^|[^[:alnum:]_])(anon|authenticated|service_role)([^[:alnum:]_]|$)|storage\.|create[[:space:]]+policy|enable[[:space:]]+row[[:space:]]+level[[:space:]]+security/ {
    print FILENAME ":" FNR ":" $0
    found = 1
  }
  END { exit found ? 0 : 1 }
' "$MIGRATIONS_DIR"/*.sql; then
  echo "Legacy provider-specific SQL remains in backend/db/migrations."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Static migration checks passed; DATABASE_URL is not set, so database verification was skipped."
  exit 0
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required when DATABASE_URL is set."
  exit 1
fi

psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 <<'SQL'
do $$
declare
  relation_name text;
  function_name text;
begin
  foreach relation_name in array array[
    'user', 'session', 'account', 'verification', 'profiles', 'admin_users',
    'campaigns', 'donations', 'payment_transactions', 'payment_webhook_events',
    'recurring_donations', 'recurring_payment_attempts', 'donation_receipts',
    'donation_refunds', 'payment_reconciliation', 'projects', 'beneficiaries',
    'events', 'documents', 'audit_logs', 'project_funding', 'donor_profiles'
  ]
  loop
    if to_regclass(format('public.%I', relation_name)) is null then
      raise exception 'required relation public.% is missing', relation_name;
    end if;
  end loop;

  foreach function_name in array array[
    'private.current_user_id()', 'private.set_updated_at()',
    'public.create_pending_donation_checkout(text,numeric,text,integer,text,boolean,text,text,text)',
    'public.settle_razorpay_payment(text,text,bigint,text,text,jsonb)'
  ]
  loop
    if to_regprocedure(function_name) is null then
      raise exception 'required function % is missing', function_name;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_constraint c
    join pg_class child on child.oid = c.conrelid
    join pg_class parent on parent.oid = c.confrelid
    join pg_namespace child_ns on child_ns.oid = child.relnamespace
    join pg_namespace parent_ns on parent_ns.oid = parent.relnamespace
    where c.contype = 'f'
      and child_ns.nspname = 'public'
      and child.relname = 'profiles'
      and parent_ns.nspname = 'public'
      and parent.relname = 'user'
  ) then
    raise exception 'profiles is not linked to the Better Auth user table';
  end if;
end
$$;
SQL

echo "Static and database migration checks passed."
