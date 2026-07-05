-- Phase 8: Campaign admin metadata + expanded workflow statuses

alter table public.campaigns
  add column if not exists admin_meta jsonb default '{}'::jsonb;

-- Expand status values used by the admin wizard
alter table public.campaigns drop constraint if exists campaigns_status_check;
alter table public.campaigns add constraint campaigns_status_check
  check (status in (
    'draft', 'pending', 'active', 'closed',
    'review', 'approved', 'published', 'paused',
    'completed', 'rejected', 'archived'
  ));

-- Public site should show live fundraising campaigns
drop policy if exists "Public can read active campaigns" on public.campaigns;
create policy "Public can read active campaigns"
  on public.campaigns for select
  using (status in ('active', 'published', 'approved'));

create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_admin_meta on public.campaigns using gin (admin_meta);
