-- Phase 5: Sprint 1–3 production hardening
-- Run after schema-phase4-production.sql

-- ─── RBAC helper functions ───────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.current_admin_role()
returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.admin_users where user_id = auth.uid()), '');
$$;

create or replace function public.admin_has_module(p_module text)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text := public.current_admin_role();
begin
  if not public.is_admin() then return false; end if;
  if r = 'super_admin' then return true; end if;
  if r = 'admin' then return true; end if;
  if r = 'finance' and p_module = any(array['donations','finance','beneficiaries','audit','tax_receipts','transactions']) then
    return true;
  end if;
  if r = 'content' and p_module = any(array['campaigns','blogs','gallery','events','content','cms','testimonials','focus_areas','documents']) then
    return true;
  end if;
  if r = 'volunteer' and p_module = any(array['volunteers','internships','enquiries']) then
    return true;
  end if;
  return false;
end;
$$;

-- ─── Scoped public PII lookups (replace USING(true) policies) ────────────────
drop policy if exists "Applicants can read own application by email" on public.volunteer_applications;
drop policy if exists "Public can lookup membership by id and email" on public.memberships;
drop policy if exists "Public read internships" on public.internships;

create policy "Admins read volunteer applications"
  on public.volunteer_applications for select
  using (public.is_admin());

create or replace function public.lookup_volunteer_application(p_id text, p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare row public.volunteer_applications%rowtype;
begin
  select * into row from public.volunteer_applications
  where id = p_id and lower(email) = lower(trim(p_email));
  if not found then return null; end if;
  return jsonb_build_object(
    'id', row.id,
    'volunteer_id', row.volunteer_id,
    'status', row.status,
    'full_name', row.full_name,
    'email', row.email,
    'preferred_roles', row.preferred_roles,
    'created_at', row.created_at,
    'interview_date', row.interview_date,
    'assigned_team', row.assigned_team
  );
end;
$$;

create or replace function public.lookup_membership_status(p_id uuid, p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare row public.memberships%rowtype;
begin
  select * into row from public.memberships
  where id = p_id and lower(email) = lower(trim(p_email));
  if not found then return null; end if;
  return jsonb_build_object(
    'id', row.id,
    'member_id', row.member_id,
    'full_name', row.full_name,
    'email', row.email,
    'status', row.status,
    'tier', row.tier,
    'certificate_number', row.certificate_number,
    'renewal_date', row.renewal_date,
    'created_at', row.created_at
  );
end;
$$;

create or replace function public.lookup_internship_status(p_application_id text, p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare row public.internships%rowtype;
begin
  select * into row from public.internships
  where application_id = p_application_id and lower(email) = lower(trim(p_email));
  if not found then return null; end if;
  return jsonb_build_object(
    'id', row.id,
    'application_id', row.application_id,
    'full_name', row.full_name,
    'email', row.email,
    'status', row.status,
    'certificate_number', row.certificate_number,
    'preferred_department', row.preferred_department,
    'start_date', row.start_date,
    'end_date', row.end_date,
    'created_at', row.created_at
  );
end;
$$;

grant execute on function public.lookup_volunteer_application(text, text) to anon, authenticated;
grant execute on function public.lookup_membership_status(uuid, text) to anon, authenticated;
grant execute on function public.lookup_internship_status(text, text) to anon, authenticated;

-- ─── Audit logs INSERT + admin_users role management ─────────────────────────
drop policy if exists "Admins read audit logs" on public.audit_logs;

create policy "Admins read audit logs"
  on public.audit_logs for select
  using (public.is_admin());

create policy "Admins insert audit logs"
  on public.audit_logs for insert
  with check (public.is_admin() and (user_id is null or user_id = auth.uid()));

create policy "Super admins manage admin users"
  on public.admin_users for update
  using (public.current_admin_role() = 'super_admin');

create policy "Super admins insert admin users"
  on public.admin_users for insert
  with check (public.current_admin_role() = 'super_admin');

-- ─── Role-scoped admin policies (campaigns example; donations finance) ───────
drop policy if exists "Admins manage campaigns" on public.campaigns;

create policy "Admins read all campaigns"
  on public.campaigns for select
  using (public.is_admin() or status = 'active');

create policy "Content admins manage campaigns"
  on public.campaigns for all
  using (public.admin_has_module('campaigns'))
  with check (public.admin_has_module('campaigns'));

-- ─── Documents table (Sprint 2) ──────────────────────────────────────────────
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_id text unique not null,
  title text not null,
  category text not null,
  folder text not null default 'public',
  description text,
  owner text default 'Admin',
  version text default 'v1.0',
  issue_date date,
  expiry_date date,
  visibility text not null default 'internal'
    check (visibility in ('public', 'internal', 'restricted')),
  status text not null default 'draft'
    check (status in ('draft', 'under_review', 'approved', 'published', 'archived')),
  tags jsonb not null default '[]',
  file_url text,
  file_size_mb numeric not null default 0,
  project text,
  campaign text,
  event text,
  focus_area text,
  downloads int not null default 0,
  views int not null default 0,
  shares int not null default 0,
  versions jsonb not null default '[]',
  is_compliance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Public read published public documents"
  on public.documents for select
  using (visibility = 'public' and status = 'published');

create policy "Admins manage documents"
  on public.documents for all
  using (public.admin_has_module('documents'))
  with check (public.admin_has_module('documents'));

insert into storage.buckets (id, name, public)
values ('compliance-documents', 'compliance-documents', false)
on conflict (id) do nothing;

create policy "Admins upload compliance docs"
  on storage.objects for insert
  with check (bucket_id = 'compliance-documents' and public.admin_has_module('documents'));

create policy "Admins read compliance docs"
  on storage.objects for select
  using (bucket_id = 'compliance-documents' and public.is_admin());

-- ─── Idempotent donation completion RPC wrapper for admin approve ─────────────
create or replace function public.complete_donation_admin(
  p_donation_id uuid,
  p_payment_id text default null
)
returns public.donations
language plpgsql security definer set search_path = public as $$
declare
  receipt text;
  result public.donations;
begin
  if not public.admin_has_module('donations') then
    raise exception 'Insufficient permissions to complete donations';
  end if;
  select public.generate_receipt_number() into receipt;
  select * into result from public.complete_donation_and_update_campaign(
    p_donation_id, coalesce(p_payment_id, 'admin-approved'), receipt
  );
  return result;
end;
$$;

grant execute on function public.complete_donation_admin(uuid, text) to authenticated;
