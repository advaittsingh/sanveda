-- Admin review / approval for volunteer and intern task proof of work.
-- Production: apply via scripts/apply-migrations.sh

alter table public.volunteer_tasks
  add column if not exists approval_status text not null default 'unreviewed'
    check (approval_status in ('unreviewed', 'approved', 'rejected', 'changes_requested')),
  add column if not exists approved_by uuid references public."user"(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists approval_notes text;

alter table public.intern_tasks
  add column if not exists approval_status text not null default 'unreviewed'
    check (approval_status in ('unreviewed', 'approved', 'rejected', 'changes_requested')),
  add column if not exists approved_by uuid references public."user"(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists approval_notes text;
