-- Internship ↔ project assignments (mirror of volunteer_assignments).
-- Production: apply via scripts/apply-migrations.sh before using intern assign UI.

create table if not exists public.internship_assignments (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'assigned'
    check (status in ('assigned', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists internship_assignments_internship_idx
  on public.internship_assignments(internship_id);

create index if not exists internship_assignments_project_idx
  on public.internship_assignments(project_id);

-- At most one active link per intern + project.
create unique index if not exists internship_assignments_active_unique
  on public.internship_assignments(internship_id, project_id)
  where status in ('assigned', 'active');

-- Human-readable task owner when assigned_to (auth user) is null.
alter table public.project_tasks
  add column if not exists assigned_name text;
