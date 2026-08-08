-- Canonical production schema. This migration is intentionally data-free and
-- can be applied to both a fresh project and the legacy Sanveda schema.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;

-- Better Auth core schema (v1.6 conventions).
-- The quoted table/column names match Better Auth's default PostgreSQL adapter.
create table if not exists public."user" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  phone text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."session" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public."user"(id) on delete cascade,
  token text not null unique,
  "expiresAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."account" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public."user"(id) on delete cascade,
  "accountId" text not null,
  "providerId" text not null,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);

create table if not exists public."verification" (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists session_user_id_idx on public."session" ("userId");
create index if not exists session_expires_at_idx on public."session" ("expiresAt");
create index if not exists account_user_id_idx on public."account" ("userId");
create index if not exists verification_identifier_idx on public."verification" (identifier);


-- Concurrency-safe human-readable identifiers.
create sequence if not exists public.receipt_number_seq;
create sequence if not exists public.member_number_seq;
create sequence if not exists public.certificate_number_seq;

-- Identity and RBAC compatibility.
create table if not exists public.profiles (
  id uuid primary key references public."user"(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  locale text not null default 'en-IN',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists locale text not null default 'en-IN';
alter table public.profiles add column if not exists timezone text not null default 'Asia/Kolkata';

create table if not exists public.admin_departments (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*$'),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  module text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (module, action)
);
create table if not exists public.admin_role_permissions (
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);
create table if not exists public.admin_users (
  user_id uuid primary key references public."user"(id) on delete cascade,
  role text not null default 'admin'
    check (role in ('super_admin','admin','finance','content','volunteer')),
  role_id uuid references public.admin_roles(id) on delete restrict,
  is_active boolean not null default true,
  invited_by uuid references public."user"(id) on delete set null,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users add column if not exists role_id uuid references public.admin_roles(id) on delete restrict;
alter table public.admin_users add column if not exists is_active boolean not null default true;
alter table public.admin_users add column if not exists invited_by uuid references public."user"(id) on delete set null;
alter table public.admin_users add column if not exists last_login_at timestamptz;
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role ~ '^[a-z][a-z0-9_]*$');
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists employee_id text unique;
alter table public.admin_users add column if not exists department_id uuid references public.admin_departments(id) on delete set null;
alter table public.admin_users add column if not exists designation text;
alter table public.admin_users add column if not exists reporting_manager_id uuid references public.admin_users(user_id) on delete set null;
alter table public.admin_users add column if not exists status text not null default 'active'
  check (status in ('active','pending','invited','suspended'));
alter table public.admin_users add column if not exists two_factor_enabled boolean not null default false;
alter table public.admin_users add column if not exists security_settings jsonb not null default '{}'::jsonb
  check (jsonb_typeof(security_settings) = 'object');

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  auth_user_id uuid references public."user"(id) on delete set null,
  role_id uuid not null references public.admin_roles(id) on delete restrict,
  department_id uuid references public.admin_departments(id) on delete set null,
  invited_by uuid not null references public."user"(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','accepted','expired','revoked','failed')),
  first_name text,
  last_name text,
  designation text,
  error_message text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  last_sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public intake and operational roots retained for application compatibility.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved','closed')),
  assigned_to uuid references public."user"(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.enquiries add column if not exists assigned_to uuid references public."user"(id) on delete set null;

create table if not exists public.volunteer_applications (
  id text primary key,
  volunteer_id text unique,
  user_id uuid references public."user"(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','screening','interview','orientation','approved','rejected','active')),
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
  preferred_roles jsonb not null default '[]'::jsonb check (jsonb_typeof(preferred_roles) = 'array'),
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
alter table public.volunteer_applications add column if not exists user_id uuid references public."user"(id) on delete set null;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete set null,
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
  tier text not null default 'standard' check (tier in ('standard','patron','founding')),
  status text not null default 'pending' check (status in ('pending','approved','active','expired','rejected')),
  renewal_date date,
  certificate_number text unique,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete set null,
  application_id text unique,
  full_name text not null,
  email text not null,
  phone text not null,
  university text,
  course text,
  semester text,
  preferred_department text,
  duration_weeks integer check (duration_weeks is null or duration_weeks > 0),
  motivation text,
  skills text,
  status text not null default 'pending' check (status in ('pending','review','approved','active','completed','rejected')),
  certificate_number text unique,
  admin_notes text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- CMS and fundraising.
create table if not exists public.campaigns (
  id integer generated by default as identity primary key,
  slug text unique not null,
  title text not null,
  banner_image text,
  thumbnail_image text,
  goal numeric(14,2) not null default 0 check (goal >= 0),
  raised numeric(14,2) not null default 0 check (raised >= 0),
  description text,
  exemption_tag text,
  total_donors integer not null default 0 check (total_donors >= 0),
  category jsonb not null default '[]'::jsonb,
  hide_goal integer not null default 0 check (hide_goal in (0,1)),
  hide_raised integer not null default 0 check (hide_raised in (0,1)),
  feature_urgent integer not null default 0 check (feature_urgent in (0,1)),
  feature_recent integer not null default 0 check (feature_recent in (0,1)),
  featured integer not null default 0 check (featured in (0,1)),
  campaign_descriptions jsonb not null default '[]'::jsonb,
  admin_meta jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.campaigns add column if not exists admin_meta jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists featured integer not null default 0;
alter table public.campaigns add column if not exists starts_at timestamptz;
alter table public.campaigns add column if not exists ends_at timestamptz;
alter table public.campaigns drop constraint if exists campaigns_status_check;
alter table public.campaigns add constraint campaigns_status_check
  check (status in ('draft','pending','active','closed','review','approved','published','paused','completed','rejected','archived'));

create table if not exists public.blogs (
  id integer generated by default as identity primary key,
  slug text unique not null,
  title text not null,
  banner_image text,
  description text,
  content jsonb not null default '[]'::jsonb,
  category text,
  author_id uuid references public.profiles(id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','approved','scheduled','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blogs add column if not exists author_id uuid references public.profiles(id) on delete set null;
alter table public.blogs add column if not exists seo jsonb not null default '{}'::jsonb;

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  path text not null unique,
  status text not null default 'draft' check (status in ('draft','review','approved','scheduled','published','archived')),
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references public."user"(id) on delete set null,
  updated_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.cms_pages(id) on delete cascade,
  key text not null,
  section_type text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  is_reusable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (page_id, key)
);
create table if not exists public.cms_navigation (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  group_name text not null check (group_name in ('main','footer','quick','mobile','social')),
  parent_id uuid references public.cms_navigation(id) on delete cascade,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.cms_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_url text,
  placement text not null default 'hero',
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  photo_url text,
  quote text not null,
  rating smallint check (rating between 1 and 5),
  category text,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.focus_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects, beneficiaries, events and operational child records.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  focus_area text,
  focus_area_id uuid references public.focus_areas(id) on delete set null,
  status text not null default 'planning' check (status in ('planning','active','on_hold','completed','archived')),
  budget numeric(14,2) not null default 0 check (budget >= 0),
  spent numeric(14,2) not null default 0 check (spent >= 0),
  beneficiaries_count integer not null default 0 check (beneficiaries_count >= 0),
  start_date date,
  end_date date,
  manager_name text,
  manager_user_id uuid references public."user"(id) on delete set null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  admin_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
alter table public.projects add column if not exists focus_area_id uuid references public.focus_areas(id) on delete set null;
alter table public.projects add column if not exists manager_user_id uuid references public."user"(id) on delete set null;
alter table public.projects add column if not exists admin_meta jsonb not null default '{}'::jsonb;

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed_at timestamptz,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','blocked','cancelled')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null,
  title text not null,
  assigned_to uuid references public."user"(id) on delete set null,
  due_date date,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','blocked','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.project_team_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public."user"(id) on delete cascade,
  role text not null,
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
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
  status text not null default 'active' check (status in ('active','completed','on_hold','archived')),
  support_amount numeric(14,2) not null default 0 check (support_amount >= 0),
  last_support_date date,
  admin_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.beneficiaries add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.beneficiaries add column if not exists admin_meta jsonb not null default '{}'::jsonb;
create table if not exists public.beneficiary_support (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  support_type text not null,
  quantity numeric(14,2) check (quantity is null or quantity >= 0),
  amount numeric(14,2) not null default 0 check (amount >= 0),
  provided_on date not null default current_date,
  provided_by uuid references public."user"(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  slug text unique not null,
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  end_date timestamptz,
  capacity integer check (capacity is null or capacity >= 0),
  registered_count integer not null default 0 check (registered_count >= 0),
  status text not null default 'draft' check (status in ('draft','published','cancelled','completed')),
  banner_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= event_date)
);
alter table public.events add column if not exists project_id uuid references public.projects(id) on delete set null;
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references public."user"(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  status text not null default 'registered' check (status in ('registered','attended','cancelled')),
  created_at timestamptz not null default now(),
  unique (event_id, email)
);
alter table public.event_registrations add column if not exists user_id uuid references public."user"(id) on delete set null;
create table if not exists public.volunteer_assignments (
  id uuid primary key default gen_random_uuid(),
  volunteer_application_id text not null references public.volunteer_applications(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  role text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'assigned' check (status in ('assigned','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (project_id is not null or event_id is not null),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create table if not exists public.volunteer_time_entries (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.volunteer_assignments(id) on delete cascade,
  service_date date not null,
  hours numeric(6,2) not null check (hours > 0 and hours <= 24),
  notes text,
  approved_by uuid references public."user"(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Gallery and documents.
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  media_type text not null default 'image' check (media_type in ('image','video','document')),
  url text not null,
  caption text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_items add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.gallery_items drop constraint if exists gallery_items_media_type_check;
alter table public.gallery_items add constraint gallery_items_media_type_check check (media_type in ('image','video','document'));

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_id text unique not null,
  title text not null,
  category text not null,
  folder text not null default 'public',
  description text,
  owner text default 'Admin',
  owner_user_id uuid references public."user"(id) on delete set null,
  version text default 'v1.0',
  issue_date date,
  expiry_date date,
  visibility text not null default 'internal' check (visibility in ('public','internal','restricted')),
  status text not null default 'draft' check (status in ('draft','under_review','approved','published','archived')),
  tags jsonb not null default '[]'::jsonb,
  file_url text,
  file_size_mb numeric(12,3) not null default 0 check (file_size_mb >= 0),
  project text,
  campaign text,
  event text,
  focus_area text,
  project_id uuid references public.projects(id) on delete set null,
  campaign_id integer references public.campaigns(id) on delete set null,
  downloads integer not null default 0 check (downloads >= 0),
  views integer not null default 0 check (views >= 0),
  shares integer not null default 0 check (shares >= 0),
  versions jsonb not null default '[]'::jsonb,
  is_compliance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.documents add column if not exists owner_user_id uuid references public."user"(id) on delete set null;
alter table public.documents add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.documents add column if not exists campaign_id integer references public.campaigns(id) on delete set null;
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  file_url text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'),
  change_log text,
  created_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);
create table if not exists public.document_approvals (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_id uuid references public.document_versions(id) on delete cascade,
  reviewer_id uuid references public."user"(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','changes_requested')),
  comments text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- Payments, recurring giving and receipts.
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete set null,
  campaign_id integer references public.campaigns(id) on delete set null,
  campaign_slug text,
  campaign_title text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  is_anonymous boolean not null default false,
  donor_name text,
  donor_email text,
  donor_phone text,
  pan_number text,
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  payment_gateway text not null default 'razorpay',
  donation_type text not null default 'one_time' check (donation_type in ('one_time','recurring','offline')),
  donor_message text,
  razorpay_order_id text,
  razorpay_payment_id text,
  checkout_token_hash text,
  paid_at timestamptz,
  receipt_number text unique,
  receipt_generated boolean not null default false,
  receipt_sent boolean not null default false,
  receipt_downloaded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.donations add column if not exists pan_number text;
alter table public.donations add column if not exists payment_gateway text not null default 'razorpay';
alter table public.donations add column if not exists donation_type text not null default 'one_time';
alter table public.donations add column if not exists donor_message text;
alter table public.donations add column if not exists receipt_generated boolean not null default false;
alter table public.donations add column if not exists receipt_sent boolean not null default false;
alter table public.donations add column if not exists receipt_downloaded boolean not null default false;
alter table public.donations add column if not exists checkout_token_hash text;
alter table public.donations add column if not exists paid_at timestamptz;
create unique index if not exists donations_razorpay_order_uidx
  on public.donations (razorpay_order_id) where razorpay_order_id is not null;
create unique index if not exists donations_razorpay_payment_uidx
  on public.donations (razorpay_payment_id) where razorpay_payment_id is not null;

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid references public.donations(id) on delete restrict,
  gateway text not null,
  gateway_order_id text,
  gateway_payment_id text,
  gateway_event_id text,
  transaction_type text not null check (transaction_type in ('authorization','capture','payment','refund','chargeback','settlement')),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('created','pending','authorized','captured','failed','refunded','partially_refunded','disputed','settled')),
  idempotency_key text unique,
  gateway_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique nulls not distinct (gateway, gateway_payment_id, transaction_type)
);
create unique index if not exists payment_transactions_gateway_order_type_uidx
  on public.payment_transactions (gateway, gateway_order_id, transaction_type)
  where gateway_order_id is not null;
create unique index if not exists payment_transactions_gateway_event_uidx
  on public.payment_transactions (gateway, gateway_event_id)
  where gateway_event_id is not null;
create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  gateway text not null,
  gateway_event_id text not null,
  event_type text not null,
  payload_sha256 text not null,
  status text not null default 'processing' check (status in ('processing','processed','ignored','failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gateway, gateway_event_id)
);
create table if not exists public.recurring_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete set null,
  campaign_id integer references public.campaigns(id) on delete set null,
  gateway text not null,
  gateway_subscription_id text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  interval_unit text not null check (interval_unit in ('week','month','quarter','year')),
  interval_count integer not null default 1 check (interval_count > 0),
  donor_name text,
  donor_email text,
  donor_phone text,
  status text not null default 'active' check (status in ('pending','active','paused','cancelled','completed','failed')),
  starts_at timestamptz not null,
  next_charge_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_subscription_id)
);
create table if not exists public.recurring_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  recurring_donation_id uuid not null references public.recurring_donations(id) on delete cascade,
  donation_id uuid references public.donations(id) on delete set null,
  payment_transaction_id uuid references public.payment_transactions(id) on delete set null,
  scheduled_for timestamptz not null,
  attempted_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','processing','succeeded','failed','skipped')),
  failure_code text,
  failure_message text,
  attempt_number integer not null default 1 check (attempt_number > 0),
  created_at timestamptz not null default now(),
  unique (recurring_donation_id, scheduled_for, attempt_number)
);
create table if not exists public.donation_ops_meta (
  donation_id uuid primary key references public.donations(id) on delete cascade,
  source text,
  gateway text,
  payment_method text,
  tax_exemption text,
  compliance_type text default 'Domestic',
  notes text,
  verified_at timestamptz,
  requested_info_at timestamptz,
  receipt_sent_at timestamptz,
  receipt_downloaded_at timestamptz,
  refund_status text default 'none' check (refund_status in ('none','requested','approved','processing','completed','rejected')),
  refund_reason text,
  pending_documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.donation_receipts (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations(id) on delete restrict,
  receipt_number text not null unique,
  financial_year text not null,
  receipt_type text not null default '80G',
  pdf_url text,
  checksum_sha256 text,
  receipt_snapshot jsonb not null default '{}'::jsonb,
  verification_token_hash text,
  generated_at timestamptz not null default now(),
  emailed_at timestamptz,
  downloaded_at timestamptz
);
alter table public.donation_receipts add column if not exists receipt_snapshot jsonb not null default '{}'::jsonb;
alter table public.donation_receipts add column if not exists verification_token_hash text;
-- Existing duplicate receipt cleanup is intentionally excluded from this schema migration.
create unique index if not exists donation_receipts_donation_uidx on public.donation_receipts (donation_id);
create unique index if not exists donation_receipts_verification_token_uidx
  on public.donation_receipts (verification_token_hash) where verification_token_hash is not null;
create table if not exists public.donation_refunds (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations(id) on delete restrict,
  payment_transaction_id uuid references public.payment_transactions(id) on delete set null,
  gateway_refund_id text unique,
  reason text not null,
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','approved','processing','completed','rejected')),
  notes text,
  initiated_by uuid references public."user"(id) on delete set null,
  initiated_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.donation_refunds add column if not exists payment_transaction_id uuid references public.payment_transactions(id) on delete set null;
alter table public.donation_refunds add column if not exists gateway_refund_id text unique;
create table if not exists public.payment_reconciliation (
  id uuid primary key default gen_random_uuid(),
  gateway text not null default 'razorpay',
  period_start date not null,
  period_end date not null,
  gateway_amount numeric(14,2) not null default 0,
  bank_amount numeric(14,2) not null default 0,
  variance numeric(14,2) generated always as (gateway_amount - bank_amount) stored,
  status text not null default 'pending' check (status in ('pending','matched','variance','review')),
  notes text,
  reconciled_by uuid references public."user"(id) on delete set null,
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (gateway, period_start, period_end)
);

-- Finance and immutable accounting source records.
create table if not exists public.fiscal_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'open' check (status in ('open','closing','closed','locked')),
  closed_by uuid references public."user"(id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create table if not exists public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  account_type text not null check (account_type in ('asset','liability','equity','income','expense')),
  parent_id uuid references public.chart_of_accounts(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_number bigint generated always as identity unique,
  fiscal_period_id uuid not null references public.fiscal_periods(id) on delete restrict,
  entry_date date not null,
  description text not null,
  source_type text,
  source_id text,
  status text not null default 'draft' check (status in ('draft','posted','reversed')),
  posted_by uuid references public."user"(id) on delete set null,
  posted_at timestamptz,
  reversal_of uuid references public.journal_entries(id) on delete restrict,
  created_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  unique nulls not distinct (source_type, source_id)
);
create table if not exists public.journal_entry_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries(id) on delete restrict,
  account_id uuid not null references public.chart_of_accounts(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  campaign_id integer references public.campaigns(id) on delete set null,
  description text,
  debit numeric(14,2) not null default 0 check (debit >= 0),
  credit numeric(14,2) not null default 0 check (credit >= 0),
  created_at timestamptz not null default now(),
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0))
);
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  category text not null,
  description text not null,
  vendor_name text,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'INR',
  expense_date date not null default current_date,
  payment_method text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  reference text,
  approved_by uuid references public."user"(id) on delete set null,
  paid_at timestamptz,
  admin_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.expenses add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.expenses add column if not exists vendor_name text;
alter table public.expenses add column if not exists currency text not null default 'INR';
alter table public.expenses add column if not exists payment_method text;
alter table public.expenses add column if not exists paid_at timestamptz;
alter table public.expenses add column if not exists admin_meta jsonb not null default '{}'::jsonb;
create table if not exists public.income_records (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('donation','membership','grant','csr','other')),
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'INR',
  income_date date not null default current_date,
  reference_id text,
  project_id uuid references public.projects(id) on delete set null,
  campaign_id integer references public.campaigns(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.income_records add column if not exists currency text not null default 'INR';
alter table public.income_records add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.income_records add column if not exists campaign_id integer references public.campaigns(id) on delete set null;
create table if not exists public.grants (
  id uuid primary key default gen_random_uuid(),
  grant_number text unique,
  name text not null,
  funder_name text not null,
  amount_awarded numeric(14,2) not null check (amount_awarded >= 0),
  amount_received numeric(14,2) not null default 0 check (amount_received >= 0),
  amount_spent numeric(14,2) not null default 0 check (amount_spent >= 0),
  starts_on date,
  ends_on date,
  status text not null default 'prospect' check (status in ('prospect','applied','awarded','active','completed','rejected','cancelled')),
  restrictions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create table if not exists public.grant_projects (
  grant_id uuid not null references public.grants(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  allocated_amount numeric(14,2) not null default 0 check (allocated_amount >= 0),
  primary key (grant_id, project_id)
);
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  fiscal_period_id uuid not null references public.fiscal_periods(id) on delete restrict,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft','approved','locked','archived')),
  approved_by uuid references public."user"(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique nulls not distinct (fiscal_period_id, project_id, name)
);
create table if not exists public.budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  account_id uuid not null references public.chart_of_accounts(id) on delete restrict,
  amount numeric(14,2) not null check (amount >= 0),
  notes text,
  unique (budget_id, account_id)
);
create table if not exists public.finance_ledger_locks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  locked_at timestamptz not null default now(),
  locked_by uuid references public."user"(id) on delete set null,
  unique (source_type, source_id)
);

-- Settings, communications and reporting.
create table if not exists public.app_settings (
  namespace text not null,
  key text not null,
  value jsonb not null,
  is_secret boolean not null default false,
  updated_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (namespace, key)
);
create table if not exists public.payment_gateway_configs (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  mode text not null default 'live' check (mode in ('live','test')),
  status text not null default 'disabled' check (status in ('connected','disabled')),
  public_config jsonb not null default '{}'::jsonb,
  secret_reference text,
  webhook_url text,
  settlement_account text,
  updated_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  channel text not null check (channel in ('email','sms','whatsapp','push','in_app')),
  subject text,
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, channel)
);
create table if not exists public.workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  module text not null,
  steps jsonb not null check (jsonb_typeof(steps) = 'array'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.report_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  category text not null check (category in ('impact','financial','donor','volunteer','beneficiary','campaign','project','grant','compliance','operational','board','analytics')),
  description text,
  parameters jsonb not null default '{}'::jsonb,
  formats text[] not null default array['pdf']::text[],
  query_key text not null,
  is_active boolean not null default true,
  created_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (formats <@ array['pdf','excel','csv','dashboard']::text[])
);
create table if not exists public.report_schedules (
  id uuid primary key default gen_random_uuid(),
  report_definition_id uuid not null references public.report_definitions(id) on delete cascade,
  frequency text not null check (frequency in ('daily','weekly','monthly','quarterly','annually')),
  parameters jsonb not null default '{}'::jsonb,
  recipients text[] not null default '{}'::text[],
  next_run_at timestamptz not null,
  last_run_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.report_runs (
  id uuid primary key default gen_random_uuid(),
  report_definition_id uuid not null references public.report_definitions(id) on delete restrict,
  schedule_id uuid references public.report_schedules(id) on delete set null,
  requested_by uuid references public."user"(id) on delete set null,
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);
create table if not exists public.report_exports (
  id uuid primary key default gen_random_uuid(),
  report_run_id uuid not null references public.report_runs(id) on delete cascade,
  format text not null check (format in ('pdf','excel','csv','dashboard')),
  storage_path text not null,
  checksum_sha256 text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  template text,
  status text not null default 'queued' check (status in ('queued','processing','sent','failed')),
  error_message text,
  event_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.email_logs add column if not exists event_key text;
alter table public.email_logs drop constraint if exists email_logs_status_check;
alter table public.email_logs add constraint email_logs_status_check
  check (status in ('queued','processing','sent','failed'));
create unique index if not exists email_logs_event_key_uidx
  on public.email_logs (event_key) where event_key is not null;
create table if not exists public.verification_records (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('donation_receipt','membership_certificate','volunteer_id','internship_certificate')),
  holder_name text not null,
  reference_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  valid_until date,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  old_data jsonb,
  new_data jsonb,
  severity text not null default 'info' check (severity in ('debug','info','warning','error','critical')),
  ip_address inet,
  device text,
  browser text,
  request_id uuid,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.audit_logs add column if not exists old_data jsonb;
alter table public.audit_logs add column if not exists new_data jsonb;
alter table public.audit_logs add column if not exists severity text not null default 'info';
alter table public.audit_logs add column if not exists device text;
alter table public.audit_logs add column if not exists browser text;
alter table public.audit_logs add column if not exists request_id uuid;
alter table public.audit_logs add column if not exists occurred_at timestamptz not null default now();
-- Legacy ip_address was text; retain that type on upgraded databases for compatibility.

-- Foreign-key and access-path indexes.
create index if not exists idx_admin_users_role_id on public.admin_users(role_id);
create index if not exists idx_admin_users_department_id on public.admin_users(department_id);
create index if not exists idx_admin_users_manager_id on public.admin_users(reporting_manager_id);
create index if not exists idx_admin_invitations_role_id on public.admin_invitations(role_id);
create index if not exists idx_admin_invitations_department_id on public.admin_invitations(department_id);
create unique index if not exists idx_admin_invitations_pending_email
  on public.admin_invitations (lower(email))
  where status = 'pending';
create index if not exists idx_enquiries_status_created on public.enquiries(status, created_at desc);
create index if not exists idx_volunteer_applications_user on public.volunteer_applications(user_id);
create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_internships_user on public.internships(user_id);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_featured on public.campaigns(featured) where featured = 1;
create index if not exists idx_blogs_status_published on public.blogs(status, published_at desc);
create index if not exists idx_cms_sections_page on public.cms_sections(page_id, sort_order);
create index if not exists idx_projects_focus_area_id on public.projects(focus_area_id);
create index if not exists idx_project_milestones_project on public.project_milestones(project_id);
create index if not exists idx_project_tasks_project on public.project_tasks(project_id);
create index if not exists idx_beneficiaries_project on public.beneficiaries(project_id);
create index if not exists idx_beneficiary_support_beneficiary on public.beneficiary_support(beneficiary_id);
create index if not exists idx_events_project on public.events(project_id);
create index if not exists idx_event_registrations_event on public.event_registrations(event_id);
create index if not exists idx_volunteer_assignments_application on public.volunteer_assignments(volunteer_application_id);
create index if not exists idx_volunteer_time_assignment on public.volunteer_time_entries(assignment_id);
create index if not exists idx_gallery_items_album on public.gallery_items(album_id, sort_order);
create index if not exists idx_documents_project on public.documents(project_id);
create index if not exists idx_documents_campaign on public.documents(campaign_id);
create index if not exists idx_document_versions_document on public.document_versions(document_id);
create index if not exists idx_document_approvals_document on public.document_approvals(document_id);
create index if not exists idx_donations_user_created on public.donations(user_id, created_at desc);
create index if not exists idx_donations_campaign on public.donations(campaign_id);
create index if not exists idx_donations_status_created on public.donations(status, created_at desc);
create index if not exists idx_payment_transactions_donation on public.payment_transactions(donation_id);
create index if not exists idx_recurring_donations_user on public.recurring_donations(user_id);
create index if not exists idx_recurring_attempts_subscription on public.recurring_payment_attempts(recurring_donation_id, scheduled_for);
create index if not exists idx_receipts_donation on public.donation_receipts(donation_id);
create index if not exists idx_refunds_donation on public.donation_refunds(donation_id);
create index if not exists idx_journal_entries_period on public.journal_entries(fiscal_period_id, entry_date);
create index if not exists idx_journal_lines_entry on public.journal_entry_lines(journal_entry_id);
create index if not exists idx_journal_lines_account on public.journal_entry_lines(account_id);
create index if not exists idx_expenses_project on public.expenses(project_id);
create index if not exists idx_income_project on public.income_records(project_id);
create index if not exists idx_report_schedules_definition on public.report_schedules(report_definition_id);
create index if not exists idx_report_runs_definition on public.report_runs(report_definition_id, created_at desc);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id, occurred_at desc);
create index if not exists idx_audit_user on public.audit_logs(user_id, occurred_at desc);

-- Sequence alignment preserves legacy identifiers without count(*) races.
select setval(
  'public.receipt_number_seq',
  greatest(coalesce((select max(nullif(regexp_replace(receipt_number, '^.*-', ''), '')::bigint)
    from public.donations where receipt_number ~ '^SVD-80G-[0-9]{4}-[0-9]+$'), 0), 1),
  coalesce((select count(*) > 0 from public.donations where receipt_number ~ '^SVD-80G-[0-9]{4}-[0-9]+$'), false)
);
select setval(
  'public.member_number_seq',
  greatest(coalesce((select max(nullif(regexp_replace(member_id, '^.*-', ''), '')::bigint)
    from public.memberships where member_id ~ '^SVD-MEM-[0-9]{4}-[0-9]+$'), 0), 1),
  coalesce((select count(*) > 0 from public.memberships where member_id ~ '^SVD-MEM-[0-9]{4}-[0-9]+$'), false)
);
select setval(
  'public.certificate_number_seq',
  greatest(coalesce((select max(nullif(regexp_replace(certificate_number, '^.*-', ''), '')::bigint)
    from public.memberships where certificate_number ~ '^SVD-CERT-[0-9]{4}-[0-9]+$'), 0), 1),
  coalesce((select count(*) > 0 from public.memberships where certificate_number ~ '^SVD-CERT-[0-9]{4}-[0-9]+$'), false)
);
