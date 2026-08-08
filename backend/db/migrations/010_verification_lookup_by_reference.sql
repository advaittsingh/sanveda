-- Make document verification look up by public reference as well as private code.
-- Expand allowed document types for appointment letters and LORs.

alter table public.verification_records
  drop constraint if exists verification_records_type_check;

alter table public.verification_records
  add constraint verification_records_type_check
  check (type in (
    'donation_receipt',
    'membership_certificate',
    'volunteer_id',
    'internship_certificate',
    'appointment_letter',
    'letter_of_recommendation'
  ));

create index if not exists verification_records_reference_idx
  on public.verification_records (upper(reference_id));
