-- Fix guest/anonymous donation checkout blocked by RLS.
-- Cause: INSERT ... RETURNING (PostgREST .select()) requires a SELECT policy.
-- Guests insert with user_id NULL, so "Users can read own donations" never matches.

grant usage on schema public to anon, authenticated;
grant select, insert on public.donations to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

drop policy if exists "Anyone can create donation" on public.donations;
create policy "Anyone can create pending donation"
  on public.donations
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and (user_id is null or user_id = (select auth.uid()))
  );

-- Allow donors to read their own rows; admins keep existing policy.
drop policy if exists "Users can read own donations" on public.donations;
create policy "Users can read own donations"
  on public.donations
  for select
  to anon, authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
  );

-- SECURITY DEFINER RPC so checkout can create + return the pending row
-- without depending on SELECT RLS for anonymous guests.
create or replace function public.create_pending_donation(
  p_campaign_title text,
  p_amount numeric,
  p_currency text default 'INR',
  p_campaign_id int default null,
  p_campaign_slug text default null,
  p_is_anonymous boolean default false,
  p_donor_name text default null,
  p_donor_email text default null,
  p_donor_phone text default null,
  p_user_id uuid default null
)
returns public.donations
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.donations;
  v_user uuid := auth.uid();
  v_bind uuid;
begin
  if p_campaign_title is null or length(trim(p_campaign_title)) = 0 then
    raise exception 'campaign_title is required';
  end if;

  if p_amount is null or p_amount < 1 then
    raise exception 'Minimum donation amount is 1';
  end if;

  -- Never trust client-supplied user_id over the session.
  if v_user is not null then
    v_bind := v_user;
  else
    v_bind := null;
  end if;

  insert into public.donations (
    user_id,
    campaign_id,
    campaign_slug,
    campaign_title,
    amount,
    currency,
    is_anonymous,
    donor_name,
    donor_email,
    donor_phone,
    status
  ) values (
    v_bind,
    p_campaign_id,
    p_campaign_slug,
    trim(p_campaign_title),
    p_amount,
    coalesce(nullif(trim(p_currency), ''), 'INR'),
    coalesce(p_is_anonymous, false),
    case when coalesce(p_is_anonymous, false) then null else nullif(trim(p_donor_name), '') end,
    nullif(trim(p_donor_email), ''),
    nullif(trim(p_donor_phone), ''),
    'pending'
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function public.create_pending_donation(
  text, numeric, text, int, text, boolean, text, text, text, uuid
) from public;

grant execute on function public.create_pending_donation(
  text, numeric, text, int, text, boolean, text, text, text, uuid
) to anon, authenticated;
