-- Phase 4: Production hardening — finance ledger immutability & audit enrichment

alter table if exists public.audit_logs
  add column if not exists ip_address text,
  add column if not exists device text,
  add column if not exists browser text,
  add column if not exists old_data jsonb,
  add column if not exists new_data jsonb,
  add column if not exists severity text default 'info';

create table if not exists public.finance_ledger_locks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  locked_at timestamptz not null default now(),
  locked_by uuid references auth.users (id) on delete set null,
  unique (source_type, source_id)
);

alter table public.finance_ledger_locks enable row level security;

create policy "Admins manage ledger locks" on public.finance_ledger_locks
  for all using (auth.uid() in (select user_id from public.admin_users));

-- Auto-audit trigger for donations
create or replace function public.audit_donation_changes()
returns trigger language plpgsql security definer as $$
begin
  insert into public.audit_logs (user_id, action, entity_type, entity_id, details, old_data, new_data, severity)
  values (
    auth.uid(),
    case TG_OP when 'INSERT' then 'CREATE' when 'UPDATE' then 'UPDATE' when 'DELETE' then 'DELETE' end,
    'donations',
    coalesce(NEW.id, OLD.id)::text,
    jsonb_build_object('amount', coalesce(NEW.amount, OLD.amount), 'status', coalesce(NEW.status, OLD.status)),
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(NEW) else null end,
    case when TG_OP = 'DELETE' then 'critical' else 'info' end
  );
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists trg_audit_donations on public.donations;
create trigger trg_audit_donations
  after insert or update or delete on public.donations
  for each row execute function public.audit_donation_changes();
