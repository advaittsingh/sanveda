-- Sanveda NGO Platform — run in Supabase SQL Editor
-- https://supabase.com/dashboard → SQL → New query

-- ─── Profiles (extends auth.users for donors) ───────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Admin users ──────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read admin list"
  on public.admin_users for select
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Enquiries ────────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'resolved', 'closed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

create policy "Anyone can submit enquiry"
  on public.enquiries for insert
  with check (true);

create policy "Admins can read enquiries"
  on public.enquiries for select
  using (auth.uid() in (select user_id from public.admin_users));

create policy "Admins can update enquiries"
  on public.enquiries for update
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Volunteer applications ───────────────────────────────────────────────────
create table if not exists public.volunteer_applications (
  id text primary key,
  volunteer_id text,
  status text not null default 'pending'
    check (status in ('pending', 'screening', 'interview', 'orientation', 'approved', 'rejected', 'active')),
  full_name text not null,
  date_of_birth date,
  gender text,
  email text not null,
  phone text not null,
  address text,
  city text,
  state text,
  country text default 'India',
  occupation text,
  organization text,
  linkedin text,
  education text,
  preferred_roles jsonb not null default '[]',
  volunteer_type text not null default 'part-time',
  hours_per_week text,
  skills text,
  experience text,
  languages text,
  certifications text,
  motivation text,
  about_yourself text,
  previous_experience text,
  resume_url text,
  resume_name text,
  id_proof_url text,
  id_proof_name text,
  photo_url text,
  photo_name text,
  agreed_policies boolean not null default false,
  agreed_background_check boolean not null default false,
  agreed_data_processing boolean not null default false,
  assigned_team text,
  admin_notes text,
  interview_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.volunteer_applications enable row level security;

create policy "Anyone can submit volunteer application"
  on public.volunteer_applications for insert
  with check (true);

create policy "Applicants can read own application by email"
  on public.volunteer_applications for select
  using (true);

create policy "Admins can update volunteer applications"
  on public.volunteer_applications for update
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Campaigns ──────────────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id serial primary key,
  slug text unique not null,
  title text not null,
  banner_image text,
  thumbnail_image text,
  goal numeric not null default 0,
  raised numeric not null default 0,
  description text,
  exemption_tag text,
  total_donors int not null default 0,
  category jsonb default '[]',
  hide_goal int default 0,
  hide_raised int default 0,
  feature_urgent int default 0,
  feature_recent int default 0,
  campaign_descriptions jsonb default '[]',
  status text not null default 'active' check (status in ('draft', 'pending', 'active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Public can read active campaigns"
  on public.campaigns for select
  using (status = 'active');

create policy "Admins manage campaigns"
  on public.campaigns for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Donations ────────────────────────────────────────────────────────────────
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  campaign_id int references public.campaigns (id) on delete set null,
  campaign_slug text,
  campaign_title text not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'INR',
  is_anonymous boolean not null default false,
  donor_name text,
  donor_email text,
  donor_phone text,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  receipt_number text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "Users can read own donations"
  on public.donations for select
  using (auth.uid() = user_id);

create policy "Anyone can create donation"
  on public.donations for insert
  with check (true);

create policy "Users can update own pending donations"
  on public.donations for update
  using (auth.uid() = user_id or auth.uid() in (select user_id from public.admin_users));

create policy "Admins can read all donations"
  on public.donations for select
  using (auth.uid() in (select user_id from public.admin_users));

-- Receipt number generator
create or replace function public.generate_receipt_number()
returns text
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq from public.donations where receipt_number like 'SVD-80G-' || yr || '-%';
  return 'SVD-80G-' || yr || '-' || lpad(seq::text, 5, '0');
end;
$$;

-- ─── Storage bucket for volunteer documents ───────────────────────────────────
insert into storage.buckets (id, name, public)
values ('volunteer-documents', 'volunteer-documents', false)
on conflict (id) do nothing;

create policy "Anyone can upload volunteer docs"
  on storage.objects for insert
  with check (bucket_id = 'volunteer-documents');

create policy "Admins can read volunteer docs"
  on storage.objects for select
  using (
    bucket_id = 'volunteer-documents'
    and auth.uid() in (select user_id from public.admin_users)
  );

-- ─── Seed Sanveda campaigns (optional — skip if using static fallback) ─────────
insert into public.campaigns (slug, title, banner_image, thumbnail_image, goal, raised, description, exemption_tag, category, feature_urgent, feature_recent, campaign_descriptions)
values
  (
    'neet-students-families-humanitarian-relief-fund',
    'NEET Students'' Families Humanitarian Relief Fund',
    '/assets/focus-areas/education.jpg',
    '/assets/focus-areas/education.jpg',
    5000000, 0,
    'Every Dream Matters. Every Family Deserves Support.',
    'Tax Benefit',
    '["Education"]'::jsonb, 1, 1,
    '[]'::jsonb
  ),
  (
    'support-indias-unsponsored-athletes',
    'Support India''s Unsponsored Athletes',
    '/assets/focus-areas/sports.jpg',
    '/assets/focus-areas/sports.jpg',
    5000000, 0,
    'Talent Should Never Stop Because of Money.',
    'Tax Benefit',
    '["Sports"]'::jsonb, 1, 1,
    '[]'::jsonb
  ),
  (
    'sanveda-wish-of-hope',
    'Sanveda Wish of Hope',
    '/assets/focus-areas/healthcare.jpg',
    '/assets/focus-areas/healthcare.jpg',
    5000000, 0,
    'Turning Courage into Smiles.',
    'Tax Benefit',
    '["Medical","Children"]'::jsonb, 1, 1,
    '[]'::jsonb
  )
on conflict (slug) do nothing;
-- Sanveda Phase 2 — run after schema.sql

-- ─── Campaign admin: read drafts ─────────────────────────────────────────────
drop policy if exists "Admins can read all campaigns" on public.campaigns;
create policy "Admins can read all campaigns"
  on public.campaigns for select
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Blogs ───────────────────────────────────────────────────────────────────
create table if not exists public.blogs (
  id serial primary key,
  slug text unique not null,
  title text not null,
  banner_image text,
  description text,
  content jsonb not null default '[]',
  category text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

create policy "Public can read published blogs"
  on public.blogs for select
  using (status = 'published');

create policy "Admins manage blogs"
  on public.blogs for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Memberships ─────────────────────────────────────────────────────────────
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  member_id text unique,
  full_name text not null,
  email text not null,
  phone text not null,
  address text,
  city text,
  state text,
  country text default 'India',
  occupation text,
  motivation text,
  tier text not null default 'standard'
    check (tier in ('standard', 'patron', 'founding')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'active', 'expired', 'rejected')),
  renewal_date date,
  certificate_number text unique,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "Anyone can apply for membership"
  on public.memberships for insert
  with check (true);

create policy "Users can read own membership"
  on public.memberships for select
  using (auth.uid() = user_id or lower(email) = lower(auth.jwt() ->> 'email'));

create policy "Public can lookup membership by id and email"
  on public.memberships for select
  using (true);

create policy "Admins manage memberships"
  on public.memberships for update
  using (auth.uid() in (select user_id from public.admin_users));

create policy "Admins read all memberships"
  on public.memberships for select
  using (auth.uid() in (select user_id from public.admin_users));

create or replace function public.generate_member_id()
returns text
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq from public.memberships where member_id like 'SVD-MEM-' || yr || '-%';
  return 'SVD-MEM-' || yr || '-' || lpad(seq::text, 4, '0');
end;
$$;

create or replace function public.generate_certificate_number()
returns text
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq from public.memberships where certificate_number like 'SVD-CERT-' || yr || '-%';
  return 'SVD-CERT-' || yr || '-' || lpad(seq::text, 4, '0');
end;
$$;

-- ─── Beneficiaries ───────────────────────────────────────────────────────────
create table if not exists public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  address text,
  city text,
  state text,
  category text,
  program text,
  support_type text,
  notes text,
  status text not null default 'active'
    check (status in ('active', 'completed', 'on_hold', 'archived')),
  support_amount numeric default 0,
  last_support_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.beneficiaries enable row level security;

create policy "Admins manage beneficiaries"
  on public.beneficiaries for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Expenses ────────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null,
  amount numeric not null check (amount > 0),
  expense_date date not null default current_date,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'paid')),
  reference text,
  approved_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "Admins manage expenses"
  on public.expenses for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Income ──────────────────────────────────────────────────────────────────
create table if not exists public.income_records (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('donation', 'membership', 'grant', 'csr', 'other')),
  description text not null,
  amount numeric not null check (amount > 0),
  income_date date not null default current_date,
  reference_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.income_records enable row level security;

create policy "Admins manage income"
  on public.income_records for all
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Email logs ──────────────────────────────────────────────────────────────
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  template text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.email_logs enable row level security;

create policy "Admins read email logs"
  on public.email_logs for select
  using (auth.uid() in (select user_id from public.admin_users));

-- ─── Donation completion: update campaign raised ─────────────────────────────
create or replace function public.complete_donation_and_update_campaign(
  p_donation_id uuid,
  p_payment_id text,
  p_receipt_number text
)
returns public.donations
language plpgsql
security definer set search_path = public
as $$
declare
  d public.donations;
begin
  update public.donations
  set
    status = 'completed',
    razorpay_payment_id = p_payment_id,
    receipt_number = p_receipt_number,
    updated_at = now()
  where id = p_donation_id
  returning * into d;

  if d.campaign_id is not null then
    update public.campaigns
    set
      raised = raised + d.amount,
      total_donors = total_donors + 1,
      updated_at = now()
    where id = d.campaign_id;
  end if;

  insert into public.income_records (source, description, amount, income_date, reference_id)
  values ('donation', d.campaign_title, d.amount, current_date, d.id::text);

  return d;
end;
$$;

-- Seed blogs from demo content
insert into public.blogs (slug, title, banner_image, description, content, category, status, published_at)
values
  (
    'community-healthcare-camp',
    'How Community Support Transformed a Rural Healthcare Camp',
    '/assets/focus-areas/healthcare.jpg',
    'Through generous donations, Sanveda brought medical care to over 500 families.',
    '[{"id":1,"description":"Through generous donations, Sanveda brought medical care to over 500 families in underserved villages."}]'::jsonb,
    'Healthcare', 'published', now()
  ),
  (
    'sports-development-athletes',
    'Empowering Young Athletes Through Sports Development',
    '/assets/focus-areas/sports.jpg',
    'Our sports initiative equips talented youth with training, gear, and mentorship.',
    '[{"id":2,"description":"Our sports initiative equips talented youth with training, gear, and mentorship to compete at state and national levels."}]'::jsonb,
    'Sports', 'published', now()
  ),
  (
    'education-scholarships',
    'Education Scholarships Opening Doors for Tomorrow',
    '/assets/focus-areas/education.jpg',
    'Scholarships are helping students from underserved communities pursue their dreams.',
    '[{"id":3,"description":"Scholarships are helping students from underserved communities pursue higher education and build brighter futures."}]'::jsonb,
    'Education', 'published', now()
  )
on conflict (slug) do nothing;
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
