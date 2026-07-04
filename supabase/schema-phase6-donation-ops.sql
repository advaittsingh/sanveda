-- Phase 6: Donation operations — persistent admin workflow, receipts, refunds, reconciliation

-- Extend donations with compliance fields
alter table public.donations add column if not exists pan_number text;
alter table public.donations add column if not exists payment_gateway text default 'razorpay';
alter table public.donations add column if not exists donation_type text default 'one_time';
alter table public.donations add column if not exists donor_message text;
alter table public.donations add column if not exists receipt_generated boolean default false;
alter table public.donations add column if not exists receipt_sent boolean default false;
alter table public.donations add column if not exists receipt_downloaded boolean default false;

create table if not exists public.donation_ops_meta (
  donation_id uuid primary key references public.donations(id) on delete cascade,
  source text,
  gateway text,
  payment_method text,
  tax_exemption text default '80G',
  compliance_type text default 'Domestic',
  notes text,
  verified_at timestamptz,
  requested_info_at timestamptz,
  receipt_sent_at timestamptz,
  receipt_downloaded_at timestamptz,
  refund_status text default 'none' check (refund_status in ('none','requested','approved','processing','completed','rejected')),
  refund_reason text,
  pending_documents jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donation_receipts (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations(id) on delete cascade,
  receipt_number text not null,
  financial_year text,
  receipt_type text default '80G',
  pdf_url text,
  generated_at timestamptz not null default now(),
  emailed_at timestamptz,
  downloaded_at timestamptz
);

create index if not exists idx_donation_receipts_donation on public.donation_receipts(donation_id);
create index if not exists idx_donation_receipts_number on public.donation_receipts(receipt_number);

create table if not exists public.donation_refunds (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations(id) on delete cascade,
  reason text not null,
  amount numeric not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','approved','processing','completed','rejected')),
  notes text,
  initiated_by uuid references auth.users(id),
  initiated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_donation_refunds_donation on public.donation_refunds(donation_id);
create index if not exists idx_donation_refunds_status on public.donation_refunds(status);

create table if not exists public.payment_reconciliation (
  id uuid primary key default gen_random_uuid(),
  period_start date,
  period_end date,
  gateway_amount numeric not null default 0,
  bank_amount numeric not null default 0,
  variance numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','matched','variance','review')),
  notes text,
  reconciled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.donation_ops_meta enable row level security;
alter table public.donation_receipts enable row level security;
alter table public.donation_refunds enable row level security;
alter table public.payment_reconciliation enable row level security;

drop policy if exists "Finance can manage donation ops meta" on public.donation_ops_meta;
create policy "Finance can manage donation ops meta"
  on public.donation_ops_meta for all
  using (public.admin_has_module('donations'))
  with check (public.admin_has_module('donations'));

drop policy if exists "Finance can manage donation receipts" on public.donation_receipts;
create policy "Finance can manage donation receipts"
  on public.donation_receipts for all
  using (public.admin_has_module('donations'))
  with check (public.admin_has_module('donations'));

drop policy if exists "Finance can manage donation refunds" on public.donation_refunds;
create policy "Finance can manage donation refunds"
  on public.donation_refunds for all
  using (public.admin_has_module('donations'))
  with check (public.admin_has_module('donations'));

drop policy if exists "Finance can manage payment reconciliation" on public.payment_reconciliation;
create policy "Finance can manage payment reconciliation"
  on public.payment_reconciliation for all
  using (public.admin_has_module('donations'))
  with check (public.admin_has_module('donations'));

create index if not exists idx_donations_status on public.donations(status);
create index if not exists idx_donations_created_at on public.donations(created_at desc);
create index if not exists idx_donations_receipt on public.donations(receipt_number) where receipt_number is not null;
