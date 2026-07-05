-- Phase 9: Featured campaigns flag for public homepage carousel

alter table public.campaigns
  add column if not exists featured int not null default 0;

-- Backfill from admin wizard metadata
update public.campaigns
set featured = 1
where featured = 0
  and coalesce((admin_meta->>'featured')::boolean, false) = true;

create index if not exists idx_campaigns_featured on public.campaigns(featured) where featured = 1;
