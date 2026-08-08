-- Persisted operational workflows for programme delivery and relationship management.
-- This migration is data-free: existing records remain nullable until explicitly updated.

alter table public.projects
  add column if not exists project_code text unique,
  add column if not exists lifecycle_stage text,
  add column if not exists priority text,
  add column if not exists location text,
  add column if not exists received_funds numeric(14,2);
alter table public.beneficiaries
  add column if not exists beneficiary_code text unique,
  add column if not exists pipeline_stage text,
  add column if not exists priority text,
  add column if not exists case_worker text,
  add column if not exists assigned_team text,
  add column if not exists family_income numeric(14,2);
alter table public.volunteer_applications
  add column if not exists department text,
  add column if not exists emergency_contact text,
  add column if not exists is_team_leader boolean;
alter table public.internships
  add column if not exists intern_code text unique,
  add column if not exists pipeline_stage text,
  add column if not exists program_name text,
  add column if not exists mentor_name text,
  add column if not exists mode text,
  add column if not exists stipend_amount numeric(14,2);
alter table public.memberships
  add column if not exists pipeline_stage text,
  add column if not exists payment_status text,
  add column if not exists activity_status text;
alter table public.events
  add column if not exists event_code text unique,
  add column if not exists category text,
  add column if not exists lifecycle_stage text,
  add column if not exists organizer text,
  add column if not exists campaign_id integer references public.campaigns(id) on delete set null,
  add column if not exists admin_notes text;
alter table public.event_registrations
  add column if not exists registration_code text unique,
  add column if not exists participant_type text;
alter table public.enquiries
  add column if not exists ticket_code text unique,
  add column if not exists category text,
  add column if not exists priority text,
  add column if not exists source text,
  add column if not exists workflow_stage text,
  add column if not exists organization text,
  add column if not exists assigned_team text,
  add column if not exists lead_score integer,
  add column if not exists sla_target_hours numeric(8,2),
  add column if not exists escalated boolean not null default false;

create table if not exists public.project_funding (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_name text not null,
  amount numeric(14,2) not null check (amount >= 0),
  received_on date,
  reference text,
  created_at timestamptz not null default now()
);
create table if not exists public.project_team (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  member_name text not null,
  role text not null,
  user_id uuid references public."user"(id) on delete set null,
  joined_on date,
  ended_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.beneficiary_household_members (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  date_of_birth date,
  occupation text,
  monthly_income numeric(14,2),
  created_at timestamptz not null default now()
);
create table if not exists public.beneficiary_outcomes (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
  label text not null,
  status text,
  measured_value numeric,
  measured_on date,
  completed boolean,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.volunteer_certifications (
  id uuid primary key default gen_random_uuid(),
  volunteer_application_id text not null references public.volunteer_applications(id) on delete cascade,
  name text not null,
  status text not null check (status in ('pending','completed','expired','revoked')),
  issued_on date,
  expires_on date,
  certificate_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.intern_mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  mentor_name text not null,
  scheduled_at timestamptz not null,
  attended boolean,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.intern_tasks (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  score numeric,
  created_at timestamptz not null default now()
);
create table if not exists public.intern_attendance (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  attendance_date date not null,
  hours numeric(6,2),
  attended boolean not null,
  notes text,
  unique (internship_id, attendance_date)
);
create table if not exists public.intern_stipends (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  period_start date not null,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','paid','waived','cancelled')),
  paid_at timestamptz,
  reference text,
  unique (internship_id, period_start)
);

create table if not exists public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  amount numeric(14,2) not null check (amount >= 0),
  payment_date date,
  status text not null check (status in ('pending','paid','waived','failed','refunded')),
  reference text,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.membership_participation (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  participation_type text not null,
  reference_id text,
  label text not null,
  participated_on date,
  attended boolean,
  hours numeric(8,2),
  amount numeric(14,2),
  created_at timestamptz not null default now()
);

create table if not exists public.event_agenda (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  title text not null,
  speaker text,
  sort_order integer not null default 0
);
create table if not exists public.event_staffing (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  staff_name text not null,
  role text not null,
  volunteer_application_id text references public.volunteer_applications(id) on delete set null,
  status text,
  created_at timestamptz not null default now()
);
create table if not exists public.event_sponsorships (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  sponsor_name text not null,
  tier text,
  amount numeric(14,2),
  status text,
  created_at timestamptz not null default now()
);
create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.event_registrations(id) on delete set null,
  attendee_name text not null,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  status text not null check (status in ('registered','attended','cancelled','waitlisted')),
  created_at timestamptz not null default now()
);
create table if not exists public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.event_registrations(id) on delete set null,
  score smallint check (score between 1 and 5),
  comments text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.donor_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  phone text,
  address text,
  donor_type text,
  giving_level text,
  engagement_status text,
  is_monthly boolean,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.donor_communications (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donor_profiles(id) on delete cascade,
  channel text not null,
  direction text not null check (direction in ('inbound','outbound')),
  subject text,
  body text,
  occurred_at timestamptz not null,
  status text,
  created_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.donor_tasks (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donor_profiles(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  assigned_to uuid references public."user"(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiry_messages (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  author_type text not null check (author_type in ('requester','admin')),
  author_name text,
  message text not null,
  sent_at timestamptz not null default now(),
  created_by uuid references public."user"(id) on delete set null
);
create table if not exists public.enquiry_assignments (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  assigned_to uuid references public."user"(id) on delete set null,
  assigned_name text,
  team_name text,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz
);
create table if not exists public.enquiry_sla_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  event_type text not null check (event_type in ('assigned','first_response','paused','resumed','resolved','reopened')),
  occurred_at timestamptz not null,
  notes text
);
create table if not exists public.enquiry_conversions (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  target_type text not null,
  target_id text,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (enquiry_id, target_type)
);

create index if not exists project_funding_project_idx on public.project_funding(project_id);
create index if not exists project_team_project_idx on public.project_team(project_id);
create index if not exists beneficiary_household_beneficiary_idx on public.beneficiary_household_members(beneficiary_id);
create index if not exists beneficiary_outcomes_beneficiary_idx on public.beneficiary_outcomes(beneficiary_id);
create index if not exists volunteer_certifications_volunteer_idx on public.volunteer_certifications(volunteer_application_id);
create index if not exists intern_tasks_internship_idx on public.intern_tasks(internship_id);
create index if not exists intern_attendance_internship_idx on public.intern_attendance(internship_id);
create index if not exists membership_payments_membership_idx on public.membership_payments(membership_id);
create index if not exists membership_participation_membership_idx on public.membership_participation(membership_id);
create index if not exists event_agenda_event_idx on public.event_agenda(event_id);
create index if not exists event_staffing_event_idx on public.event_staffing(event_id);
create index if not exists event_sponsorships_event_idx on public.event_sponsorships(event_id);
create index if not exists event_attendance_event_idx on public.event_attendance(event_id);
create index if not exists event_feedback_event_idx on public.event_feedback(event_id);
create index if not exists donor_communications_donor_idx on public.donor_communications(donor_id);
create index if not exists donor_tasks_donor_idx on public.donor_tasks(donor_id);
create index if not exists enquiry_messages_enquiry_idx on public.enquiry_messages(enquiry_id);
create index if not exists enquiry_assignments_enquiry_idx on public.enquiry_assignments(enquiry_id);
create index if not exists enquiry_sla_events_enquiry_idx on public.enquiry_sla_events(enquiry_id);
create index if not exists enquiry_conversions_enquiry_idx on public.enquiry_conversions(enquiry_id);
