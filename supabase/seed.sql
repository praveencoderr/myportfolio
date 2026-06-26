insert into public.cms_admins (email)
values ('coderpraveengupta@gmail.com')
on conflict (email) do nothing;

insert into public.portfolios (
  id,
  slug,
  title,
  status,
  domain_status,
  published_at
) values (
  '00000000-0000-0000-0000-000000000001',
  'praveen-gupta',
  'Praveen Gupta Portfolio',
  'published',
  'unconfigured',
  now()
) on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  status = excluded.status,
  domain_status = excluded.domain_status,
  published_at = coalesce(public.portfolios.published_at, excluded.published_at);

insert into public.profile (
  portfolio_id,
  slug,
  full_name,
  role,
  location,
  email,
  phone,
  portfolio_url,
  github_url,
  linkedin_url,
  leetcode_url,
  summary,
  published
) values (
  '00000000-0000-0000-0000-000000000001',
  'main',
  'Praveen Gupta',
  'Software Development Engineer-I / Full Stack Developer',
  'Bangalore, India',
  'coderpraveengupta@gmail.com',
  '+91 7705858116',
  null,
  'https://github.com/praveencoderr',
  'https://www.linkedin.com/in/praveen-gupta-45708b183/',
  'https://leetcode.com/u/Praveen219/',
  'Full Stack Developer with nearly 3 years of professional experience building scalable React, Next.js, Node.js, and AI-powered product systems.',
  true
) on conflict (portfolio_id) do update set
  slug = excluded.slug,
  full_name = excluded.full_name,
  role = excluded.role,
  location = excluded.location,
  email = excluded.email,
  phone = excluded.phone,
  portfolio_url = excluded.portfolio_url,
  github_url = excluded.github_url,
  linkedin_url = excluded.linkedin_url,
  leetcode_url = excluded.leetcode_url,
  summary = excluded.summary,
  published = excluded.published;

insert into public.sections (portfolio_id, key, eyebrow, title, description, published)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'hero',
    'Full Stack Developer / SDE-I',
    'Building scalable React, Next.js, Node.js and AI-powered product systems.',
    'I build high-availability product experiences across frontend, backend, and AI workflows, with a track record of reducing infrastructure cost, improving delivery speed, and shipping reliable user interfaces.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'about',
    'Recruiter snapshot',
    'Full-stack engineer with product depth and AI workflow experience.',
    'I work across React, Next.js, Node.js, databases, realtime systems, and LLM workflows. My recent work includes multi-tenant platform redesigns, event-driven systems, DSL-driven workflows, and AI-powered realtime communication apps.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'projects',
    'Selected work',
    'Projects that show product thinking, realtime systems, and full-stack execution.',
    'Resume-backed projects are ordered by impact first. Missing external links are intentionally hidden until they are added through the CMS.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'experience',
    'Experience',
    'Professional experience across enterprise platforms and full-stack product delivery.',
    'From marketplace infrastructure and message buses to reusable enterprise UI and REST APIs, the work is focused on measurable product and engineering outcomes.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'achievements',
    'Achievements',
    'Proof points across AI, DSA, certifications, and delivery.',
    'A quick scan of competitive programming milestones, AI recognition, certificates, and shipped project consistency.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'approach',
    'How I build',
    'Practical process, measurable output.',
    'I clarify the workflow, build stable full-stack foundations, validate at real breakpoints, and improve the system with feedback and production signals.',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'contact',
    'Contact',
    'Looking for a React, Next.js, Node.js or AI workflow developer?',
    'I am open to frontend and full-stack opportunities where scalable product systems, clean implementation, and reliable delivery matter.',
    true
  )
on conflict (portfolio_id, key) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  description = excluded.description,
  published = excluded.published;

insert into public.settings (portfolio_id, key, value, published)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'nav_items',
    '[
      {"name":"About","link":"#about"},
      {"name":"Projects","link":"#projects"},
      {"name":"Experience","link":"#experience"},
      {"name":"Achievements","link":"#achievements"},
      {"name":"Contact","link":"#contact"}
    ]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'resume_url',
    '"https://drive.google.com/uc?export=download&id=1Yi5X8AWLkJsBfOEebRrHXFs6TniJDuUN"'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'whatsapp_phone',
    '"+917705858116"'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'whatsapp_message',
    '"Hi Praveen, I saw your portfolio and would like to connect about an opportunity."'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'build_steps',
    '[
      {"title":"Understand the system","description":"Clarify user goals, business constraints, data flow, and edge cases before implementation."},
      {"title":"Build stable full-stack foundations","description":"Translate workflows into responsive UI, reliable APIs, validation, auth, and database models."},
      {"title":"Ship, observe, and improve","description":"Validate across devices, monitor failures, optimize performance, and iterate with production feedback."}
    ]'::jsonb,
    true
  )
on conflict (portfolio_id, key) do update set
  value = excluded.value,
  published = excluded.published;

delete from public.metrics where portfolio_id = '00000000-0000-0000-0000-000000000001';
insert into public.metrics (portfolio_id, value, label, href, sort_order, published)
values
  ('00000000-0000-0000-0000-000000000001', '~3 yrs', 'Professional full-stack experience', 'https://www.linkedin.com/in/praveen-gupta-45708b183/', 1, true),
  ('00000000-0000-0000-0000-000000000001', '900+', 'LeetCode problems solved', 'https://leetcode.com/u/Praveen219/', 2, true),
  ('00000000-0000-0000-0000-000000000001', '2M+', 'Events handled per month', null, 3, true),
  ('00000000-0000-0000-0000-000000000001', '99.9%', 'Message bus uptime', null, 4, true),
  ('00000000-0000-0000-0000-000000000001', '30%', 'Infrastructure cost reduction', null, 5, true);

delete from public.skills where portfolio_id = '00000000-0000-0000-0000-000000000001';
insert into public.skills (portfolio_id, category, name, featured, sort_order, published)
values
  ('00000000-0000-0000-0000-000000000001', 'Programming', 'JavaScript', true, 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Programming', 'TypeScript', true, 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Programming', 'C++', false, 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'React.js', true, 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'Next.js', true, 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'React Query', true, 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'Tailwind CSS', true, 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'Shadcn/UI', true, 5, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'HTML5', false, 6, true),
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'CSS3/SCSS', false, 7, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'Node.js', true, 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'Express', true, 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'Firebase', false, 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'WebSockets', true, 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'PostgreSQL', true, 5, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'MongoDB', true, 6, true),
  ('00000000-0000-0000-0000-000000000001', 'Backend/Cloud', 'Redis', true, 7, true),
  ('00000000-0000-0000-0000-000000000001', 'AI/LLM', 'LLMs', true, 1, true),
  ('00000000-0000-0000-0000-000000000001', 'AI/LLM', 'RAG', true, 2, true),
  ('00000000-0000-0000-0000-000000000001', 'AI/LLM', 'Prompt Engineering', true, 3, true),
  ('00000000-0000-0000-0000-000000000001', 'AI/LLM', 'Embeddings', true, 4, true),
  ('00000000-0000-0000-0000-000000000001', 'AI/LLM', 'Vector Search', true, 5, true),
  ('00000000-0000-0000-0000-000000000001', 'AI/LLM', 'Agentic AI', true, 6, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Docker', true, 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Sentry', false, 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'GCP', false, 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Claude', false, 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Figma', false, 5, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Jest', true, 6, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Jira', false, 7, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Agile/SCRUM', false, 8, true),
  ('00000000-0000-0000-0000-000000000001', 'Tools', 'Code Review', false, 9, true);

delete from public.experience where portfolio_id = '00000000-0000-0000-0000-000000000001';
insert into public.experience (
  portfolio_id,
  role,
  company,
  location,
  employment_type,
  period,
  start_date,
  end_date,
  summary,
  bullets,
  tech,
  thumbnail,
  sort_order,
  published
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Software Development Engineer-I (Full Stack)',
    'FYND',
    'Mumbai, India',
    'Payroll: Degode',
    'Sep 2025 - Present',
    '2025-09-01',
    null,
    'Leading full-stack platform work across marketplace infrastructure, event-driven systems, DSL workflows, and unified product consoles.',
    array[
      'Led the multi-tenant redesign for the Fynd Konnect Platform, reducing infrastructure costs by 30% and environment provisioning time by 70%.',
      'Built a company-specific message bus using Postgres and Temporal Workflows, handling 2M+ events per month with 99.9% uptime.',
      'Implemented DSL interpreters for marketplace-specific workflows, reducing new marketplace onboarding from 3 weeks to 5 days.',
      'Launched the unified Konnect Console, consolidating multiple frontends into one portal and increasing user efficiency by 50%.'
    ],
    array['React.js', 'Next.js', 'Node.js', 'PostgreSQL', 'Temporal', 'Marketplace Systems'],
    '/exp2.svg',
    1,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Full Stack Developer',
    'ITC Infotech',
    'Bangalore, India',
    'Full-time',
    'Sep 2023 - Jul 2025',
    '2023-09-01',
    '2025-07-31',
    'Built enterprise applications, reusable UI components, REST APIs, and data-heavy workflow dashboards.',
    array[
      'Built enterprise apps using React.js, Next.js, Tailwind CSS, and reusable UI components.',
      'Developed 20+ REST APIs using Node.js and Express, improving end-to-end performance by 30%.',
      'Implemented auth, RBAC, validation, error handling, and optimized PostgreSQL/MongoDB schemas.',
      'Built Route Data Management System dashboards with heavy filters, large tables, and realtime updates.'
    ],
    array['React.js', 'Next.js', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB'],
    '/exp1.svg',
    2,
    true
  );

delete from public.projects where portfolio_id = '00000000-0000-0000-0000-000000000001';
insert into public.projects (
  portfolio_id,
  title,
  subtitle,
  description,
  image,
  icon_list,
  tech,
  live_url,
  code_url,
  case_study_url,
  featured,
  sort_order,
  published
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Vently - AI-Powered Real-time Chat, Voice & Video App',
    'Personal Project - May 2026 to Present',
    'Production-ready mood-based chat platform with auth, onboarding, profiles, friends, moderation, Socket.IO realtime features, WebRTC voice/video calls, voice notes, call history, WhatsApp-style UI, and AI fallback chat using Groq, Gemini embeddings, RAG, semantic memory, and Redis buffering.',
    '/p4.svg',
    array['/next.svg', '/tail.svg', '/ts.svg', '/stream.svg', '/dock.svg'],
    array['Next.js', 'TypeScript', 'Tailwind', 'Zustand', 'TanStack Query', 'NestJS', 'JWT', 'Prisma', 'PostgreSQL', 'Redis', 'Socket.IO', 'WebRTC', 'Groq', 'Gemini', 'RAG'],
    'https://vently-web-gamma.vercel.app',
    'https://github.com/praveencoderr/Vently',
    null,
    true,
    1,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Fynd Konnect Platform Redesign',
    'Professional Platform Work',
    'Multi-tenant platform redesign enabling on-demand, company-specific marketplace deployments, usage-based pricing, faster environment provisioning, and lower infrastructure costs.',
    '/p3.svg',
    array['/next.svg', '/ts.svg', '/tail.svg', '/dock.svg'],
    array['Next.js', 'Node.js', 'PostgreSQL', 'Temporal', 'Multi-tenant Architecture'],
    null,
    null,
    null,
    true,
    2,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Route Data Management System',
    'Enterprise Workflow System',
    'Filter-heavy dashboards, large tables, route approvals, realtime updates, and admin workflows for transportation route data management.',
    '/p2.svg',
    array['/re.svg', '/tail.svg', '/ts.svg', '/c.svg'],
    array['React.js', 'Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'MongoDB'],
    null,
    null,
    null,
    true,
    3,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Namma Store',
    'Personal Project',
    'A convenient platform to securely store luggage with flexible plans for travelers, focused on safety, affordability, and ease of booking.',
    '/p1.svg',
    array['/re.svg', '/tail.svg', '/ts.svg', '/fm.svg'],
    array['React', 'Tailwind', 'TypeScript', 'Framer Motion'],
    'https://nammastore.vercel.app/',
    null,
    null,
    false,
    4,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Blog App',
    'Personal Project',
    'A dynamic platform for creating and sharing blogs with a user-friendly interface and content management features.',
    '/b1.svg',
    array['/next.svg', '/tail.svg', '/ts.svg', '/stream.svg'],
    array['Next.js', 'Tailwind', 'TypeScript', 'Content'],
    null,
    'https://github.com/praveen202105/mern-blog-app',
    null,
    false,
    5,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'YouTube Clone',
    'Personal Project',
    'A responsive media interface inspired by YouTube with modern frontend patterns.',
    '/p2.svg',
    array['/re.svg', '/tail.svg', '/ts.svg'],
    array['React', 'Tailwind', 'TypeScript', 'Media UI'],
    'https://praveenyoutube.netlify.app/',
    null,
    null,
    false,
    6,
    true
  );

delete from public.achievements where portfolio_id = '00000000-0000-0000-0000-000000000001';
insert into public.achievements (portfolio_id, title, description, href, sort_order, published)
values
  ('00000000-0000-0000-0000-000000000001', 'Google Cloud Agentic AI Day 2025 Finalist', 'Selected from 57K+ applicants for Agentic AI Day 2025.', 'https://drive.google.com/file/d/1DRRw6DmAVJa_qxOuZ5WWaX7fQLA2hvYd/view?usp=sharing', 1, true),
  ('00000000-0000-0000-0000-000000000001', '900+ LeetCode Questions', 'Strengthened data structures, algorithms, and problem-solving skills through consistent practice.', 'https://leetcode.com/u/Praveen219/', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'HackerRank Problem Solving Certificate', 'Earned HackerRank certification for problem-solving fundamentals.', 'https://www.hackerrank.com/certificates/853ce4939725', 3, true),
  ('00000000-0000-0000-0000-000000000001', '20+ Shipped Projects', 'Completed 20+ personal and professional development projects showcased through GitHub and portfolio work.', 'https://github.com/praveencoderr', 4, true),
  ('00000000-0000-0000-0000-000000000001', '2nd Place - CodeRush', 'Ranked 2nd among 1,000+ participants at the college level.', null, 5, true);

delete from public.education where portfolio_id = '00000000-0000-0000-0000-000000000001';
insert into public.education (portfolio_id, institution, degree, location, period, sort_order, published)
values
  ('00000000-0000-0000-0000-000000000001', 'Punjab Technical University', 'B.Tech in Computer Science', 'Punjab, India', 'Apr 2019 - May 2023', 1, true);
