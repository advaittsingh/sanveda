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
