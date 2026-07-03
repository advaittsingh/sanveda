-- Sanveda Phase 3 — Advanced NGO Ecosystem
-- Run after schema-phase2.sql

-- ─── Admin roles (RBAC) ───────────────────────────────────────────────────────
alter table public.admin_users
  add column if not exists role text not null default 'admin'
    check (role in ('super_admin', 'admin', 'finance', 'content', 'volunteer'));

-- ─── Audit log ────────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create policy "Admins read audit logs" on public.audit_logs for select
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Verification registry ────────────────────────────────────────────────────
create table if not exists public.verification_records (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('donation_receipt', 'membership_certificate', 'volunteer_id', 'internship_certificate')),
  holder_name text not null,
  reference_id text not null,
  metadata jsonb default '{}',
  valid_until date,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.verification_records enable row level security;
create policy "Public can verify by code" on public.verification_records for select using (true);
create policy "Admins manage verifications" on public.verification_records for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Internships ──────────────────────────────────────────────────────────────
create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  application_id text unique,
  full_name text not null,
  email text not null,
  phone text not null,
  university text,
  course text,
  semester text,
  preferred_department text,
  duration_weeks int,
  motivation text,
  skills text,
  status text not null default 'pending'
    check (status in ('pending', 'review', 'approved', 'active', 'completed', 'rejected')),
  certificate_number text unique,
  admin_notes text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.internships enable row level security;
create policy "Anyone can apply internship" on public.internships for insert with check (true);
create policy "Public read internships" on public.internships for select using (true);
create policy "Admins update internships" on public.internships for update
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Projects ─────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  focus_area text,
  status text not null default 'planning'
    check (status in ('planning', 'active', 'on_hold', 'completed', 'archived')),
  budget numeric default 0,
  spent numeric default 0,
  beneficiaries_count int default 0,
  start_date date,
  end_date date,
  manager_name text,
  progress_percent int default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Public read active projects" on public.projects for select using (status in ('active', 'completed'));
create policy "Admins manage projects" on public.projects for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Events ───────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  end_date timestamptz,
  capacity int,
  registered_count int not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  banner_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;
create policy "Public read published events" on public.events for select using (status = 'published');
create policy "Admins manage events" on public.events for all
  using (auth.uid() in (select user_id from public.admin_users));

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  status text not null default 'registered' check (status in ('registered', 'attended', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.event_registrations enable row level security;
create policy "Anyone register for event" on public.event_registrations for insert with check (true);
create policy "Admins read registrations" on public.event_registrations for select
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Gallery ──────────────────────────────────────────────────────────────────
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_image text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery_albums enable row level security;
alter table public.gallery_items enable row level security;
create policy "Public read published albums" on public.gallery_albums for select using (status = 'published');
create policy "Public read gallery items" on public.gallery_items for select using (true);
create policy "Admins manage albums" on public.gallery_albums for all
  using (auth.uid() in (select user_id from public.admin_users));
create policy "Admins manage items" on public.gallery_items for all
  using (auth.uid() in (select user_id from public.admin_users));

insert into storage.buckets (id, name, public) values ('gallery-media', 'gallery-media', true) on conflict (id) do nothing;

-- Seed gallery
insert into public.gallery_albums (slug, title, description, cover_image, status)
values
  ('community-impact', 'Community Impact', 'Moments from our field programmes', '/assets/focus-areas/community.jpg', 'published'),
  ('healthcare-outreach', 'Healthcare Outreach', 'Medical camps and therapeutic support', '/assets/focus-areas/healthcare.jpg', 'published')
on conflict (slug) do nothing;
