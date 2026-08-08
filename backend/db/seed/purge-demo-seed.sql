-- Purge Sanveda demo-seed rows (fixed UUIDs / demo markers from db/seed/demo-seed.sql).
-- Safe to re-run. Does not delete non-demo production data.
-- Apply: npm run db:purge-demo

begin;

-- Receipt rows are immutable via trigger; disable briefly for demo purge only.
alter table public.donation_receipts disable trigger prevent_receipt_mutation;

-- Payments / donations (demo markers)
delete from recurring_payment_attempts where id::text like '12121212-%';
delete from recurring_donations where id::text like '12121212-%' or gateway_subscription_id like 'sub_demo_%';
delete from donation_refunds where id::text like '15151515-%' or gateway_refund_id like 'rfnd_demo_%';
delete from donation_receipts where donation_id::text like '88888888-%';
delete from donation_ops_meta where donation_id::text like '88888888-%';
delete from payment_transactions
 where gateway_payment_id like 'pay_demo_%'
    or donation_id::text like '88888888-%';
delete from donations
 where id::text like '88888888-%'
    or razorpay_payment_id like 'pay_demo_%'
    or razorpay_order_id like 'order_demo_%'
    or receipt_number like 'SVD-80G-2026-9%'
    or donor_email like '%@example.com';

alter table public.donation_receipts enable trigger prevent_receipt_mutation;

-- Donors
delete from donor_tasks where id::text like '77777777-4444-%';
delete from donor_communications where id::text like '77777777-3333-%';
delete from donor_profiles
 where id::text like '77777777-0000-%'
    or email like '%@example.com';

-- People workflows
delete from volunteer_time_entries where id::text like '77777777-2222-%';
delete from volunteer_assignments where id::text like '77777777-1111-%';
delete from volunteer_applications
 where id like 'VOL-2026-9%'
    or volunteer_id like 'SVD-VOL-9%'
    or email like '%@example.com';

delete from intern_tasks where id::text like '66666666-1111-%';
delete from internships
 where id::text like '66666666-%'
    or application_id like 'INT-2026-9%'
    or email like '%@example.com';

delete from membership_payments where id::text like '55555555-1111-%';
delete from memberships
 where id::text like '55555555-%'
    or member_id like 'SVD-MEM-2026-9%'
    or certificate_number like 'SVD-CERT-2026-9%'
    or email like '%@example.com';

delete from enquiry_messages where id::text like '44444444-1111-%';
delete from enquiries
 where id::text like '44444444-%'
    or ticket_code like 'ENQ-9%'
    or email like '%@example.com';

-- Events
delete from event_agenda where id::text like '33333333-2222-%';
delete from event_registrations where id::text like '33333333-1111-%' or registration_code like 'REG-9%';
delete from events where id::text like '33333333-%' or event_code like 'EVT-9%';

-- Beneficiaries / projects
delete from beneficiary_outcomes where id::text like '22222222-2222-%';
delete from beneficiary_support where id::text like '22222222-1111-%';
delete from beneficiaries where id::text like '22222222-%' or beneficiary_code like 'BEN-9%';
delete from project_team where id::text like '11111111-3333-%';
delete from project_funding where id::text like '11111111-2222-%';
delete from project_milestones where id::text like '11111111-1111-%';
delete from projects where id::text like '11111111-0000-%' or project_code like 'PRJ-9%';

-- Finance
delete from expenses where id::text like '99999999-%' or reference like 'EXP-9%';
delete from income_records where id::text like 'aaaaaaaa-1111-%' or reference_id like 'INC-9%';

-- Content
delete from gallery_items where id::text like 'dddddddd-%';
delete from gallery_albums where id::text like 'cccccccc-%';
delete from testimonials where id::text like 'ffffffff-%';
delete from blogs
 where slug in (
   'a-classroom-under-the-banyan-tree',
   'what-your-500-rupees-actually-does',
   'flood-diary-72-hours-in-assam',
   'meet-the-women-of-udaan-shg',
   'volunteering-changed-my-sundays',
   'annual-impact-report-preview'
 );
delete from campaigns
 where slug in (
   'educate-100-girls',
   'mid-day-meals',
   'mobile-health-vans',
   'skill-her-future',
   'flood-relief-2026',
   'winter-warmth-drive'
 );
delete from focus_areas where id::text like 'eeeeeeee-%';

-- Documents / verification / CMS demo pages
delete from verification_records
 where id::text like '16161616-%'
    or code like 'SVD-VER-9%'
    or reference_id like 'SVD-80G-2026-9%'
    or reference_id like 'SVD-CERT-2026-9%'
    or reference_id like 'SVD-VOL-9%';
delete from documents where id::text like 'bbbbbbbb-%' or document_id like 'DOC-2026-9%';
delete from cms_sections where id::text like 'c1c1c1c1-%';
delete from cms_pages where id::text like 'c0c0c0c0-%';

commit;
