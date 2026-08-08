-- Portable business functions, triggers, identity helpers and immutable audit.

-- Legacy-shape compatibility additions that cannot be expressed in CREATE IF NOT EXISTS.
alter table public.blogs drop constraint if exists blogs_status_check;
alter table public.blogs add constraint blogs_status_check
  check (status in ('draft','review','approved','scheduled','published','archived'));
alter table public.payment_reconciliation add column if not exists gateway text not null default 'razorpay';
alter table public.payment_reconciliation add column if not exists reconciled_by uuid references public."user"(id) on delete set null;
alter table public.donation_receipts add column if not exists checksum_sha256 text;

-- The API must SET LOCAL app.user_id = '<verified user UUID>' inside a
-- transaction before invoking identity-aware database functions.
create or replace function private.current_user_id()
returns uuid
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare value text := nullif(current_setting('app.user_id', true), '');
begin
  if value is null then
    return null;
  end if;
  return value::uuid;
exception when invalid_text_representation then
  raise exception 'app.user_id must be a UUID' using errcode = '22023';
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = private.current_user_id()
      and au.is_active
      and au.status = 'active'
  );
$$;

create or replace function private.current_admin_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select coalesce(ar.key, au.role)
    from public.admin_users au
    left join public.admin_roles ar on ar.id = au.role_id
    where au.user_id = private.current_user_id()
      and au.is_active
      and au.status = 'active'
  ), '');
$$;

create or replace function private.admin_has_permission(p_module text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with current_admin as (
    select au.role_id, coalesce(ar.key, au.role) as role_key
    from public.admin_users au
    left join public.admin_roles ar on ar.id = au.role_id
    where au.user_id = private.current_user_id()
      and au.is_active
      and au.status = 'active'
  ),
  requested as (
    select
      case when p_module in ('admin','users') then 'admin_users' else lower(p_module) end as module_key,
      lower(p_action) as action_key
  )
  select exists (
    select 1
    from current_admin ca
    cross join requested req
    where ca.role_key in ('super_admin','admin')
      or exists (
        select 1
        from public.admin_role_permissions arp
        join public.admin_permissions ap on ap.id = arp.permission_id
        where arp.role_id = ca.role_id
          and ap.module = req.module_key
          and (
            ap.action = req.action_key
            or ap.action = 'manage'
            or (req.action_key = 'view' and ap.action in ('read','write'))
            or (req.action_key in ('create','edit') and ap.action = 'write')
          )
      )
      or (
        ca.role_id is null
        and (
          (ca.role_key = 'finance' and req.module_key = any(array[
            'donations','payments','finance','beneficiaries','audit','reports','documents'
          ]))
          or (ca.role_key = 'content' and req.module_key = any(array[
            'campaigns','cms','content','blogs','gallery','events','testimonials','focus_areas','documents'
          ]))
          or (ca.role_key = 'volunteer' and req.module_key = any(array[
            'volunteers','internships','memberships','enquiries','events','projects'
          ]))
        )
      )
  );
$$;

create or replace function private.admin_has_module(p_module text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.admin_has_permission(p_module, 'view');
$$;

-- Public wrappers preserve existing policy and client references without exposing
-- privileged table access in the public schema.
create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.is_admin() $$;
create or replace function public.current_admin_role()
returns text language sql stable security invoker set search_path = ''
as $$ select private.current_admin_role() $$;
create or replace function public.admin_has_module(p_module text)
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.admin_has_module(p_module) $$;
create or replace function public.admin_has_permission(p_module text, p_action text)
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.admin_has_permission(p_module, p_action) $$;

create or replace function public.current_admin_access()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when au.user_id is null then null
    else jsonb_build_object(
      'role', coalesce(ar.key, au.role),
      'permissions',
      case
        when coalesce(ar.key, au.role) in ('super_admin','admin') then jsonb_build_array('*')
        else coalesce((
          select jsonb_agg(ap.key order by ap.key)
          from public.admin_role_permissions arp
          join public.admin_permissions ap on ap.id = arp.permission_id
          where arp.role_id = au.role_id
        ), '[]'::jsonb)
      end
    )
  end
  from (select private.current_user_id() as user_id) caller
  left join public.admin_users au
    on au.user_id = caller.user_id and au.is_active and au.status = 'active'
  left join public.admin_roles ar on ar.id = au.role_id
$$;

create or replace function public.record_admin_login()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare caller_id uuid := private.current_user_id();
begin
  if caller_id is null or not private.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  update public.admin_users
  set last_login_at = now()
  where user_id = caller_id;
  update public.admin_invitations
  set status = 'accepted', accepted_at = coalesce(accepted_at, now())
  where auth_user_id = caller_id and status = 'pending';
end;
$$;

create or replace function public.set_admin_role_permissions(p_role_key text, p_permissions jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare target_role_id uuid;
begin
  if not private.admin_has_permission('admin_users', 'edit') then
    raise exception 'role permission management requires admin_users.edit'
      using errcode = '42501';
  end if;
  if jsonb_typeof(p_permissions) <> 'array' then
    raise exception 'permissions must be a JSON array' using errcode = '22023';
  end if;

  select id into target_role_id
  from public.admin_roles
  where key = p_role_key
  for update;
  if target_role_id is null then
    raise exception 'role not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_permissions) as item(module text, action text)
    where item.module !~ '^[a-z][a-z0-9_]*$'
       or item.action !~ '^[a-z][a-z0-9_]*$'
  ) then
    raise exception 'invalid permission module or action' using errcode = '22023';
  end if;

  delete from public.admin_role_permissions where role_id = target_role_id;
  with requested as (
    select distinct lower(item.module) as module, lower(item.action) as action
    from jsonb_to_recordset(p_permissions) as item(module text, action text)
  ),
  permissions as (
    insert into public.admin_permissions (key, module, action)
    select module || '.' || action, module, action
    from requested
    on conflict (module, action) do update set key = excluded.key
    returning id, module, action
  )
  insert into public.admin_role_permissions (role_id, permission_id)
  select target_role_id, permissions.id from permissions;
end;
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','admin_departments','admin_roles','admin_users','admin_invitations','enquiries','volunteer_applications',
    'memberships','internships','campaigns','blogs','cms_pages','cms_sections',
    'cms_navigation','cms_banners','testimonials','focus_areas','projects',
    'project_milestones','project_tasks','beneficiaries','events','gallery_albums',
    'documents','donations','payment_webhook_events','recurring_donations','donation_ops_meta','expenses',
    'income_records','grants','chart_of_accounts','app_settings',
    'payment_gateway_configs','notification_templates','workflow_definitions',
    'report_definitions'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('drop trigger if exists set_updated_at on public.%I', table_name);
      execute format(
        'create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
        table_name
      );
    end if;
  end loop;
end $$;

create or replace function private.is_super_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    left join public.admin_roles ar on ar.id = au.role_id
    where au.user_id = p_user_id
      and coalesce(ar.key, au.role) = 'super_admin'
  )
$$;

create or replace function private.protect_admin_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_is_super boolean := private.is_super_admin_user(old.user_id);
  new_is_super boolean := false;
  removes_access boolean := tg_op = 'DELETE';
  remaining_super_admins integer;
begin
  if tg_op = 'UPDATE' then
    new_is_super := coalesce(
      (select ar.key from public.admin_roles ar where ar.id = new.role_id),
      new.role
    ) = 'super_admin';
    removes_access := old_is_super and (
      not new_is_super or not new.is_active or new.status <> 'active'
    );
  end if;

  if removes_access and private.current_user_id() = old.user_id then
    raise exception 'super administrators cannot demote or deactivate themselves'
      using errcode = '42501';
  end if;

  if old_is_super and removes_access then
    select count(*)
      into remaining_super_admins
    from public.admin_users au
    left join public.admin_roles ar on ar.id = au.role_id
    where au.user_id <> old.user_id
      and au.is_active
      and au.status = 'active'
      and coalesce(ar.key, au.role) = 'super_admin';
    if remaining_super_admins = 0 then
      raise exception 'cannot remove the last active super administrator'
        using errcode = '23514';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;
drop trigger if exists protect_admin_privilege_change on public.admin_users;
create trigger protect_admin_privilege_change
  before update or delete on public.admin_users
  for each row execute function private.protect_admin_privilege_change();

create or replace function private.protect_super_admin_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.key = 'super_admin' and (tg_op = 'DELETE' or new.key <> old.key) then
    raise exception 'the super_admin role key is immutable' using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists protect_super_admin_role on public.admin_roles;
create trigger protect_super_admin_role
  before update or delete on public.admin_roles
  for each row execute function private.protect_super_admin_role();

create or replace function private.sync_better_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (new.id, new.name, new.phone, new.image)
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;
drop trigger if exists sync_better_auth_user on public."user";
create trigger sync_better_auth_user
  after insert or update of name, phone, image on public."user"
  for each row execute function private.sync_better_auth_user();

create or replace function private.activate_invited_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.admin_users
  set status = 'active', is_active = true, last_login_at = now()
  where user_id = new."userId" and status = 'invited';
  update public.admin_invitations
  set status = 'accepted', accepted_at = coalesce(accepted_at, now())
  where auth_user_id = new."userId" and status = 'pending';
  return new;
end;
$$;
drop trigger if exists activate_invited_admin on public."session";
create trigger activate_invited_admin
  after insert on public."session"
  for each row execute function private.activate_invited_admin();

create or replace function public.generate_receipt_number()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not private.admin_has_module('donations') then
    raise exception 'insufficient permissions' using errcode = '42501';
  end if;
  return 'SVD-80G-' || to_char(current_date, 'YYYY') || '-' ||
         lpad(nextval('public.receipt_number_seq')::text, 7, '0');
end;
$$;
create or replace function public.generate_member_id()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not private.admin_has_module('memberships') then
    raise exception 'insufficient permissions' using errcode = '42501';
  end if;
  return 'SVD-MEM-' || to_char(current_date, 'YYYY') || '-' ||
         lpad(nextval('public.member_number_seq')::text, 6, '0');
end;
$$;
create or replace function public.generate_certificate_number()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not (
    private.admin_has_module('memberships')
    or private.admin_has_module('internships')
    or private.admin_has_module('volunteers')
  ) then
    raise exception 'insufficient permissions' using errcode = '42501';
  end if;
  return 'SVD-CERT-' || to_char(current_date, 'YYYY') || '-' ||
         lpad(nextval('public.certificate_number_seq')::text, 6, '0');
end;
$$;

create or replace function public.create_pending_donation(
  p_campaign_title text,
  p_amount numeric,
  p_currency text default 'INR',
  p_campaign_id integer default null,
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
set search_path = ''
as $$
declare
  result public.donations;
  caller_id uuid := private.current_user_id();
begin
  if p_campaign_title is null or length(trim(p_campaign_title)) = 0 then
    raise exception 'campaign_title is required' using errcode = '22023';
  end if;
  if p_amount is null or p_amount < 1 then
    raise exception 'minimum donation amount is 1' using errcode = '22023';
  end if;
  if p_currency is null or upper(trim(p_currency)) !~ '^[A-Z]{3}$' then
    raise exception 'currency must be an ISO 4217 code' using errcode = '22023';
  end if;
  if p_campaign_id is not null and not exists (
    select 1 from public.campaigns
    where id = p_campaign_id and status in ('active','approved','published')
  ) then
    raise exception 'campaign is not available for donations' using errcode = '23503';
  end if;

  insert into public.donations (
    user_id, campaign_id, campaign_slug, campaign_title, amount, currency,
    is_anonymous, donor_name, donor_email, donor_phone, status
  ) values (
    caller_id, p_campaign_id, nullif(trim(p_campaign_slug), ''), trim(p_campaign_title),
    p_amount, upper(trim(p_currency)), coalesce(p_is_anonymous, false),
    case when coalesce(p_is_anonymous, false) then null else nullif(trim(p_donor_name), '') end,
    nullif(lower(trim(p_donor_email)), ''), nullif(trim(p_donor_phone), ''), 'pending'
  )
  returning * into result;
  return result;
end;
$$;

create or replace function public.complete_donation_and_update_campaign(
  p_donation_id uuid,
  p_payment_id text,
  p_receipt_number text
)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
begin
  select * into result
  from public.donations
  where id = p_donation_id
  for update;

  if not found then
    raise exception 'donation not found' using errcode = 'P0002';
  end if;
  if result.status = 'completed' then
    return result;
  end if;
  if result.status <> 'pending' then
    raise exception 'donation cannot be completed from status %', result.status using errcode = '22023';
  end if;
  if p_payment_id is null or trim(p_payment_id) = '' or p_receipt_number is null or trim(p_receipt_number) = '' then
    raise exception 'verified payment and receipt identifiers are required' using errcode = '22023';
  end if;

  update public.donations
  set status = 'completed',
      razorpay_payment_id = trim(p_payment_id),
      receipt_number = trim(p_receipt_number),
      receipt_generated = true,
      updated_at = now()
  where id = p_donation_id
  returning * into result;

  if result.campaign_id is not null then
    update public.campaigns
    set raised = raised + result.amount,
        total_donors = total_donors + 1,
        updated_at = now()
    where id = result.campaign_id;
  end if;

  insert into public.income_records (source, description, amount, currency, income_date, reference_id, campaign_id)
  values ('donation', result.campaign_title, result.amount, result.currency, current_date, result.id::text, result.campaign_id);
  return result;
end;
$$;

create or replace function public.complete_donation_admin(
  p_donation_id uuid,
  p_payment_id text default null
)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.admin_has_module('donations') then
    raise exception 'insufficient permissions' using errcode = '42501';
  end if;
  return public.complete_donation_and_update_campaign(
    p_donation_id,
    coalesce(nullif(trim(p_payment_id), ''), 'admin-approved:' || public.gen_random_uuid()::text),
    public.generate_receipt_number()
  );
end;
$$;

-- Existing duplicate income cleanup is intentionally excluded from this schema migration.
create unique index if not exists income_records_donation_reference_uidx
  on public.income_records (reference_id) where source = 'donation';

create or replace function private.sha256_hex(p_value text)
returns text language sql immutable strict set search_path = ''
as $$ select encode(public.digest(p_value, 'sha256'), 'hex') $$;

create or replace function public.create_pending_donation_checkout(
  p_campaign_title text,
  p_amount numeric,
  p_currency text default 'INR',
  p_campaign_id integer default null,
  p_campaign_slug text default null,
  p_is_anonymous boolean default false,
  p_donor_name text default null,
  p_donor_email text default null,
  p_donor_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
  checkout_token text := encode(public.gen_random_bytes(32), 'hex');
  caller_id uuid := private.current_user_id();
begin
  if p_campaign_title is null or length(trim(p_campaign_title)) = 0 then
    raise exception 'campaign_title is required' using errcode = '22023';
  end if;
  if p_amount is null or p_amount < 100 or trunc(p_amount, 2) <> p_amount then
    raise exception 'minimum donation amount is 100 and at most two decimals are allowed' using errcode = '22023';
  end if;
  if p_currency is null or upper(trim(p_currency)) <> 'INR' then
    raise exception 'only INR one-time donations are supported' using errcode = '22023';
  end if;
  if p_campaign_id is not null and not exists (
    select 1 from public.campaigns
    where id = p_campaign_id and status in ('active','approved','published')
  ) then
    raise exception 'campaign is not available for donations' using errcode = '23503';
  end if;

  insert into public.donations (
    user_id, campaign_id, campaign_slug, campaign_title, amount, currency,
    is_anonymous, donor_name, donor_email, donor_phone, status, checkout_token_hash
  ) values (
    caller_id, p_campaign_id, nullif(trim(p_campaign_slug), ''), trim(p_campaign_title),
    p_amount, 'INR', coalesce(p_is_anonymous, false),
    case when coalesce(p_is_anonymous, false) then null else nullif(trim(p_donor_name), '') end,
    nullif(lower(trim(p_donor_email)), ''), nullif(trim(p_donor_phone), ''), 'pending',
    private.sha256_hex(checkout_token)
  )
  returning * into result;

  return jsonb_build_object('donation', to_jsonb(result) - 'checkout_token_hash', 'checkoutToken', checkout_token);
end;
$$;

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
    'receipt', 'd_' || left(replace(result.id::text, '-', ''), 32)
  );
end;
$$;

create or replace function public.bind_razorpay_order(
  p_donation_id uuid,
  p_checkout_token text,
  p_order_id text,
  p_amount_paise bigint,
  p_currency text
)
returns text
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
  if result.status <> 'pending'
    or (result.amount * 100)::bigint <> p_amount_paise
    or result.currency <> upper(trim(p_currency)) then
    raise exception 'order does not match pending donation' using errcode = '22023';
  end if;
  if result.razorpay_order_id is not null and result.razorpay_order_id <> trim(p_order_id) then
    raise exception 'donation already has a different order' using errcode = '23505';
  end if;
  update public.donations
    set razorpay_order_id = trim(p_order_id), updated_at = now()
    where id = result.id and razorpay_order_id is null;
  return coalesce(result.razorpay_order_id, trim(p_order_id));
end;
$$;

create or replace function public.settle_razorpay_payment(
  p_order_id text,
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
begin
  select * into result
  from public.donations
  where razorpay_order_id = trim(p_order_id)
  for update;
  if not found then
    raise exception 'bound donation not found' using errcode = 'P0002';
  end if;
  if (result.amount * 100)::bigint <> p_amount_paise or result.currency <> upper(trim(p_currency)) then
    raise exception 'payment amount or currency mismatch' using errcode = '22023';
  end if;
  if result.status = 'completed' then
    if result.razorpay_payment_id <> trim(p_payment_id) then
      raise exception 'donation completed with a different payment' using errcode = '23505';
    end if;
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
    'taxEligible', false
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
    result.id, 'razorpay', trim(p_order_id), trim(p_payment_id), nullif(trim(p_event_id), ''),
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
    'donation', result.campaign_title, result.amount, result.currency,
    current_date, result.id::text, result.campaign_id
  ) on conflict (reference_id) where source = 'donation' do nothing;
  if result.donor_email is not null then
    insert into public.email_logs (recipient, subject, template, status, event_key, metadata)
    values (
      result.donor_email, 'Thank you for your donation — ' || receipt_no,
      'donation_receipt', 'queued', 'donation-receipt:' || result.id::text,
      jsonb_build_object('donation_id', result.id)
    ) on conflict (event_key) where event_key is not null do nothing;
  end if;
  return jsonb_build_object('donation', to_jsonb(result) - 'checkout_token_hash', 'alreadyCompleted', false);
end;
$$;

create or replace function public.get_checkout_result(p_checkout_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', d.id, 'status', d.status, 'amount', d.amount, 'currency', d.currency,
    'campaignTitle', d.campaign_title, 'paymentId', d.razorpay_payment_id,
    'receiptNumber', d.receipt_number, 'paidAt', d.paid_at,
    'receipt', r.receipt_snapshot
  )
  from public.donations d
  left join public.donation_receipts r on r.donation_id = d.id
  where d.checkout_token_hash = private.sha256_hex(coalesce(p_checkout_token, ''))
  limit 1
$$;

create or replace function public.verify_receipt_token(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'valid', true,
    'receiptNumber', r.receipt_snapshot ->> 'receiptNumber',
    'donorName', r.receipt_snapshot ->> 'donorName',
    'amount', r.receipt_snapshot -> 'amount',
    'currency', r.receipt_snapshot ->> 'currency',
    'campaignTitle', r.receipt_snapshot ->> 'campaignTitle',
    'paymentId', r.receipt_snapshot ->> 'paymentId',
    'paidAt', r.receipt_snapshot ->> 'paidAt',
    'pan', r.receipt_snapshot ->> 'pan',
    'taxEligible', coalesce((r.receipt_snapshot ->> 'taxEligible')::boolean, false),
    'checksumSha256', r.checksum_sha256,
    'generatedAt', r.generated_at
  )
  from public.donation_receipts r
  where r.verification_token_hash = private.sha256_hex(coalesce(p_token, ''))
  limit 1
$$;

create or replace function public.lookup_verification_code(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'type', v.type, 'holderName', v.holder_name, 'referenceId', v.reference_id,
    'validUntil', v.valid_until, 'revoked', v.revoked, 'createdAt', v.created_at
  )
  from public.verification_records v
  where v.code = upper(trim(p_code))
  limit 1
$$;

create or replace function public.register_payment_webhook_event(
  p_event_id text,
  p_event_type text,
  p_payload_sha256 text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.payment_webhook_events (
    gateway, gateway_event_id, event_type, payload_sha256
  ) values ('razorpay', trim(p_event_id), trim(p_event_type), trim(p_payload_sha256));
  return true;
exception when unique_violation then
  update public.payment_webhook_events
  set status = 'processing', error_message = null, processed_at = null
  where gateway = 'razorpay' and gateway_event_id = trim(p_event_id) and status = 'failed';
  return found;
end;
$$;

create or replace function public.finish_payment_webhook_event(
  p_event_id text,
  p_status text,
  p_error_message text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.payment_webhook_events
  set status = p_status, error_message = p_error_message, processed_at = now()
  where gateway = 'razorpay' and gateway_event_id = trim(p_event_id)
$$;

create or replace function public.claim_donation_receipt_email(p_donation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  update public.email_logs e
  set status = 'processing'
  where e.event_key = 'donation-receipt:' || p_donation_id::text and e.status = 'queued'
  returning jsonb_build_object(
    'id', e.id, 'recipient', e.recipient, 'subject', e.subject,
    'donation', (select to_jsonb(d) - 'checkout_token_hash' from public.donations d where d.id = p_donation_id)
  ) into result;
  return result;
end;
$$;

create or replace function public.get_refund_for_processing(p_refund_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if not private.admin_has_module('payments') then
    raise exception 'insufficient permissions' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'refundId', r.id, 'donationId', d.id, 'paymentId', d.razorpay_payment_id,
    'amountPaise', (r.amount * 100)::bigint, 'currency', d.currency,
    'status', r.status, 'reason', r.reason
  ) into result
  from public.donation_refunds r
  join public.donations d on d.id = r.donation_id
  where r.id = p_refund_id and r.status in ('pending','approved')
    and d.status = 'completed' and d.razorpay_payment_id is not null;
  return result;
end;
$$;

create or replace function public.complete_razorpay_refund(
  p_refund_id uuid,
  p_gateway_refund_id text,
  p_gateway_status text,
  p_gateway_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare refund_row public.donation_refunds; donation_row public.donations;
begin
  select * into refund_row from public.donation_refunds where id = p_refund_id for update;
  if not found then raise exception 'refund not found' using errcode = 'P0002'; end if;
  if refund_row.status = 'completed' then
    if refund_row.gateway_refund_id <> p_gateway_refund_id then
      raise exception 'refund already completed with another gateway id' using errcode = '23505';
    end if;
    return;
  end if;
  select * into donation_row from public.donations where id = refund_row.donation_id for update;
  update public.donation_refunds
    set status = case when p_gateway_status = 'processed' then 'completed' else 'processing' end,
        gateway_refund_id = trim(p_gateway_refund_id),
        completed_at = case when p_gateway_status = 'processed' then now() else null end
    where id = refund_row.id;
  if p_gateway_status = 'processed' then
    update public.donations set status = 'refunded', updated_at = now() where id = donation_row.id;
  end if;
  update public.donation_ops_meta
    set refund_status = case when p_gateway_status = 'processed' then 'completed' else 'processing' end,
        updated_at = now()
    where donation_id = donation_row.id;
  insert into public.payment_transactions (
    donation_id, gateway, gateway_order_id, gateway_payment_id,
    transaction_type, amount, currency, status, idempotency_key, gateway_payload, occurred_at
  ) values (
    donation_row.id, 'razorpay', donation_row.razorpay_order_id, p_gateway_refund_id,
    'refund', refund_row.amount, donation_row.currency,
    case when p_gateway_status = 'processed' then 'refunded' else 'pending' end,
    'razorpay:refund:' || trim(p_gateway_refund_id), coalesce(p_gateway_payload, '{}'::jsonb), now()
  ) on conflict (idempotency_key) do update
    set status = excluded.status,
        gateway_payload = excluded.gateway_payload,
        occurred_at = excluded.occurred_at;
end;
$$;

create or replace function private.prevent_receipt_mutation()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'receipt snapshots cannot be deleted' using errcode = '55000';
  end if;
  if new.donation_id <> old.donation_id
    or new.receipt_number <> old.receipt_number
    or new.financial_year <> old.financial_year
    or new.receipt_type <> old.receipt_type
    or new.checksum_sha256 is distinct from old.checksum_sha256
    or new.receipt_snapshot is distinct from old.receipt_snapshot
    or new.verification_token_hash is distinct from old.verification_token_hash then
    raise exception 'receipt snapshot is immutable' using errcode = '55000';
  end if;
  return new;
end;
$$;
drop trigger if exists prevent_receipt_mutation on public.donation_receipts;
create trigger prevent_receipt_mutation before update or delete on public.donation_receipts
for each row execute function private.prevent_receipt_mutation();

create or replace function private.prevent_payment_binding_mutation()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if old.razorpay_order_id is not null and (
    new.amount is distinct from old.amount
    or new.currency is distinct from old.currency
    or new.razorpay_order_id is distinct from old.razorpay_order_id
    or new.checkout_token_hash is distinct from old.checkout_token_hash
  ) then
    raise exception 'bound payment terms are immutable' using errcode = '55000';
  end if;
  if old.status in ('completed', 'refunded') and (
    new.razorpay_payment_id is distinct from old.razorpay_payment_id
    or new.receipt_number is distinct from old.receipt_number
    or new.paid_at is distinct from old.paid_at
    or new.status not in (old.status, 'refunded')
  ) then
    raise exception 'completed payment is immutable' using errcode = '55000';
  end if;
  return new;
end;
$$;
drop trigger if exists prevent_payment_binding_mutation on public.donations;
create trigger prevent_payment_binding_mutation before update on public.donations
for each row execute function private.prevent_payment_binding_mutation();

create or replace function public.lookup_volunteer_application(p_id text, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', v.id, 'volunteer_id', v.volunteer_id, 'status', v.status,
    'full_name', v.full_name, 'email', v.email, 'preferred_roles', v.preferred_roles,
    'created_at', v.created_at, 'interview_date', v.interview_date, 'assigned_team', v.assigned_team
  )
  from public.volunteer_applications v
  where v.id = p_id and lower(v.email) = lower(trim(p_email))
$$;
create or replace function public.lookup_membership_status(p_id uuid, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', m.id, 'member_id', m.member_id, 'full_name', m.full_name, 'email', m.email,
    'status', m.status, 'tier', m.tier, 'certificate_number', m.certificate_number,
    'renewal_date', m.renewal_date, 'created_at', m.created_at
  )
  from public.memberships m
  where m.id = p_id and lower(m.email) = lower(trim(p_email))
$$;
create or replace function public.lookup_internship_status(p_application_id text, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', i.id, 'application_id', i.application_id, 'full_name', i.full_name,
    'email', i.email, 'status', i.status, 'certificate_number', i.certificate_number,
    'preferred_department', i.preferred_department, 'start_date', i.start_date,
    'end_date', i.end_date, 'created_at', i.created_at
  )
  from public.internships i
  where i.application_id = p_application_id and lower(i.email) = lower(trim(p_email))
$$;

-- Immutable audit and posted-ledger enforcement.
create or replace function private.prevent_audit_mutation()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  raise exception 'audit records are immutable' using errcode = '55000';
end;
$$;
drop trigger if exists audit_logs_immutable on public.audit_logs;
create trigger audit_logs_immutable
  before update or delete on public.audit_logs
  for each row execute function private.prevent_audit_mutation();

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id text;
begin
  row_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');
  insert into public.audit_logs (
    user_id, action, entity_type, entity_id, old_data, new_data, severity
  ) values (
    private.current_user_id(), tg_op, tg_table_name, row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    case when tg_op = 'DELETE' then 'warning' else 'info' end
  );
  return coalesce(new, old);
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'admin_departments','admin_roles','admin_permissions','admin_role_permissions',
    'admin_users','admin_invitations','donations','payment_transactions','recurring_donations',
    'donation_receipts','donation_refunds','payment_reconciliation','expenses',
    'income_records','grants','fiscal_periods','chart_of_accounts',
    'journal_entries','journal_entry_lines','budgets','budget_lines',
    'documents','document_versions','document_approvals','app_settings'
  ]
  loop
    execute format('drop trigger if exists audit_row_change on public.%I', table_name);
    execute format(
      'create trigger audit_row_change after insert or update or delete on public.%I for each row execute function private.audit_row_change()',
      table_name
    );
  end loop;
end $$;

create or replace function private.protect_posted_journal()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if old.status in ('posted','reversed') then
    raise exception 'posted journal entries are immutable; create a reversal' using errcode = '55000';
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists protect_posted_journal on public.journal_entries;
create trigger protect_posted_journal
  before update or delete on public.journal_entries
  for each row execute function private.protect_posted_journal();

create or replace function private.protect_posted_journal_line()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare entry_id uuid := coalesce(new.journal_entry_id, old.journal_entry_id);
begin
  if exists (select 1 from public.journal_entries where id = entry_id and status in ('posted','reversed')) then
    raise exception 'lines of posted journal entries are immutable' using errcode = '55000';
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists protect_posted_journal_line on public.journal_entry_lines;
create trigger protect_posted_journal_line
  before insert or update or delete on public.journal_entry_lines
  for each row execute function private.protect_posted_journal_line();

create or replace function private.validate_journal_balance()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare difference numeric;
begin
  if new.status = 'posted' and old.status is distinct from 'posted' then
    select coalesce(sum(debit), 0) - coalesce(sum(credit), 0)
      into difference
    from public.journal_entry_lines
    where journal_entry_id = new.id;
    if difference <> 0 then
      raise exception 'journal entry is not balanced (difference %)', difference using errcode = '23514';
    end if;
    new.posted_at := coalesce(new.posted_at, now());
    new.posted_by := coalesce(new.posted_by, private.current_user_id());
  end if;
  return new;
end;
$$;
drop trigger if exists validate_journal_balance on public.journal_entries;
create trigger validate_journal_balance
  before update on public.journal_entries
  for each row execute function private.validate_journal_balance();


-- Functions are callable by the database owner/application role only unless a
-- deployment explicitly grants a narrower runtime role.
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema private from public;
