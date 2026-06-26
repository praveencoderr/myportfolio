# Portfolio CMS Implementation Guide

## Supabase Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Run `supabase/seed.sql` to add resume-derived starter content and seed `coderpraveengupta@gmail.com` as an admin.
4. In Supabase Auth, enable email magic links or email/password login.

## Portfolio Environment
Set these variables on the public portfolio deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The portfolio uses public REST reads through the anon key and only renders published CMS records.

## CMS Environment
Deploy `/cms` as a separate app and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CMS_ADMIN_EMAILS=coderpraveengupta@gmail.com
```

The CMS checks the logged-in Supabase Auth user email against `CMS_ADMIN_EMAILS` before allowing reads or writes through its API.

## Local Commands
Portfolio:

```bash
npm run dev
npm run lint
npm run build
```

CMS:

```bash
cd cms
npm install
npm run dev
npm run lint
npm run build
```

## Deployment
1. Deploy the portfolio from the repository root.
2. Deploy the CMS as a separate Vercel project with root directory `cms`.
3. Add the matching Supabase env vars to both projects.
4. Visit the CMS deployment, sign in with an admin email, edit content, and save.
5. Refresh the portfolio and confirm the updated published content appears.

## Content Model
- `profile`: identity, role, contact links, summary.
- `sections`: hero/about/projects/experience/approach/contact copy.
- `settings`: navigation, resume URL, WhatsApp phone/message, build steps.
- `metrics`: recruiter-facing quantified proof.
- `skills`: grouped skills with featured flags.
- `experience`: roles, company, period, bullets, tech.
- `projects`: project details, media, tech, optional links.
- `achievements`: awards and proof points.
- `education`: degree and school information.
