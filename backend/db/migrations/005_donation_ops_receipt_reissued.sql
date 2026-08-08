-- Track receipt reissue timestamps on ops meta (used by admin 80G flows).
alter table public.donation_ops_meta
  add column if not exists receipt_reissued_at timestamptz;
