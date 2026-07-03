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
