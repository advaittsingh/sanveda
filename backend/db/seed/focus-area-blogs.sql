-- One published blog per public focus area (FOCUS_AREAS in src/constants/focusAreas.ts).
-- Idempotent: safe to re-run.

insert into blogs (slug, title, banner_image, description, content, category, seo, status, published_at, created_at, updated_at)
values
(
  'bridging-the-gap-in-critical-care',
  'Bridging the Gap in Critical Care',
  '/assets/focus-areas/healthcare.jpg',
  'How Sanveda funds verified medical treatment, therapy, and rehabilitation when families cannot afford essential care.',
  '[
    {
      "id": 1,
      "title": "Bridging the Gap in Critical Care",
      "description": "<p>For millions of families, a hospital bill is not a paperwork problem — it is a crisis. A delayed surgery, a missed therapy cycle, or an unreachable specialist can change a life forever. Sanveda''s Healthcare &amp; Therapeutic Support focus area exists to close that gap with verified, transparent medical aid.</p><h2>What this focus area covers</h2><p>We channel donations toward life-saving treatment, hospital support, rehabilitation, and therapeutic care. Every campaign we back is reviewed for authenticity so your support reaches patients and caregivers who need it most.</p><ul><li>Critical care and emergency treatment</li><li>Physiotherapy, occupational therapy, and recovery programmes</li><li>Mobility aids and post-treatment support</li><li>Mental health counselling for patients and families</li><li>Medicine and essential medical equipment</li></ul><h2>Why verification matters</h2><p>Medical fundraising is urgent by nature — and that urgency can be exploited. Sanveda partners with verified campaigns and documented needs so donors can give with confidence, knowing funds are tied to real treatment plans and measurable outcomes.</p><h2>How you can help</h2><p>A single contribution can fund a consultation, a therapy cycle, or a share of hospital costs. Monthly giving keeps care continuous for patients whose recovery takes months, not days. Explore active healthcare campaigns or start a monthly gift dedicated to this cause.</p>"
    }
  ]'::jsonb,
  'Healthcare',
  '{"title":"Bridging the Gap in Critical Care | Sanveda","description":"Verified medical treatment, therapy, and rehabilitation support for families who cannot afford essential care.","focusAreaSlug":"healthcare-therapeutic-support","keywords":"healthcare,medical aid,therapy,rehabilitation"}'::jsonb,
  'published',
  now() - interval '2 days',
  now() - interval '3 days',
  now()
),
(
  'talent-without-barriers',
  'Talent Without Barriers',
  '/assets/focus-areas/sports.jpg',
  'Why sports development is humanitarian work — and how coaching, kit, and competition support change young athletes'' futures.',
  '[
    {
      "id": 1,
      "title": "Talent Without Barriers",
      "description": "<p>Ability is everywhere. Opportunity is not. Across India, talented athletes stop mid-journey because coaching, travel, nutrition, or kit costs more than their families can spare. Sanveda''s Sports Development &amp; Athlete Empowerment focus area treats sport as a path to dignity, discipline, and upward mobility.</p><h2>What we fund</h2><p>We support grassroots athletes and community academies with the practical resources they need to compete fairly:</p><ul><li>Professional coaching and structured training plans</li><li>Competition entry fees and travel support</li><li>Quality equipment and gear for individuals and academies</li><li>Nutrition and fitness programmes that sustain performance</li><li>Partnerships with coaches and institutions building future champions</li></ul><h2>Sport as social impact</h2><p>A funded athlete often becomes a role model for an entire neighbourhood. Training scholarships reduce dropout risk, keep young people in constructive routines, and open doors that school alone may not. When we remove financial barriers, talent — not privilege — decides who gets to compete.</p><h2>Stand with an athlete</h2><p>Whether you back a single training cycle or a monthly sports fund, your gift helps someone stay in the game. Browse sports campaigns or set up recurring support for athlete empowerment.</p>"
    }
  ]'::jsonb,
  'Sports',
  '{"title":"Talent Without Barriers | Sanveda","description":"Coaching, equipment, and competition support so grassroots athletes can pursue sport with dignity.","focusAreaSlug":"sports-development-athlete-empowerment","keywords":"sports,athletes,coaching,empowerment"}'::jsonb,
  'published',
  now() - interval '5 days',
  now() - interval '6 days',
  now()
),
(
  'skills-that-outlast-a-school-year',
  'Skills That Outlast a School Year',
  '/assets/focus-areas/education.jpg',
  'Education and vocational training that turn access into independence — from school fees to digital and livelihood skills.',
  '[
    {
      "id": 1,
      "title": "Skills That Outlast a School Year",
      "description": "<p>A school seat is only the beginning. Lasting change needs books, digital access, mentoring, and skills that translate into work. Through Education &amp; Skill Development, Sanveda funds learning pathways that help children and young adults build independent, dignified futures.</p><h2>Our education pillar</h2><ul><li>School and college fee support</li><li>Learning materials and digital access</li><li>Scholarships for first-generation learners</li><li>Vocational and employability programmes</li><li>Mentorship that keeps students on track</li></ul><h2>From classroom to livelihood</h2><p>We measure success not only by enrolment, but by continuity — learners who stay in school, complete certifications, and convert skills into income. That is why our programmes blend academic support with practical training tailored to local opportunity.</p><h2>Invest in a learner</h2><p>Your donation can cover a term''s fees, a skill course, or a full scholarship package. Explore education campaigns, or give monthly so support does not stop when a school year ends.</p>"
    }
  ]'::jsonb,
  'Education',
  '{"title":"Skills That Outlast a School Year | Sanveda","description":"Scholarships, schooling, and vocational training that build independent futures.","focusAreaSlug":"education-skill-development","keywords":"education,scholarships,skills,vocational training"}'::jsonb,
  'published',
  now() - interval '8 days',
  now() - interval '9 days',
  now()
),
(
  'restoring-dignity-where-hardship-hits-first',
  'Restoring Dignity Where Hardship Hits First',
  '/assets/focus-areas/community.jpg',
  'Food security, shelter, women''s empowerment, and disaster response — community upliftment that starts at the neighbourhood level.',
  '[
    {
      "id": 1,
      "title": "Restoring Dignity Where Hardship Hits First",
      "description": "<p>Systemic hardship shows up first at the kitchen table and the street corner — empty plates, unsafe shelter, lost wages after a flood, or women locked out of earning opportunities. Sanveda''s Community &amp; Social Upliftment focus area responds at that neighbourhood scale, restoring safety, stability, and hope.</p><h2>What community support looks like</h2><ul><li>Hunger relief and nutrition support</li><li>Shelter and essential household aid</li><li>Women''s empowerment and livelihood pathways</li><li>Disaster response and early recovery</li><li>Community rebuilding that lasts beyond the emergency</li></ul><h2>Relief with a longer horizon</h2><p>Emergency kits matter in the first 72 hours. What matters next is continuity: temporary learning spaces, livelihood restart grants, and trusted local partners who stay after the cameras leave. We design community programmes for both urgency and recovery.</p><h2>Stand with a community</h2><p>Donate to an active relief or upliftment campaign, or set a monthly gift that keeps community kitchens, women''s groups, and recovery work funded through the year.</p>"
    }
  ]'::jsonb,
  'Humanitarian Relief',
  '{"title":"Restoring Dignity Where Hardship Hits First | Sanveda","description":"Food security, shelter, women''s empowerment, and disaster response at the neighbourhood level.","focusAreaSlug":"community-social-upliftment","keywords":"community,hunger,disaster relief,women empowerment"}'::jsonb,
  'published',
  now() - interval '11 days',
  now() - interval '12 days',
  now()
),
(
  'purpose-over-publicity',
  'Purpose Over Publicity',
  '/assets/focus-areas/events.jpg',
  'How ethical events and brand partnerships raise funds without compromising transparency or beneficiary dignity.',
  '[
    {
      "id": 1,
      "title": "Purpose Over Publicity",
      "description": "<p>Fundraising events and brand collaborations can unlock large-scale support — or become empty optics. Sanveda''s Ethical Events &amp; Brand Partnerships focus area is built on a simple rule: every collaboration must move money and meaning to verified causes, with accountability donors can see.</p><h2>How we partner</h2><ul><li>Purpose-driven fundraising events with clear impact goals</li><li>Brand and institutional campaigns tied to verified programmes</li><li>Transparent reporting for CSR and audit needs</li><li>Experiences that respect beneficiaries and avoid tokenism</li><li>Measurable outcomes, not vanity metrics alone</li></ul><h2>Accountability is the product</h2><p>Partners choose Sanveda because reporting discipline is part of the design — receipts, tagged programmes, and field updates that make CSR and public fundraising easier to trust. Donors should never have to choose between a memorable event and a responsible one.</p><h2>Build with us</h2><p>If you represent a brand, campus, or community organiser, reach out to design an ethical fundraiser. Individuals can still take part by joining event campaigns or giving monthly to the causes those partnerships support.</p>"
    }
  ]'::jsonb,
  'Events',
  '{"title":"Purpose Over Publicity | Sanveda","description":"Ethical fundraising events and brand partnerships built on transparency and measurable impact.","focusAreaSlug":"ethical-events-brand-partnerships","keywords":"events,CSR,brand partnerships,fundraising"}'::jsonb,
  'published',
  now() - interval '14 days',
  now() - interval '15 days',
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  banner_image = excluded.banner_image,
  description = excluded.description,
  content = excluded.content,
  category = excluded.category,
  seo = excluded.seo,
  status = 'published',
  published_at = coalesce(blogs.published_at, excluded.published_at),
  updated_at = now();
