-- Public donation completion for demo/test flows (real payments use verify-razorpay-payment edge function)

create or replace function public.complete_donation_public(
  p_donation_id uuid,
  p_payment_id text default null
)
returns public.donations
language plpgsql
security definer
set search_path = public
as $$
declare
  receipt text;
  result public.donations;
  d public.donations;
begin
  select * into d from public.donations where id = p_donation_id;
  if d is null then
    raise exception 'Donation not found';
  end if;

  if d.status = 'completed' then
    return d;
  end if;

  if d.status <> 'pending' then
    raise exception 'Donation cannot be completed from status %', d.status;
  end if;

  if p_payment_id is null or p_payment_id not like 'demo_%' then
    raise exception 'Payment must be verified server-side';
  end if;

  select public.generate_receipt_number() into receipt;
  select * into result from public.complete_donation_and_update_campaign(
    p_donation_id,
    p_payment_id,
    receipt
  );
  return result;
end;
$$;

grant execute on function public.complete_donation_public(uuid, text) to anon, authenticated;
