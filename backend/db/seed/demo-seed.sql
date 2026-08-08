-- Demo seed data for Sanveda (Neon).
-- LOCAL QA ONLY. Never run against production.
-- Requires: ALLOW_DEMO_SEED=1 npm run db:seed-demo
-- To remove: npm run db:purge-demo
-- Idempotent: fixed IDs/slugs with ON CONFLICT DO NOTHING. Never deletes data.
-- Run: ALLOW_DEMO_SEED=1 npm run db:seed-demo

begin;

-- ─── Focus areas ────────────────────────────────────────────────────────────
insert into focus_areas (id, slug, title, description, image_url, status, sort_order, metrics) values
  ('eeeeeeee-0000-4000-8000-000000000001','education','Education for All','Bridging the learning gap for underprivileged children through community schools, digital classrooms and scholarships.','https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200','published',1,'{"children_supported":1240,"schools":18,"scholarships":320}'),
  ('eeeeeeee-0000-4000-8000-000000000002','healthcare','Healthcare Access','Mobile health camps, maternal care and preventive screenings for rural and slum communities.','https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200','published',2,'{"patients_treated":8600,"health_camps":74,"villages":41}'),
  ('eeeeeeee-0000-4000-8000-000000000003','women-empowerment','Women Empowerment','Skill development, micro-entrepreneurship and self-help groups enabling financial independence.','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200','published',3,'{"women_trained":950,"shg_groups":62,"micro_businesses":210}'),
  ('eeeeeeee-0000-4000-8000-000000000004','disaster-relief','Disaster Relief','Rapid response teams delivering food, shelter and medical aid during floods and other emergencies.','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200','published',4,'{"families_reached":3400,"relief_kits":5100}')
on conflict (id) do nothing;

-- ─── Campaigns ──────────────────────────────────────────────────────────────
insert into campaigns (slug, title, banner_image, thumbnail_image, goal, raised, description, exemption_tag, total_donors, category, hide_goal, hide_raised, feature_urgent, feature_recent, featured, campaign_descriptions, admin_meta, status, starts_at, created_at) values
  ('educate-100-girls','Educate 100 Girls in Rural Rajasthan','https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600','https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',500000,362500,'Your support gives 100 girls from marginalised families in rural Rajasthan a full year of schooling — books, uniforms, transport and mentoring included.','80G',148,'["children","education"]',0,0,0,0,1,'[{"id":1,"title":"Why this matters","description":"Only 1 in 3 girls in these districts completes secondary school. Dropout is driven by cost, distance and safety — all solvable problems."},{"id":2,"title":"What your donation does","description":"₹5,000 covers a full year of school for one girl: fees, books, uniform, and safe transport."}]','{"featured":true}','active', now() - interval '90 days', now() - interval '90 days'),
  ('mid-day-meals','Nourish a Child: Mid-Day Meal Programme','https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600','https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',300000,287400,'Serve hot, nutritious mid-day meals to 500 school children every day. A fed child learns better, stays in school longer and dreams bigger.','80G',312,'["children","hunger"]',0,0,1,0,1,'[{"id":1,"title":"The problem","description":"For many children in our partner schools, the school meal is the only full meal of the day."},{"id":2,"title":"Impact so far","description":"Over 94,000 meals served this year across 12 schools with attendance up 22%."}]','{"featured":true}','active', now() - interval '120 days', now() - interval '120 days'),
  ('mobile-health-vans','Mobile Health Vans for Remote Villages','https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600','https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600',1200000,458000,'Fund fully-equipped mobile medical units bringing doctors, diagnostics and medicines to 40+ villages with no primary health centre.','80G',96,'["healthcare"]',0,0,1,0,0,'[{"id":1,"title":"Healthcare deserts","description":"Families in these villages travel 30+ km for basic care. Preventable illnesses go untreated for months."},{"id":2,"title":"What we deliver","description":"Each van conducts 20 camps a month — consultations, medicines, antenatal checks and referrals, free of cost."}]','{}','active', now() - interval '60 days', now() - interval '60 days'),
  ('skill-her-future','Skill Her Future: Vocational Training for Women','https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600','https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600',400000,152000,'Six-month tailoring, beauty-care and digital literacy courses that help women earn their first independent income.','80G',67,'["women","livelihood"]',0,0,0,1,0,'[{"id":1,"title":"From training to income","description":"78% of our graduates earn within 3 months of completing the course — an average of ₹6,500 per month."}]','{}','active', now() - interval '30 days', now() - interval '30 days'),
  ('flood-relief-2026','Assam Flood Relief 2026','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1600','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600',800000,712300,'Emergency relief kits — dry rations, clean water, tarpaulins and medicines — for families displaced by the 2026 Assam floods.','80G',421,'["disaster-relief"]',0,0,1,1,1,'[{"id":1,"title":"On the ground now","description":"Our teams are distributing 250 relief kits a day across 3 districts. ₹1,900 funds one complete family kit."}]','{"featured":true}','active', now() - interval '20 days', now() - interval '20 days'),
  ('winter-warmth-drive','Winter Warmth Drive (Draft)','https://images.unsplash.com/photo-1516715094483-75da7dee9758?w=1600','https://images.unsplash.com/photo-1516715094483-75da7dee9758?w=600',250000,0,'Blankets and warm clothing for homeless families ahead of winter. Campaign under preparation.','80G',0,'["shelter"]',0,0,0,0,0,'[]','{}','draft', null, now() - interval '5 days')
on conflict (slug) do nothing;

-- ─── Blogs ──────────────────────────────────────────────────────────────────
insert into blogs (slug, title, banner_image, description, content, category, seo, status, published_at, created_at) values
  ('a-classroom-under-the-banyan-tree','A Classroom Under the Banyan Tree','https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600','How a single volunteer-run study circle in Barmer grew into a network of 18 community schools.','[{"id":1,"title":"It started with twelve children","description":"In 2019, retired schoolteacher Kamla Devi began teaching twelve children under a banyan tree in Barmer district. There was no blackboard, no books — just a promise that every child who came would learn to read."},{"id":2,"title":"The network today","description":"Today that promise has grown into 18 community learning centres serving over 1,200 children, with trained facilitators, digital tablets and a hot meal every day."},{"id":3,"title":"What comes next","description":"Our goal for 2027 is to bring 10 more villages into the network and get 100% of our grade-8 graduates into government secondary schools."}]','Education','{"title":"A Classroom Under the Banyan Tree","description":"How one study circle grew into 18 community schools."}','published', now() - interval '12 days', now() - interval '14 days'),
  ('what-your-500-rupees-actually-does','What Your ₹500 Actually Does','https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600','A transparent breakdown of how a single donation travels from your UPI app to a child''s plate.','[{"id":1,"title":"The journey of a donation","description":"Every donation is receipted, tagged to a programme, and tracked in our public ledger. Here is exactly what ₹500 buys: 25 mid-day meals, or one school kit, or two health-camp consultations."},{"id":2,"title":"Our 92/8 promise","description":"92% of programme donations reach the field. The remaining 8% covers audits, compliance and the systems that keep us accountable to you."}]','Transparency','{}','published', now() - interval '30 days', now() - interval '32 days'),
  ('flood-diary-72-hours-in-assam','Flood Diary: 72 Hours in Assam','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1600','Field notes from our rapid-response team during the first three days of the 2026 Assam floods.','[{"id":1,"title":"Day one: the water rises","description":"By the time our team reached Dhemaji, 40 villages were underwater. We set up our first distribution point at a highway school and served 400 families before nightfall."},{"id":2,"title":"Day three: the long haul begins","description":"Relief is a sprint; recovery is a marathon. We are now planning temporary learning centres and livelihood support for the months ahead."}]','Field Stories','{}','published', now() - interval '18 days', now() - interval '18 days'),
  ('meet-the-women-of-udaan-shg','Meet the Women of Udaan Self-Help Group','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600','Twelve women, one sewing machine, and a business that now supplies uniforms to six schools.','[{"id":1,"title":"One machine, twelve dreams","description":"When the Udaan SHG formed in 2024, its members pooled ₹200 each to rent a single sewing machine. Two years on, they run a workshop with nine machines and a school-uniform contract worth ₹3 lakh a year."},{"id":2,"title":"The multiplier effect","description":"Each earning woman in our programme spends 90% of her income on her family — nutrition, education and healthcare. Empower one woman and you uplift an entire household."}]','Women Empowerment','{}','published', now() - interval '45 days', now() - interval '47 days'),
  ('volunteering-changed-my-sundays','How Volunteering Changed My Sundays (and My Life)','https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600','A software engineer from Pune on two years of weekend teaching with Sanveda.','[{"id":1,"title":"From spreadsheets to storybooks","description":"I signed up thinking I would teach maths. The children taught me patience, joy and how to celebrate small wins — a first full sentence read aloud, a first scholarship won."},{"id":2,"title":"Why I keep coming back","description":"Volunteering is the only meeting on my calendar I have never wanted to cancel. Two hours a week is all it takes to change a child''s trajectory — and your own."}]','Volunteering','{}','published', now() - interval '60 days', now() - interval '62 days'),
  ('annual-impact-report-preview','Annual Impact Report 2025-26: A Preview','https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600','Draft preview of our upcoming annual impact report.','[{"id":1,"title":"Draft in progress","description":"Full audited numbers land in August. Early highlights: 12,400 lives touched, 4 new districts, 96% donor retention."}]','Reports','{}','draft', null, now() - interval '3 days')
on conflict (slug) do nothing;

-- ─── Testimonials ───────────────────────────────────────────────────────────
insert into testimonials (id, name, designation, photo_url, quote, rating, category, is_featured, status, sort_order) values
  ('ffffffff-0000-4000-8000-000000000001','Priya Sharma','Monthly Donor since 2024','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400','I get a receipt in seconds and a field update every month. Sanveda is the most transparent organisation I have ever donated to.',5,'donor',true,'published',1),
  ('ffffffff-0000-4000-8000-000000000002','Rajesh Kumar','Corporate CSR Partner, TechServe India','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400','Their reporting discipline made our CSR audit effortless. Every rupee is traceable to a beneficiary and an outcome.',5,'partner',true,'published',2),
  ('ffffffff-0000-4000-8000-000000000003','Ananya Iyer','Volunteer Teacher, Pune','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400','Two hours every Sunday, and I have watched shy first-generation learners become confident readers. This is the best thing I do all week.',5,'volunteer',true,'published',3),
  ('ffffffff-0000-4000-8000-000000000004','Kamla Devi','Community Educator, Barmer','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400','Sanveda did not come to our village with answers. They came with questions, and then they stayed. That is why it works.',5,'community',false,'published',4),
  ('ffffffff-0000-4000-8000-000000000005','Dr. Vikram Singh','Medical Camp Lead','https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400','The mobile health van programme reaches patients who have never seen a doctor. We catch conditions early and save lives quietly.',5,'healthcare',false,'published',5)
on conflict (id) do nothing;

-- ─── Gallery ────────────────────────────────────────────────────────────────
insert into gallery_albums (id, slug, title, description, cover_image, status, sort_order) values
  ('cccccccc-0000-4000-8000-000000000001','education-programme-2026','Education Programme 2026','Moments from our community learning centres across Rajasthan.','https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200','published',1),
  ('cccccccc-0000-4000-8000-000000000002','health-camps','Health Camps','Mobile health van camps and screenings in remote villages.','https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200','published',2),
  ('cccccccc-0000-4000-8000-000000000003','flood-relief-assam','Flood Relief — Assam 2026','Relief distribution during the 2026 Assam floods.','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200','published',3)
on conflict (id) do nothing;

insert into gallery_items (id, album_id, media_type, url, caption, sort_order) values
  ('dddddddd-0000-4000-8000-000000000001','cccccccc-0000-4000-8000-000000000001','image','https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200','Morning assembly at the Barmer learning centre',1),
  ('dddddddd-0000-4000-8000-000000000002','cccccccc-0000-4000-8000-000000000001','image','https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200','Digital literacy class with donated tablets',2),
  ('dddddddd-0000-4000-8000-000000000003','cccccccc-0000-4000-8000-000000000001','image','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200','Scholarship award ceremony, March 2026',3),
  ('dddddddd-0000-4000-8000-000000000004','cccccccc-0000-4000-8000-000000000002','image','https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200','Antenatal check-up at a village camp',1),
  ('dddddddd-0000-4000-8000-000000000005','cccccccc-0000-4000-8000-000000000002','image','https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200','Mobile health van arriving at Khedla village',2),
  ('dddddddd-0000-4000-8000-000000000006','cccccccc-0000-4000-8000-000000000002','image','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200','Free medicine distribution counter',3),
  ('dddddddd-0000-4000-8000-000000000007','cccccccc-0000-4000-8000-000000000003','image','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200','Relief kits ready for distribution, Dhemaji',1),
  ('dddddddd-0000-4000-8000-000000000008','cccccccc-0000-4000-8000-000000000003','image','https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200','Community kitchen serving displaced families',2),
  ('dddddddd-0000-4000-8000-000000000009','cccccccc-0000-4000-8000-000000000003','image','https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200','Children''s nutrition corner at the relief camp',3)
on conflict (id) do nothing;

-- ─── Projects ───────────────────────────────────────────────────────────────
insert into projects (id, slug, title, description, focus_area, focus_area_id, status, budget, spent, beneficiaries_count, start_date, end_date, manager_name, progress_percent, project_code, lifecycle_stage, priority, location, received_funds) values
  ('11111111-0000-4000-8000-000000000001','community-schools-rajasthan','Community Schools Network — Rajasthan','Operating 18 community learning centres with trained facilitators, digital classrooms and daily meals.','Education','eeeeeeee-0000-4000-8000-000000000001','active',2400000,1560000,1240,'2025-04-01','2027-03-31','Meera Joshi',65,'PRJ-9001','execution','high','Barmer & Jodhpur, Rajasthan',1800000),
  ('11111111-0000-4000-8000-000000000002','mobile-health-units','Mobile Health Units Programme','Two fully-equipped medical vans conducting 40 camps a month across villages with no primary health centre.','Healthcare','eeeeeeee-0000-4000-8000-000000000002','active',1800000,820000,8600,'2025-07-01','2026-12-31','Dr. Vikram Singh',48,'PRJ-9002','execution','high','Alwar district, Rajasthan',1100000),
  ('11111111-0000-4000-8000-000000000003','udaan-women-skilling','Udaan Women Skilling Initiative','Vocational training and SHG incubation that has already helped 950 women start earning.','Women Empowerment','eeeeeeee-0000-4000-8000-000000000003','completed',900000,878000,950,'2024-06-01','2026-05-31','Sunita Rathore',100,'PRJ-9003','closure','medium','Jaipur rural',900000),
  ('11111111-0000-4000-8000-000000000004','assam-flood-response','Assam Flood Response 2026','Emergency relief and early recovery for flood-affected families across three districts.','Disaster Relief','eeeeeeee-0000-4000-8000-000000000004','active',1500000,640000,3400,'2026-06-20',null,'Arjun Borah',42,'PRJ-9004','execution','critical','Dhemaji, Lakhimpur & Majuli, Assam',750000)
on conflict (id) do nothing;

insert into project_milestones (id, project_id, title, description, due_date, completed_at, status, sort_order) values
  ('11111111-1111-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','Open 4 new learning centres','Sites identified in Jodhpur block','2026-09-30',null,'in_progress',1),
  ('11111111-1111-4000-8000-000000000002','11111111-0000-4000-8000-000000000001','Facilitator training cohort 3','32 facilitators certified','2026-05-15', now() - interval '40 days','completed',2),
  ('11111111-1111-4000-8000-000000000003','11111111-0000-4000-8000-000000000002','Commission second health van','Van fitted and licensed','2026-08-15',null,'in_progress',1),
  ('11111111-1111-4000-8000-000000000004','11111111-0000-4000-8000-000000000004','Distribute 5,000 relief kits','3,400 distributed so far','2026-08-31',null,'in_progress',1)
on conflict (id) do nothing;

insert into project_funding (id, project_id, source_name, amount, received_on, reference) values
  ('11111111-2222-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','TechServe India CSR',1200000,'2025-05-10','CSR-TS-2025-114'),
  ('11111111-2222-4000-8000-000000000002','11111111-0000-4000-8000-000000000001','Public donations (Educate 100 Girls)',600000,'2026-01-15','CAMP-EDU-100'),
  ('11111111-2222-4000-8000-000000000003','11111111-0000-4000-8000-000000000002','Arogya Foundation grant',800000,'2025-08-01','GRANT-ARG-2025-08'),
  ('11111111-2222-4000-8000-000000000004','11111111-0000-4000-8000-000000000004','Flood relief public appeal',750000,'2026-07-05','CAMP-FLOOD-26')
on conflict (id) do nothing;

insert into project_team (id, project_id, member_name, role, joined_on) values
  ('11111111-3333-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','Meera Joshi','Programme Manager','2025-04-01'),
  ('11111111-3333-4000-8000-000000000002','11111111-0000-4000-8000-000000000001','Kamla Devi','Lead Community Educator','2025-04-15'),
  ('11111111-3333-4000-8000-000000000003','11111111-0000-4000-8000-000000000002','Dr. Vikram Singh','Medical Lead','2025-07-01'),
  ('11111111-3333-4000-8000-000000000004','11111111-0000-4000-8000-000000000004','Arjun Borah','Field Coordinator','2026-06-21')
on conflict (id) do nothing;

-- ─── Beneficiaries ──────────────────────────────────────────────────────────
insert into beneficiaries (id, project_id, full_name, phone, email, city, state, category, program, support_type, notes, status, support_amount, last_support_date, beneficiary_code, pipeline_stage, priority, case_worker) values
  ('22222222-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','Pooja Meghwal','+91 90000 11001',null,'Barmer','Rajasthan','Child Education','Community Schools','Scholarship','Grade 7, top of her class. Scholarship covers fees, books and transport.','active',12000,'2026-06-15','BEN-9001','enrolled','medium','Kamla Devi'),
  ('22222222-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000001','Ravi Bhil','+91 90000 11002',null,'Jodhpur','Rajasthan','Child Education','Community Schools','School Kit + Meals','First-generation learner, re-enrolled after dropout in 2025.','active',8000,'2026-07-01','BEN-9002','enrolled','high','Meera Joshi'),
  ('22222222-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000002','Santosh Kanwar','+91 90000 11003',null,'Alwar','Rajasthan','Maternal Health','Mobile Health Units','Antenatal Care','Third-trimester care and nutrition supplements via monthly camps.','active',6500,'2026-07-10','BEN-9003','receiving_support','high','Dr. Vikram Singh'),
  ('22222222-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000003','Rekha Devi','+91 90000 11004',null,'Jaipur','Rajasthan','Livelihood','Udaan Skilling','Vocational Training','Completed tailoring course; now earning ₹7,200/month with Udaan SHG.','completed',15000,'2026-04-20','BEN-9004','graduated','low','Sunita Rathore'),
  ('22222222-0000-4000-8000-000000000005','11111111-0000-4000-8000-000000000004','Bipul Das','+91 90000 11005',null,'Dhemaji','Assam','Disaster Relief','Flood Response','Relief Kit + Shelter','Family of five displaced by floods; received kit and temporary shelter support.','active',4500,'2026-07-08','BEN-9005','receiving_support','critical','Arjun Borah'),
  ('22222222-0000-4000-8000-000000000006','11111111-0000-4000-8000-000000000004','Junali Pegu','+91 90000 11006',null,'Majuli','Assam','Disaster Relief','Flood Response','Medical + Nutrition','Elderly beneficiary awaiting follow-up medical camp; case flagged for review.','on_hold',2000,'2026-06-28','BEN-9006','assessment','high','Arjun Borah')
on conflict (id) do nothing;

insert into beneficiary_support (id, beneficiary_id, project_id, support_type, amount, provided_on, notes) values
  ('22222222-1111-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','Scholarship disbursement',6000,'2026-06-15','First tranche AY 2026-27'),
  ('22222222-1111-4000-8000-000000000002','22222222-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000002','Antenatal camp visit',1500,'2026-07-10','Checkup + supplements'),
  ('22222222-1111-4000-8000-000000000003','22222222-0000-4000-8000-000000000005','11111111-0000-4000-8000-000000000004','Relief kit',1900,'2026-07-08','Standard family kit'),
  ('22222222-1111-4000-8000-000000000004','22222222-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000003','Sewing machine grant',8000,'2026-03-12','Graduation asset grant')
on conflict (id) do nothing;

insert into beneficiary_outcomes (id, beneficiary_id, label, status, completed, measured_on, notes) values
  ('22222222-2222-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','Promoted to Grade 8','achieved',true,'2026-05-30','Scored 82% overall'),
  ('22222222-2222-4000-8000-000000000002','22222222-0000-4000-8000-000000000004','Monthly income above ₹6,000','achieved',true,'2026-04-30','₹7,200/month via SHG'),
  ('22222222-2222-4000-8000-000000000003','22222222-0000-4000-8000-000000000005','Family in permanent shelter','in_progress',false,null,'Shelter rebuild planned for September')
on conflict (id) do nothing;

-- ─── Events ─────────────────────────────────────────────────────────────────
insert into events (id, project_id, slug, title, description, location, event_date, end_date, capacity, registered_count, status, banner_image, event_code, category, organizer) values
  ('33333333-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000002','mega-health-camp-august','Mega Health Camp — Alwar','Free consultations, eye screening, and medicine distribution with 12 volunteer doctors.','Government School Ground, Khedla, Alwar', now() + interval '12 days', now() + interval '12 days' + interval '8 hours',500,214,'published','https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1600','EVT-9001','Health Camp','Sanveda Health Team'),
  ('33333333-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000001','volunteer-orientation-august','Volunteer Orientation — August Cohort','Onboarding session for new weekend teaching volunteers: curriculum, safeguarding and classroom practice.','Sanveda Office, Jaipur + Online', now() + interval '19 days', now() + interval '19 days' + interval '3 hours',80,52,'published','https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600','EVT-9002','Orientation','Volunteer Programme'),
  ('33333333-0000-4000-8000-000000000003',null,'annual-charity-run-2026','Sanveda Annual Charity Run 2026','5K fun run raising funds for the mid-day meal programme. Every registration feeds a child for a month.','Central Park, Jaipur', now() + interval '40 days', now() + interval '40 days' + interval '5 hours',1000,368,'published','https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1600','EVT-9003','Fundraiser','Events Committee'),
  ('33333333-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000003','shg-graduation-ceremony','Udaan SHG Graduation Ceremony','Certificate ceremony for 120 women completing vocational training — held last month.','Community Hall, Jaipur Rural', now() - interval '25 days', now() - interval '25 days' + interval '4 hours',200,186,'completed','https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600','EVT-9004','Ceremony','Udaan Programme'),
  ('33333333-0000-4000-8000-000000000005',null,'donor-meetup-draft','Donor Meet & Greet (Planning)','Quarterly donor engagement evening. Venue being finalised.','TBD, Jaipur', now() + interval '60 days', null,100,0,'draft',null,'EVT-9005','Engagement','Donor Relations')
on conflict (id) do nothing;

insert into event_registrations (id, event_id, full_name, email, phone, status, registration_code, participant_type) values
  ('33333333-1111-4000-8000-000000000001','33333333-0000-4000-8000-000000000001','Suresh Yadav','suresh.yadav@example.com','+91 90000 22001','registered','REG-9001','participant'),
  ('33333333-1111-4000-8000-000000000002','33333333-0000-4000-8000-000000000001','Dr. Nisha Gupta','nisha.gupta@example.com','+91 90000 22002','registered','REG-9002','volunteer_doctor'),
  ('33333333-1111-4000-8000-000000000003','33333333-0000-4000-8000-000000000002','Ananya Iyer','ananya.iyer@example.com','+91 90000 22003','registered','REG-9003','volunteer'),
  ('33333333-1111-4000-8000-000000000004','33333333-0000-4000-8000-000000000003','Priya Sharma','priya.sharma@example.com','+91 90000 22004','registered','REG-9004','runner'),
  ('33333333-1111-4000-8000-000000000005','33333333-0000-4000-8000-000000000004','Rekha Devi','rekha.devi@example.com','+91 90000 22005','attended','REG-9005','graduate')
on conflict (id) do nothing;

insert into event_agenda (id, event_id, starts_at, ends_at, title, speaker, sort_order) values
  ('33333333-2222-4000-8000-000000000001','33333333-0000-4000-8000-000000000001', now() + interval '12 days', now() + interval '12 days' + interval '2 hours','General OPD & Registration','Dr. Vikram Singh',1),
  ('33333333-2222-4000-8000-000000000002','33333333-0000-4000-8000-000000000001', now() + interval '12 days' + interval '2 hours', now() + interval '12 days' + interval '5 hours','Eye Screening Camp','Dr. Nisha Gupta',2),
  ('33333333-2222-4000-8000-000000000003','33333333-0000-4000-8000-000000000002', now() + interval '19 days', now() + interval '19 days' + interval '1 hour','Welcome & Sanveda Story','Meera Joshi',1)
on conflict (id) do nothing;

-- ─── Enquiries ──────────────────────────────────────────────────────────────
insert into enquiries (id, name, phone, email, subject, message, status, ticket_code, category, priority, source, workflow_stage, organization, lead_score, created_at) values
  ('44444444-0000-4000-8000-000000000001','Rohit Malhotra','+91 90000 33001','rohit.malhotra@example.com','CSR partnership enquiry','We are a mid-size IT firm in Gurgaon looking to deploy our CSR budget (~₹25L/yr) in education. Would like to discuss a partnership.','new','ENQ-9001','partnership','high','website','new','Cloudnine Technologies',85, now() - interval '1 day'),
  ('44444444-0000-4000-8000-000000000002','Sneha Patil','+91 90000 33002','sneha.patil@example.com','School group volunteering','I teach at a school in Mumbai and want to bring 20 students for a service-learning visit in October.','in_progress','ENQ-9002','volunteer','medium','email','in_progress','St. Xavier''s High School',60, now() - interval '4 days'),
  ('44444444-0000-4000-8000-000000000003','Amit Verma','+91 90000 33003','amit.verma@example.com','80G receipt not received','I donated ₹10,000 on 5 July but have not received my 80G receipt yet. Please help.','in_progress','ENQ-9003','donations','high','website','in_progress',null,40, now() - interval '2 days'),
  ('44444444-0000-4000-8000-000000000004','Farheen Khan','+91 90000 33004','farheen.khan@example.com','Media interview request','Journalist with The National Herald covering flood relief efforts. Requesting an interview with your Assam team.','resolved','ENQ-9004','media','medium','phone','closed','The National Herald',55, now() - interval '10 days'),
  ('44444444-0000-4000-8000-000000000005','Deepak Nair','+91 90000 33005','deepak.nair@example.com','Legacy giving question','I would like to include Sanveda in my will. What is the process for legacy donations?','new','ENQ-9005','donations','high','website','new',null,90, now() - interval '6 hours')
on conflict (id) do nothing;

insert into enquiry_messages (id, enquiry_id, author_type, author_name, message, sent_at) values
  ('44444444-1111-4000-8000-000000000001','44444444-0000-4000-8000-000000000002','requester','Sneha Patil','Following up — do you have availability in the second week of October?', now() - interval '2 days'),
  ('44444444-1111-4000-8000-000000000002','44444444-0000-4000-8000-000000000002','admin','Sanveda Admin','Hi Sneha, yes — Oct 12-16 works. Sharing the visit protocol and consent forms shortly.', now() - interval '1 day'),
  ('44444444-1111-4000-8000-000000000003','44444444-0000-4000-8000-000000000003','admin','Sanveda Admin','Apologies for the delay, Amit. Receipt regenerated and emailed. Please confirm receipt.', now() - interval '1 day')
on conflict (id) do nothing;

-- ─── Memberships ────────────────────────────────────────────────────────────
insert into memberships (id, member_id, full_name, email, phone, city, state, occupation, motivation, tier, status, renewal_date, certificate_number, pipeline_stage, payment_status, activity_status, created_at) values
  ('55555555-0000-4000-8000-000000000001','SVD-MEM-2026-9001','Priya Sharma','priya.sharma@example.com','+91 90000 44001','Delhi','Delhi','Marketing Manager','Believe deeply in education equity; want to be more than a donor.','patron','active','2027-03-31','SVD-CERT-2026-9001','member','paid','active', now() - interval '140 days'),
  ('55555555-0000-4000-8000-000000000002','SVD-MEM-2026-9002','Rajesh Kumar','rajesh.kumar@example.com','+91 90000 44002','Bengaluru','Karnataka','Product Director','Long-time supporter; joined as founding member to help with governance.','founding','active','2027-03-31','SVD-CERT-2026-9002','member','paid','active', now() - interval '300 days'),
  ('55555555-0000-4000-8000-000000000003','SVD-MEM-2026-9003','Ananya Iyer','ananya.iyer@example.com','+91 90000 44003','Pune','Maharashtra','Software Engineer','Volunteer teacher wanting a formal membership.','standard','active','2027-03-31','SVD-CERT-2026-9003','member','paid','active', now() - interval '90 days'),
  ('55555555-0000-4000-8000-000000000004',null,'Mohammed Irfan','mohammed.irfan@example.com','+91 90000 44004','Hyderabad','Telangana','Chartered Accountant','Interested in helping with financial governance and audits.','standard','pending',null,null,'application','unpaid','inactive', now() - interval '3 days'),
  ('55555555-0000-4000-8000-000000000005',null,'Kavita Reddy','kavita.reddy@example.com','+91 90000 44005','Chennai','Tamil Nadu','Doctor','Want to support and join medical camps as a member-volunteer.','patron','pending',null,null,'application','unpaid','inactive', now() - interval '1 day')
on conflict (id) do nothing;

insert into membership_payments (id, membership_id, amount, payment_date, status, reference) values
  ('55555555-1111-4000-8000-000000000001','55555555-0000-4000-8000-000000000001',5000,'2026-03-15','paid','MEMPAY-9001'),
  ('55555555-1111-4000-8000-000000000002','55555555-0000-4000-8000-000000000002',25000,'2025-09-25','paid','MEMPAY-9002'),
  ('55555555-1111-4000-8000-000000000003','55555555-0000-4000-8000-000000000003',1000,'2026-04-22','paid','MEMPAY-9003')
on conflict (id) do nothing;

-- ─── Internships ────────────────────────────────────────────────────────────
insert into internships (id, application_id, full_name, email, phone, university, course, semester, preferred_department, duration_weeks, motivation, skills, status, intern_code, pipeline_stage, program_name, mentor_name, mode, stipend_amount, start_date, end_date, created_at) values
  ('66666666-0000-4000-8000-000000000001','INT-2026-9001','Aditi Deshmukh','aditi.deshmukh@example.com','+91 90000 55001','TISS Mumbai','MA Social Work','3','Programmes',12,'Field experience in education programmes for my dissertation on rural learning outcomes.','Research, Hindi & Marathi fluency, M&E basics','active','INTC-9001','onboarded','Field Programmes Internship','Meera Joshi','on-site',8000,'2026-06-01','2026-08-24', now() - interval '70 days'),
  ('66666666-0000-4000-8000-000000000002','INT-2026-9002','Karan Mehta','karan.mehta@example.com','+91 90000 55002','IIM Udaipur','MBA','2','Fundraising',8,'Want hands-on experience in non-profit fundraising strategy and donor analytics.','Excel, SQL, donor CRM tools','active','INTC-9002','onboarded','Fundraising & Analytics Internship','Sanveda Admin','hybrid',10000,'2026-06-15','2026-08-10', now() - interval '50 days'),
  ('66666666-0000-4000-8000-000000000003','INT-2026-9003','Shruti Nair','shruti.nair@example.com','+91 90000 55003','Christ University','BA Media Studies','5','Communications',10,'Storytelling internship — want to document field stories and impact narratives.','Photography, video editing, copywriting','review','INTC-9003','interview','Communications Internship',null,'remote',5000,null,null, now() - interval '8 days'),
  ('66666666-0000-4000-8000-000000000004','INT-2026-9004','Vivek Anand','vivek.anand@example.com','+91 90000 55004','Delhi University','B.Com','6','Finance',12,'Interested in NGO accounting, 80G compliance and audit processes.','Tally, Excel, accounting basics','pending','INTC-9004','application','Finance Internship',null,'on-site',6000,null,null, now() - interval '2 days')
on conflict (id) do nothing;

insert into intern_tasks (id, internship_id, title, due_date, status) values
  ('66666666-1111-4000-8000-000000000001','66666666-0000-4000-8000-000000000001','Baseline survey — 4 learning centres','2026-07-30','in_progress'),
  ('66666666-1111-4000-8000-000000000002','66666666-0000-4000-8000-000000000001','Facilitator interview writeups','2026-07-15','completed'),
  ('66666666-1111-4000-8000-000000000003','66666666-0000-4000-8000-000000000002','Donor retention cohort analysis','2026-08-01','in_progress')
on conflict (id) do nothing;

-- ─── Volunteers ─────────────────────────────────────────────────────────────
insert into volunteer_applications (id, volunteer_id, status, full_name, email, phone, city, state, occupation, preferred_roles, volunteer_type, hours_per_week, skills, motivation, agreed_policies, agreed_background_check, agreed_data_processing, assigned_team, department, created_at) values
  ('VOL-2026-9001','SVD-VOL-9001','active','Ananya Iyer','ananya.iyer@example.com','+91 90000 66001','Pune','Maharashtra','Software Engineer','["teaching","mentoring"]','part-time','4','Maths & English teaching, curriculum design','Weekend teaching has been the most meaningful part of my week for two years.',true,true,true,'Education — Pune','Programmes', now() - interval '400 days'),
  ('VOL-2026-9002','SVD-VOL-9002','active','Suresh Yadav','suresh.yadav@example.com','+91 90000 66002','Jaipur','Rajasthan','Pharmacist','["health_camps","logistics"]','part-time','6','Pharmacy, inventory management, first aid','Want to support the mobile health camps with medicine logistics.',true,true,true,'Health — Jaipur','Health', now() - interval '200 days'),
  ('VOL-2026-9003','SVD-VOL-9003','approved','Divya Krishnan','divya.krishnan@example.com','+91 90000 66003','Bengaluru','Karnataka','Graphic Designer','["design","social_media"]','part-time','3','Brand design, Instagram content, Canva/Figma','Want to use my design skills for campaigns that matter.',true,true,true,'Communications','Communications', now() - interval '20 days'),
  ('VOL-2026-9004',null,'interview','Harsh Agarwal','harsh.agarwal@example.com','+91 90000 66004','Delhi','Delhi','MBA Student','["fundraising","events"]','part-time','5','Event management, sponsorship outreach','Helped organise college fundraisers; want to scale that for the charity run.',true,true,true,null,'Fundraising', now() - interval '6 days'),
  ('VOL-2026-9005',null,'screening','Lakshmi Menon','lakshmi.menon@example.com','+91 90000 66005','Kochi','Kerala','Retired Teacher','["teaching"]','full-time','20','35 years teaching experience, teacher training','Retired and want to dedicate my time to training community educators.',true,true,true,null,'Programmes', now() - interval '3 days'),
  ('VOL-2026-9006',null,'pending','Nikhil Joshi','nikhil.joshi@example.com','+91 90000 66006','Mumbai','Maharashtra','Data Analyst','["data","research"]','part-time','4','Python, dashboards, impact measurement','Would love to help build your impact measurement dashboards.',true,false,true,null,null, now() - interval '1 day')
on conflict (id) do nothing;

insert into volunteer_assignments (id, volunteer_application_id, project_id, role, starts_at, status) values
  ('77777777-1111-4000-8000-000000000001','VOL-2026-9001','11111111-0000-4000-8000-000000000001','Weekend Teacher', now() - interval '390 days','active'),
  ('77777777-1111-4000-8000-000000000002','VOL-2026-9002','11111111-0000-4000-8000-000000000002','Camp Pharmacist', now() - interval '190 days','active')
on conflict (id) do nothing;

insert into volunteer_time_entries (id, assignment_id, service_date, hours, notes) values
  ('77777777-2222-4000-8000-000000000001','77777777-1111-4000-8000-000000000001', current_date - 7, 4, 'Sunday classes — fractions and reading circle'),
  ('77777777-2222-4000-8000-000000000002','77777777-1111-4000-8000-000000000001', current_date - 14, 4, 'Sunday classes — mock test prep'),
  ('77777777-2222-4000-8000-000000000003','77777777-1111-4000-8000-000000000002', current_date - 10, 6, 'Health camp Khedla — dispensary desk')
on conflict (id) do nothing;

-- ─── Donor profiles ─────────────────────────────────────────────────────────
insert into donor_profiles (id, email, full_name, phone, address, donor_type, giving_level, engagement_status, is_monthly, tags) values
  ('77777777-0000-4000-8000-000000000001','priya.sharma@example.com','Priya Sharma','+91 90000 44001','C-402, Green Park, New Delhi','individual','gold','engaged',true,'{monthly,patron_member}'),
  ('77777777-0000-4000-8000-000000000002','rajesh.kumar@example.com','Rajesh Kumar','+91 90000 44002','Whitefield, Bengaluru','individual','platinum','engaged',true,'{monthly,founding_member,csr_contact}'),
  ('77777777-0000-4000-8000-000000000003','amit.verma@example.com','Amit Verma','+91 90000 33003','Sector 62, Noida','individual','silver','new',false,'{first_time}'),
  ('77777777-0000-4000-8000-000000000004','csr@techserve.example.com','TechServe India Pvt Ltd','+91 90000 77004','Cyber City, Gurgaon','corporate','platinum','engaged',false,'{csr,education}'),
  ('77777777-0000-4000-8000-000000000005','deepak.nair@example.com','Deepak Nair','+91 90000 33005','Panampilly Nagar, Kochi','individual','gold','at_risk',false,'{legacy_interest}')
on conflict (email) do nothing;

insert into donor_communications (id, donor_id, channel, direction, subject, body, occurred_at, status) values
  ('77777777-3333-4000-8000-000000000001','77777777-0000-4000-8000-000000000001','email','outbound','July impact update','Monthly impact digest with field photos from Barmer learning centres.', now() - interval '5 days','sent'),
  ('77777777-3333-4000-8000-000000000002','77777777-0000-4000-8000-000000000004','call','outbound','CSR renewal discussion','Discussed FY27 CSR renewal; they want a site visit in September.', now() - interval '9 days','completed'),
  ('77777777-3333-4000-8000-000000000003','77777777-0000-4000-8000-000000000005','email','inbound','Legacy giving','Asked about including Sanveda in his will; needs legal process note.', now() - interval '6 hours','received')
on conflict (id) do nothing;

insert into donor_tasks (id, donor_id, title, due_at, status) values
  ('77777777-4444-4000-8000-000000000001','77777777-0000-4000-8000-000000000004','Schedule TechServe site visit (September)', now() + interval '10 days','pending'),
  ('77777777-4444-4000-8000-000000000002','77777777-0000-4000-8000-000000000005','Send legacy giving process note', now() + interval '2 days','pending'),
  ('77777777-4444-4000-8000-000000000003','77777777-0000-4000-8000-000000000003','Follow up on 80G receipt confirmation', now() + interval '1 day','in_progress')
on conflict (id) do nothing;

-- ─── Donations ──────────────────────────────────────────────────────────────
insert into donations (id, campaign_id, campaign_slug, campaign_title, amount, currency, is_anonymous, donor_name, donor_email, donor_phone, pan_number, status, payment_gateway, donation_type, razorpay_order_id, razorpay_payment_id, paid_at, receipt_number, receipt_generated, receipt_sent, created_at)
select v.id::uuid, c.id, v.slug, c.title, v.amount, 'INR', v.anon, v.dname, v.demail, v.dphone, v.pan, v.status, 'razorpay', v.dtype, v.order_id, v.payment_id, v.paid_at, v.receipt, v.receipt is not null, v.receipt is not null, v.created_at
from (values
  ('88888888-0000-4000-8000-000000000001','educate-100-girls',25000::numeric,false,'Priya Sharma','priya.sharma@example.com','+91 90000 44001','ABCPS1234D','completed','one_time','order_demo_9001','pay_demo_9001', now() - interval '150 days','SVD-80G-2026-9001', now() - interval '150 days'),
  ('88888888-0000-4000-8000-000000000002','educate-100-girls',100000::numeric,false,'TechServe India Pvt Ltd','csr@techserve.example.com','+91 90000 77004','AABCT5678E','completed','one_time','order_demo_9002','pay_demo_9002', now() - interval '120 days','SVD-80G-2026-9002', now() - interval '120 days'),
  ('88888888-0000-4000-8000-000000000003','mid-day-meals',5000::numeric,false,'Ananya Iyer','ananya.iyer@example.com','+91 90000 44003',null,'completed','one_time','order_demo_9003','pay_demo_9003', now() - interval '100 days','SVD-80G-2026-9003', now() - interval '100 days'),
  ('88888888-0000-4000-8000-000000000004','mid-day-meals',2500::numeric,true,null,null,null,null,'completed','one_time','order_demo_9004','pay_demo_9004', now() - interval '85 days','SVD-80G-2026-9004', now() - interval '85 days'),
  ('88888888-0000-4000-8000-000000000005','mobile-health-vans',50000::numeric,false,'Rajesh Kumar','rajesh.kumar@example.com','+91 90000 44002','BXYPK9012F','completed','one_time','order_demo_9005','pay_demo_9005', now() - interval '55 days','SVD-80G-2026-9005', now() - interval '55 days'),
  ('88888888-0000-4000-8000-000000000006','skill-her-future',15000::numeric,false,'Deepak Nair','deepak.nair@example.com','+91 90000 33005',null,'completed','one_time','order_demo_9006','pay_demo_9006', now() - interval '28 days','SVD-80G-2026-9006', now() - interval '28 days'),
  ('88888888-0000-4000-8000-000000000007','flood-relief-2026',10000::numeric,false,'Amit Verma','amit.verma@example.com','+91 90000 33003','AKJPV3456G','completed','one_time','order_demo_9007','pay_demo_9007', now() - interval '16 days','SVD-80G-2026-9007', now() - interval '16 days'),
  ('88888888-0000-4000-8000-000000000008','flood-relief-2026',1900::numeric,true,null,null,null,null,'completed','one_time','order_demo_9008','pay_demo_9008', now() - interval '10 days','SVD-80G-2026-9008', now() - interval '10 days'),
  ('88888888-0000-4000-8000-000000000009','flood-relief-2026',7600::numeric,false,'Sneha Patil','sneha.patil@example.com','+91 90000 33002',null,'completed','one_time','order_demo_9009','pay_demo_9009', now() - interval '6 days','SVD-80G-2026-9009', now() - interval '6 days'),
  ('88888888-0000-4000-8000-000000000010','mid-day-meals',2000::numeric,false,'Priya Sharma','priya.sharma@example.com','+91 90000 44001','ABCPS1234D','completed','recurring','order_demo_9010','pay_demo_9010', now() - interval '35 days','SVD-80G-2026-9010', now() - interval '35 days'),
  ('88888888-0000-4000-8000-000000000011','mid-day-meals',2000::numeric,false,'Priya Sharma','priya.sharma@example.com','+91 90000 44001','ABCPS1234D','completed','recurring','order_demo_9011','pay_demo_9011', now() - interval '5 days','SVD-80G-2026-9011', now() - interval '5 days'),
  ('88888888-0000-4000-8000-000000000012','educate-100-girls',3000::numeric,false,'Rohit Malhotra','rohit.malhotra@example.com','+91 90000 33001',null,'pending','one_time','order_demo_9012',null,null,null, now() - interval '2 hours'),
  ('88888888-0000-4000-8000-000000000013','flood-relief-2026',5000::numeric,false,'Kavita Reddy','kavita.reddy@example.com','+91 90000 44005',null,'pending','one_time','order_demo_9013',null,null,null, now() - interval '1 day'),
  ('88888888-0000-4000-8000-000000000014','mobile-health-vans',12000::numeric,false,'Mohammed Irfan','mohammed.irfan@example.com','+91 90000 44004',null,'refunded','one_time','order_demo_9014','pay_demo_9014', now() - interval '40 days',null, now() - interval '40 days'),
  ('88888888-0000-4000-8000-000000000015','educate-100-girls',8000::numeric,false,'Divya Krishnan','divya.krishnan@example.com','+91 90000 66003',null,'completed','one_time','order_demo_9015','pay_demo_9015', now() - interval '65 days','SVD-80G-2026-9015', now() - interval '65 days')
) as v(id, slug, amount, anon, dname, demail, dphone, pan, status, dtype, order_id, payment_id, paid_at, receipt, created_at)
join campaigns c on c.slug = v.slug
on conflict (id) do nothing;

insert into payment_transactions (id, donation_id, gateway, gateway_order_id, gateway_payment_id, transaction_type, amount, currency, status, occurred_at)
select ('13131313-0000-4000-8000-0000000000' || lpad((row_number() over ())::text, 2, '0'))::uuid,
       d.id, 'razorpay', d.razorpay_order_id, d.razorpay_payment_id, 'capture', d.amount, 'INR', 'captured', coalesce(d.paid_at, d.created_at)
from donations d
where d.razorpay_payment_id like 'pay_demo_%'
on conflict do nothing;

insert into donation_ops_meta (donation_id, source, gateway, payment_method, tax_exemption, verified_at)
select d.id, 'website', 'razorpay',
       case when d.amount >= 50000 then 'netbanking' when d.amount >= 10000 then 'card' else 'upi' end,
       '80G', d.paid_at
from donations d where d.id::text like '88888888-%'
on conflict (donation_id) do nothing;

insert into donation_receipts (id, donation_id, receipt_number, financial_year, receipt_type, receipt_snapshot, generated_at)
select ('14141414-0000-4000-8000-0000000000' || lpad((row_number() over ())::text, 2, '0'))::uuid,
       d.id, d.receipt_number, 'FY 2026-27', '80G',
       jsonb_build_object('donor', coalesce(d.donor_name,'Anonymous'), 'amount', d.amount, 'campaign', d.campaign_title),
       d.paid_at
from donations d
where d.receipt_number is not null and d.id::text like '88888888-%'
on conflict (donation_id) do nothing;

insert into donation_refunds (id, donation_id, reason, amount, status, initiated_at, completed_at, gateway_refund_id)
select '15151515-0000-4000-8000-000000000001'::uuid, d.id, 'Duplicate payment reported by donor', d.amount, 'completed', now() - interval '38 days', now() - interval '36 days', 'rfnd_demo_9001'
from donations d where d.id = '88888888-0000-4000-8000-000000000014'
on conflict (id) do nothing;

-- ─── Recurring giving ───────────────────────────────────────────────────────
insert into recurring_donations (id, campaign_id, gateway, gateway_subscription_id, amount, currency, interval_unit, interval_count, donor_name, donor_email, donor_phone, status, starts_at, next_charge_at)
select v.id::uuid, c.id, 'razorpay', v.sub_id, v.amount, 'INR', 'month', 1, v.dname, v.demail, v.dphone, v.status, v.starts_at, v.next_at
from (values
  ('12121212-0000-4000-8000-000000000001','mid-day-meals',2000::numeric,'sub_demo_9001','Priya Sharma','priya.sharma@example.com','+91 90000 44001','active', now() - interval '95 days', now() + interval '25 days'),
  ('12121212-0000-4000-8000-000000000002','educate-100-girls',5000::numeric,'sub_demo_9002','Rajesh Kumar','rajesh.kumar@example.com','+91 90000 44002','active', now() - interval '200 days', now() + interval '12 days'),
  ('12121212-0000-4000-8000-000000000003','mobile-health-vans',1000::numeric,'sub_demo_9003','Ananya Iyer','ananya.iyer@example.com','+91 90000 44003','paused', now() - interval '150 days', null)
) as v(id, slug, amount, sub_id, dname, demail, dphone, status, starts_at, next_at)
join campaigns c on c.slug = v.slug
on conflict (id) do nothing;

insert into recurring_payment_attempts (id, recurring_donation_id, donation_id, scheduled_for, attempted_at, status, attempt_number) values
  ('12121212-1111-4000-8000-000000000001','12121212-0000-4000-8000-000000000001','88888888-0000-4000-8000-000000000010', now() - interval '35 days', now() - interval '35 days','succeeded',1),
  ('12121212-1111-4000-8000-000000000002','12121212-0000-4000-8000-000000000001','88888888-0000-4000-8000-000000000011', now() - interval '5 days', now() - interval '5 days','succeeded',1),
  ('12121212-1111-4000-8000-000000000003','12121212-0000-4000-8000-000000000003',null, now() - interval '20 days', now() - interval '20 days','failed',1)
on conflict (id) do nothing;

-- ─── Finance ────────────────────────────────────────────────────────────────
insert into expenses (id, project_id, category, description, vendor_name, amount, expense_date, payment_method, status, reference, created_at) values
  ('99999999-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','Programme Supplies','School kits (bags, books, stationery) for 200 children','Bharat Stationery Mart',86000,current_date - 45,'bank_transfer','paid','EXP-9001', now() - interval '45 days'),
  ('99999999-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000002','Medical Supplies','Medicines and consumables for July health camps','MedPlus Distributors',64500,current_date - 20,'bank_transfer','paid','EXP-9002', now() - interval '20 days'),
  ('99999999-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000004','Relief Materials','1,000 tarpaulins and dry ration kits — Assam','Eastern Traders, Guwahati',190000,current_date - 12,'bank_transfer','approved','EXP-9003', now() - interval '12 days'),
  ('99999999-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000001','Transport','Monthly school transport contract — Barmer routes','Marudhar Travels',42000,current_date - 8,'upi','approved','EXP-9004', now() - interval '8 days'),
  ('99999999-0000-4000-8000-000000000005',null,'Administration','Annual statutory audit fee FY 2025-26','S.K. Jain & Associates',75000,current_date - 5,'bank_transfer','pending','EXP-9005', now() - interval '5 days'),
  ('99999999-0000-4000-8000-000000000006','11111111-0000-4000-8000-000000000002','Fuel & Maintenance','Health van fuel and servicing — July','HP Fuel Station Alwar',18200,current_date - 2,'card','pending','EXP-9006', now() - interval '2 days')
on conflict (id) do nothing;

insert into income_records (id, source, description, amount, income_date, reference_id, campaign_id, project_id, created_at)
select v.id::uuid, v.source, v.description, v.amount, v.income_date, v.ref, c.id, v.project_id::uuid, v.created_at
from (values
  ('aaaaaaaa-1111-4000-8000-000000000001','donation','Online donations — Educate 100 Girls (batch)',136000::numeric,current_date - 90,'INC-9001','educate-100-girls','11111111-0000-4000-8000-000000000001', now() - interval '90 days'),
  ('aaaaaaaa-1111-4000-8000-000000000002','csr','TechServe India CSR grant — education',100000::numeric,current_date - 120,'INC-9002','educate-100-girls','11111111-0000-4000-8000-000000000001', now() - interval '120 days'),
  ('aaaaaaaa-1111-4000-8000-000000000003','donation','Flood relief public appeal — week 1',412300::numeric,current_date - 15,'INC-9003','flood-relief-2026','11111111-0000-4000-8000-000000000004', now() - interval '15 days'),
  ('aaaaaaaa-1111-4000-8000-000000000004','grant','Arogya Foundation grant — mobile health units',800000::numeric,current_date - 350,'INC-9004',null,'11111111-0000-4000-8000-000000000002', now() - interval '350 days'),
  ('aaaaaaaa-1111-4000-8000-000000000005','membership','Membership fees Q1 FY27',31000::numeric,current_date - 60,'INC-9005',null,null, now() - interval '60 days'),
  ('aaaaaaaa-1111-4000-8000-000000000006','other','Charity run 2025 surplus carried forward',54000::numeric,current_date - 200,'INC-9006',null,null, now() - interval '200 days')
) as v(id, source, description, amount, income_date, ref, slug, project_id, created_at)
left join campaigns c on c.slug = v.slug
on conflict (id) do nothing;

-- ─── Documents & verification ───────────────────────────────────────────────
insert into documents (id, document_id, title, category, folder, description, owner, version, issue_date, visibility, status, tags, file_size_mb, is_compliance) values
  ('bbbbbbbb-0000-4000-8000-000000000001','DOC-2026-9001','80G Registration Certificate','Compliance','compliance','Income Tax 80G approval — valid till AY 2028-29.','Admin','v1.0','2023-04-01','public','published','["80g","tax","compliance"]',1.2,true),
  ('bbbbbbbb-0000-4000-8000-000000000002','DOC-2026-9002','12A Registration Certificate','Compliance','compliance','12A registration under the Income Tax Act.','Admin','v1.0','2023-04-01','public','published','["12a","compliance"]',0.9,true),
  ('bbbbbbbb-0000-4000-8000-000000000003','DOC-2026-9003','Annual Report FY 2024-25','Reports','public','Audited annual report with programme and financial statements.','Admin','v2.1','2025-09-30','public','published','["annual-report","audit"]',6.4,true),
  ('bbbbbbbb-0000-4000-8000-000000000004','DOC-2026-9004','Board Meeting Minutes — June 2026','Governance','internal','Minutes of the quarterly board meeting.','Admin','v1.0','2026-06-28','internal','approved','["board","minutes"]',0.3,false),
  ('bbbbbbbb-0000-4000-8000-000000000005','DOC-2026-9005','Flood Response SOP (Draft)','Operations','internal','Standard operating procedure for rapid flood response deployments.','Admin','v0.3',null,'restricted','under_review','["sop","disaster"]',1.1,false)
on conflict (id) do nothing;

insert into verification_records (id, code, type, holder_name, reference_id, metadata, valid_until) values
  ('16161616-0000-4000-8000-000000000001','SVD-VER-9001','donation_receipt','Priya Sharma','SVD-80G-2026-9001','{"amount":25000,"campaign":"Educate 100 Girls in Rural Rajasthan"}','2027-03-31'),
  ('16161616-0000-4000-8000-000000000002','SVD-VER-9002','membership_certificate','Rajesh Kumar','SVD-CERT-2026-9002','{"tier":"founding"}','2027-03-31'),
  ('16161616-0000-4000-8000-000000000003','SVD-VER-9003','volunteer_id','Ananya Iyer','SVD-VOL-9001','{"team":"Education — Pune"}','2027-03-31')
on conflict (id) do nothing;


-- ─── CMS homepage sections ──────────────────────────────────────────────────
insert into cms_pages (id, slug, title, path, status, seo, published_at) values
  ('c0c0c0c0-0000-4000-8000-000000000001','home','Home','/','published','{"title":"Sanveda Humanitarian Foundation"}'::jsonb, now()),
  ('c0c0c0c0-0000-4000-8000-000000000002','about','About','/about','published','{}'::jsonb, now())
on conflict (id) do nothing;

insert into cms_sections (id, page_id, key, section_type, content, sort_order, is_enabled) values
  ('c1c1c1c1-0000-4000-8000-000000000001','c0c0c0c0-0000-4000-8000-000000000001','Featured Campaigns','section','{"title":"Campaigns Changing Lives Right Now","description":"Support urgent causes and see your impact grow in real time."}'::jsonb,1,true),
  ('c1c1c1c1-0000-4000-8000-000000000002','c0c0c0c0-0000-4000-8000-000000000001','Categories','section','{"title":"Browse by Cause","description":"Education, healthcare, women empowerment and disaster relief."}'::jsonb,2,true),
  ('c1c1c1c1-0000-4000-8000-000000000003','c0c0c0c0-0000-4000-8000-000000000001','Donate Monthly','section','{"title":"How Can You Donate Monthly?","description":"Set up a recurring gift in under two minutes.","relatedCMS":[{"id":1,"title":"Choose a cause","description":"Pick education, meals, health or relief.","status":true},{"id":2,"title":"Set your amount","description":"Start from ₹500 a month.","status":true},{"id":3,"title":"Give automatically","description":"Secure UPI or card each month.","status":true},{"id":4,"title":"Get impact updates","description":"Stories and 80G receipts monthly.","status":true}]}'::jsonb,3,true),
  ('c1c1c1c1-0000-4000-8000-000000000004','c0c0c0c0-0000-4000-8000-000000000001','Our Impact','section','{"title":"12,400+ lives touched this year","description":"From community schools in Rajasthan to flood relief in Assam, every rupee is tracked to a person and an outcome.","image":"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200"}'::jsonb,4,true),
  ('c1c1c1c1-0000-4000-8000-000000000005','c0c0c0c0-0000-4000-8000-000000000001','Live Donation','section','{"title":"Kind Hearts Giving Today","description":"Watch real donations land in real time — every gift is receipted and tagged to a programme.","image":"https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200"}'::jsonb,5,true),
  ('c1c1c1c1-0000-4000-8000-000000000006','c0c0c0c0-0000-4000-8000-000000000001','blog','section','{"title":"Stories From the Field","description":"Updates, diaries and impact reports from our programmes."}'::jsonb,6,true),
  ('c1c1c1c1-0000-4000-8000-000000000007','c0c0c0c0-0000-4000-8000-000000000001','Our Sponsors','section','{"title":"Partners Who Make It Possible","description":"Corporates, foundations and community groups standing with Sanveda."}'::jsonb,7,true),
  ('c1c1c1c1-0000-4000-8000-000000000008','c0c0c0c0-0000-4000-8000-000000000002','About Hero','section','{"title":"Building dignity through action","description":"Sanveda works across education, healthcare, women livelihoods and disaster response."}'::jsonb,1,true)
on conflict (id) do nothing;


commit;
