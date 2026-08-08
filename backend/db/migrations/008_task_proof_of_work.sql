-- Proof of work attachments for volunteer and intern tasks.
-- Production: apply via scripts/apply-migrations.sh

alter table public.volunteer_tasks
  add column if not exists proof_url text,
  add column if not exists proof_name text,
  add column if not exists proof_content_type text,
  add column if not exists proof_uploaded_at timestamptz;

alter table public.intern_tasks
  add column if not exists proof_url text,
  add column if not exists proof_name text,
  add column if not exists proof_content_type text,
  add column if not exists proof_uploaded_at timestamptz;
