-- Schema-only portion of the legacy cleanup migration. Demo data removal is
-- intentionally excluded from the Neon schema migration.
drop function if exists public.complete_donation_public(uuid, text);
