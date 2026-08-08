-- Monthly autopay: Razorpay subscription binding + reusable plans per cause/amount.

alter table public.donations
  add column if not exists razorpay_subscription_id text;

create unique index if not exists donations_razorpay_subscription_uidx
  on public.donations (razorpay_subscription_id)
  where razorpay_subscription_id is not null;

alter table public.recurring_donations
  add column if not exists gateway_plan_id text;

alter table public.recurring_donations
  add column if not exists seed_donation_id uuid references public.donations(id) on delete set null;

create table if not exists public.recurring_plans (
  id uuid primary key default gen_random_uuid(),
  gateway text not null default 'razorpay',
  campaign_id integer references public.campaigns(id) on delete set null,
  amount_paise bigint not null check (amount_paise >= 100),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  interval_unit text not null default 'month' check (interval_unit in ('week','month','quarter','year')),
  interval_count integer not null default 1 check (interval_count > 0),
  gateway_plan_id text not null,
  plan_name text not null,
  created_at timestamptz not null default now(),
  unique (gateway, gateway_plan_id)
);

create unique index if not exists recurring_plans_cause_amount_uidx
  on public.recurring_plans (
    gateway,
    coalesce(campaign_id, 0),
    amount_paise,
    currency,
    interval_unit,
    interval_count
  );

create or replace function public.prepare_razorpay_order(
  p_donation_id uuid,
  p_checkout_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare result public.donations;
begin
  select * into result from public.donations where id = p_donation_id for update;
  if not found
    or result.checkout_token_hash is null
    or result.checkout_token_hash <> private.sha256_hex(coalesce(p_checkout_token, '')) then
    raise exception 'donation not found' using errcode = 'P0002';
  end if;
  if result.status not in ('pending', 'completed') then
    raise exception 'donation is not payable' using errcode = '22023';
  end if;
  return jsonb_build_object(
    'id', result.id, 'status', result.status,
    'amountPaise', (result.amount * 100)::bigint,
    'currency', result.currency,
    'orderId', result.razorpay_order_id,
    'donationType', result.donation_type,
    'receipt', 'd_' || left(replace(result.id::text, '-', ''), 32)
  );
end;
$$;

create or replace function public.prepare_razorpay_subscription(
  p_donation_id uuid,
  p_checkout_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare result public.donations;
begin
  select * into result from public.donations where id = p_donation_id for update;
  if not found
    or result.checkout_token_hash is null
    or result.checkout_token_hash <> private.sha256_hex(coalesce(p_checkout_token, '')) then
    raise exception 'donation not found' using errcode = 'P0002';
  end if;
  if result.donation_type <> 'recurring' then
    raise exception 'donation is not a monthly subscription checkout' using errcode = '22023';
  end if;
  if result.status not in ('pending', 'completed') then
    raise exception 'donation is not payable' using errcode = '22023';
  end if;
  return jsonb_build_object(
    'id', result.id,
    'status', result.status,
    'amountPaise', (result.amount * 100)::bigint,
    'currency', result.currency,
    'subscriptionId', result.razorpay_subscription_id,
    'campaignId', result.campaign_id,
    'campaignTitle', result.campaign_title,
    'donorName', result.donor_name,
    'donorEmail', result.donor_email,
    'donorPhone', result.donor_phone,
    'userId', result.user_id
  );
end;
$$;

create or replace function public.bind_razorpay_subscription(
  p_donation_id uuid,
  p_checkout_token text,
  p_subscription_id text,
  p_plan_id text,
  p_amount_paise bigint,
  p_currency text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
  recurring_id uuid;
begin
  select * into result from public.donations where id = p_donation_id for update;
  if not found
    or result.checkout_token_hash is null
    or result.checkout_token_hash <> private.sha256_hex(coalesce(p_checkout_token, '')) then
    raise exception 'donation not found' using errcode = 'P0002';
  end if;
  if result.donation_type <> 'recurring'
    or result.status <> 'pending'
    or (result.amount * 100)::bigint <> p_amount_paise
    or result.currency <> upper(trim(p_currency)) then
    raise exception 'subscription does not match pending monthly donation' using errcode = '22023';
  end if;
  if result.razorpay_subscription_id is not null
    and result.razorpay_subscription_id <> trim(p_subscription_id) then
    raise exception 'donation already has a different subscription' using errcode = '23505';
  end if;

  update public.donations
    set razorpay_subscription_id = trim(p_subscription_id),
        updated_at = now()
    where id = result.id
      and razorpay_subscription_id is null;

  insert into public.recurring_donations (
    user_id, campaign_id, gateway, gateway_subscription_id, gateway_plan_id,
    amount, currency, interval_unit, interval_count,
    donor_name, donor_email, donor_phone, status, starts_at, seed_donation_id
  ) values (
    result.user_id, result.campaign_id, 'razorpay', trim(p_subscription_id), nullif(trim(p_plan_id), ''),
    result.amount, result.currency, 'month', 1,
    result.donor_name, result.donor_email, result.donor_phone, 'pending', now(), result.id
  )
  on conflict (gateway, gateway_subscription_id) do update
    set gateway_plan_id = coalesce(excluded.gateway_plan_id, public.recurring_donations.gateway_plan_id),
        seed_donation_id = coalesce(public.recurring_donations.seed_donation_id, excluded.seed_donation_id),
        updated_at = now()
  returning id into recurring_id;

  return coalesce(result.razorpay_subscription_id, trim(p_subscription_id));
end;
$$;

create or replace function public.settle_razorpay_subscription_payment(
  p_subscription_id text,
  p_payment_id text,
  p_amount_paise bigint,
  p_currency text,
  p_event_id text default null,
  p_gateway_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
  receipt_no text;
  snapshot jsonb;
  recurring public.recurring_donations;
begin
  select * into result
  from public.donations
  where razorpay_subscription_id = trim(p_subscription_id)
  for update;
  if not found then
    raise exception 'bound subscription donation not found' using errcode = 'P0002';
  end if;
  if (result.amount * 100)::bigint <> p_amount_paise or result.currency <> upper(trim(p_currency)) then
    raise exception 'payment amount or currency mismatch' using errcode = '22023';
  end if;
  if result.status = 'completed' then
    if result.razorpay_payment_id is not null and result.razorpay_payment_id <> trim(p_payment_id) then
      raise exception 'donation completed with a different payment' using errcode = '23505';
    end if;
    update public.recurring_donations
      set status = 'active',
          next_charge_at = coalesce(next_charge_at, now() + interval '1 month'),
          updated_at = now()
      where gateway = 'razorpay'
        and gateway_subscription_id = trim(p_subscription_id)
        and status in ('pending', 'active');
    return jsonb_build_object('donation', to_jsonb(result) - 'checkout_token_hash', 'alreadyCompleted', true);
  end if;
  if result.status <> 'pending' then
    raise exception 'donation cannot be completed from status %', result.status using errcode = '22023';
  end if;

  receipt_no := 'SVD-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.receipt_number_seq')::text, 7, '0');
  update public.donations
  set status = 'completed',
      razorpay_payment_id = trim(p_payment_id),
      receipt_number = receipt_no,
      receipt_generated = true,
      paid_at = now(),
      updated_at = now()
  where id = result.id
  returning * into result;

  snapshot := jsonb_build_object(
    'receiptNumber', receipt_no,
    'donationId', result.id,
    'donorName', case when result.is_anonymous then 'Anonymous Donor' else result.donor_name end,
    'donorEmail', case when result.is_anonymous then null else result.donor_email end,
    'donorPhone', case when result.is_anonymous then null else result.donor_phone end,
    'isAnonymous', result.is_anonymous,
    'amount', result.amount,
    'currency', result.currency,
    'campaignTitle', result.campaign_title,
    'paymentId', result.razorpay_payment_id,
    'paidAt', result.paid_at,
    'pan', result.pan_number,
    'taxEligible', false,
    'donationType', 'recurring'
  );
  insert into public.donation_receipts (
    donation_id, receipt_number, financial_year, receipt_type,
    checksum_sha256, receipt_snapshot, verification_token_hash
  ) values (
    result.id, receipt_no,
    case when extract(month from current_date) >= 4
      then extract(year from current_date)::text || '-' || right((extract(year from current_date)::int + 1)::text, 2)
      else (extract(year from current_date)::int - 1)::text || '-' || right(extract(year from current_date)::text, 2)
    end,
    'DONATION',
    private.sha256_hex(snapshot::text),
    snapshot,
    result.checkout_token_hash
  ) on conflict (donation_id) do nothing;

  insert into public.payment_transactions (
    donation_id, gateway, gateway_order_id, gateway_payment_id, gateway_event_id,
    transaction_type, amount, currency, status, idempotency_key, gateway_payload, occurred_at
  ) values (
    result.id, 'razorpay', trim(p_subscription_id), trim(p_payment_id), nullif(trim(p_event_id), ''),
    'payment', result.amount, result.currency, 'captured',
    'razorpay:payment:' || trim(p_payment_id), coalesce(p_gateway_payload, '{}'::jsonb), now()
  ) on conflict (idempotency_key) do nothing;

  if result.campaign_id is not null then
    update public.campaigns
      set raised = raised + result.amount, total_donors = total_donors + 1, updated_at = now()
      where id = result.campaign_id;
  end if;
  insert into public.income_records (
    source, description, amount, currency, income_date, reference_id, campaign_id
  ) values (
    'donation', result.campaign_title || ' (monthly)', result.amount, result.currency,
    current_date, result.id::text, result.campaign_id
  ) on conflict (reference_id) where source = 'donation' do nothing;
  if result.donor_email is not null then
    insert into public.email_logs (recipient, subject, template, status, event_key, metadata)
    values (
      result.donor_email, 'Thank you for your monthly donation — ' || receipt_no,
      'donation_receipt', 'queued', 'donation-receipt:' || result.id::text,
      jsonb_build_object('donation_id', result.id, 'monthly', true)
    ) on conflict (event_key) where event_key is not null do nothing;
  end if;

  update public.recurring_donations
    set status = 'active',
        starts_at = coalesce(starts_at, now()),
        next_charge_at = now() + interval '1 month',
        updated_at = now()
    where gateway = 'razorpay'
      and gateway_subscription_id = trim(p_subscription_id)
  returning * into recurring;

  if recurring.id is not null then
    insert into public.recurring_payment_attempts (
      recurring_donation_id, donation_id, scheduled_for, attempted_at, status, attempt_number
    ) values (
      recurring.id, result.id, now(), now(), 'succeeded', 1
    ) on conflict (recurring_donation_id, scheduled_for, attempt_number) do nothing;
  end if;

  return jsonb_build_object('donation', to_jsonb(result) - 'checkout_token_hash', 'alreadyCompleted', false);
end;
$$;

create or replace function public.record_subscription_renewal(
  p_subscription_id text,
  p_payment_id text,
  p_amount_paise bigint,
  p_currency text,
  p_event_id text default null,
  p_gateway_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  recurring public.recurring_donations;
  seed public.donations;
  created public.donations;
  receipt_no text;
  snapshot jsonb;
  amount_rupees numeric(14,2);
begin
  select * into recurring
  from public.recurring_donations
  where gateway = 'razorpay' and gateway_subscription_id = trim(p_subscription_id)
  for update;
  if not found then
    raise exception 'recurring donation not found' using errcode = 'P0002';
  end if;

  amount_rupees := (p_amount_paise::numeric / 100);
  if amount_rupees <> recurring.amount or upper(trim(p_currency)) <> recurring.currency then
    raise exception 'renewal amount or currency mismatch' using errcode = '22023';
  end if;

  -- Idempotent: payment already recorded.
  if exists (
    select 1 from public.payment_transactions
    where gateway = 'razorpay' and gateway_payment_id = trim(p_payment_id) and transaction_type = 'payment'
  ) then
    select d.* into created
    from public.donations d
    where d.razorpay_payment_id = trim(p_payment_id)
    limit 1;
    return jsonb_build_object(
      'donation', case when created.id is null then null else to_jsonb(created) - 'checkout_token_hash' end,
      'alreadyCompleted', true
    );
  end if;

  if recurring.seed_donation_id is not null then
    select * into seed from public.donations where id = recurring.seed_donation_id;
  end if;

  -- First auth charge may settle via settle_razorpay_subscription_payment; skip duplicate donation.
  if seed.id is not null and seed.status = 'completed' and seed.razorpay_payment_id = trim(p_payment_id) then
    update public.recurring_donations
      set status = 'active',
          next_charge_at = now() + interval '1 month',
          updated_at = now()
      where id = recurring.id;
    return jsonb_build_object(
      'donation', to_jsonb(seed) - 'checkout_token_hash',
      'alreadyCompleted', true
    );
  end if;

  receipt_no := 'SVD-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.receipt_number_seq')::text, 7, '0');

  -- Renewals share one gateway subscription; only the seed donation keeps
  -- razorpay_subscription_id (unique). Link renewals via payment attempts.
  insert into public.donations (
    user_id, campaign_id, campaign_slug, campaign_title, amount, currency,
    is_anonymous, donor_name, donor_email, donor_phone, pan_number,
    status, payment_gateway, donation_type, razorpay_payment_id,
    receipt_number, receipt_generated, paid_at
  ) values (
    recurring.user_id,
    recurring.campaign_id,
    seed.campaign_slug,
    coalesce(seed.campaign_title, 'Monthly Donation'),
    recurring.amount,
    recurring.currency,
    coalesce(seed.is_anonymous, false),
    recurring.donor_name,
    recurring.donor_email,
    recurring.donor_phone,
    seed.pan_number,
    'completed',
    'razorpay',
    'recurring',
    trim(p_payment_id),
    receipt_no,
    true,
    now()
  )
  returning * into created;

  snapshot := jsonb_build_object(
    'receiptNumber', receipt_no,
    'donationId', created.id,
    'donorName', case when created.is_anonymous then 'Anonymous Donor' else created.donor_name end,
    'donorEmail', case when created.is_anonymous then null else created.donor_email end,
    'donorPhone', case when created.is_anonymous then null else created.donor_phone end,
    'isAnonymous', created.is_anonymous,
    'amount', created.amount,
    'currency', created.currency,
    'campaignTitle', created.campaign_title,
    'paymentId', created.razorpay_payment_id,
    'paidAt', created.paid_at,
    'pan', created.pan_number,
    'taxEligible', false,
    'donationType', 'recurring',
    'renewal', true
  );
  insert into public.donation_receipts (
    donation_id, receipt_number, financial_year, receipt_type,
    checksum_sha256, receipt_snapshot
  ) values (
    created.id, receipt_no,
    case when extract(month from current_date) >= 4
      then extract(year from current_date)::text || '-' || right((extract(year from current_date)::int + 1)::text, 2)
      else (extract(year from current_date)::int - 1)::text || '-' || right(extract(year from current_date)::text, 2)
    end,
    'DONATION',
    private.sha256_hex(snapshot::text),
    snapshot
  );

  insert into public.payment_transactions (
    donation_id, gateway, gateway_order_id, gateway_payment_id, gateway_event_id,
    transaction_type, amount, currency, status, idempotency_key, gateway_payload, occurred_at
  ) values (
    created.id, 'razorpay', trim(p_subscription_id), trim(p_payment_id), nullif(trim(p_event_id), ''),
    'payment', created.amount, created.currency, 'captured',
    'razorpay:payment:' || trim(p_payment_id), coalesce(p_gateway_payload, '{}'::jsonb), now()
  ) on conflict (idempotency_key) do nothing;

  if created.campaign_id is not null then
    update public.campaigns
      set raised = raised + created.amount, total_donors = total_donors + 1, updated_at = now()
      where id = created.campaign_id;
  end if;
  insert into public.income_records (
    source, description, amount, currency, income_date, reference_id, campaign_id
  ) values (
    'donation', created.campaign_title || ' (monthly renewal)', created.amount, created.currency,
    current_date, created.id::text, created.campaign_id
  ) on conflict (reference_id) where source = 'donation' do nothing;

  update public.recurring_donations
    set status = 'active',
        next_charge_at = now() + interval '1 month',
        updated_at = now()
    where id = recurring.id;

  insert into public.recurring_payment_attempts (
    recurring_donation_id, donation_id, scheduled_for, attempted_at, status, attempt_number
  ) values (
    recurring.id, created.id, now(), now(), 'succeeded',
    coalesce((
      select max(attempt_number) + 1 from public.recurring_payment_attempts
      where recurring_donation_id = recurring.id
    ), 1)
  );

  if created.donor_email is not null then
    insert into public.email_logs (recipient, subject, template, status, event_key, metadata)
    values (
      created.donor_email, 'Thank you for your monthly donation — ' || receipt_no,
      'donation_receipt', 'queued', 'donation-receipt:' || created.id::text,
      jsonb_build_object('donation_id', created.id, 'monthly', true, 'renewal', true)
    ) on conflict (event_key) where event_key is not null do nothing;
  end if;

  return jsonb_build_object('donation', to_jsonb(created) - 'checkout_token_hash', 'alreadyCompleted', false);
end;
$$;

create or replace function public.update_subscription_status(
  p_subscription_id text,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.recurring_donations
    set status = case
          when p_status in ('cancelled', 'completed', 'failed') then p_status
          when p_status in ('halted', 'paused') then 'paused'
          when p_status in ('active', 'authenticated', 'activated', 'resumed') then 'active'
          when p_status = 'pending' then 'pending'
          else status
        end,
        cancelled_at = case when p_status in ('cancelled', 'completed') then now() else cancelled_at end,
        updated_at = now()
    where gateway = 'razorpay'
      and gateway_subscription_id = trim(p_subscription_id);
  return true;
end;
$$;
