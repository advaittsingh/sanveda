-- Per-volunteer task tracking (mirror of intern_tasks).
-- Production: apply via scripts/apply-migrations.sh before using volunteer task UI.

create table if not exists public.volunteer_tasks (
  id uuid primary key default gen_random_uuid(),
  volunteer_application_id text not null
    references public.volunteer_applications(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  due_date date,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists volunteer_tasks_application_idx
  on public.volunteer_tasks(volunteer_application_id);

create index if not exists volunteer_tasks_project_idx
  on public.volunteer_tasks(project_id);
