# Portfolio CMS Implementation Guide

## Supabase Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Run `supabase/seed.sql` to add resume-derived starter content and seed `coderpraveengupta@gmail.com` as an admin.
4. In Supabase Auth, enable email/password login and Google OAuth.
5. In Storage, confirm the private `resumes` bucket exists after running the schema.

## Portfolio Environment
Set these variables on the public portfolio deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEFAULT_PORTFOLIO_SLUG=praveen-gupta
```

The portfolio uses public REST reads through the anon key and renders published portfolios from `/`, `/p/[slug]`, or a matching custom domain.

## CMS Environment
Deploy `/cms` as a separate app and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CMS_ADMIN_EMAILS=coderpraveengupta@gmail.com
PORTFOLIO_BASE_URL=https://your-portfolio-domain.com
OPENAI_API_KEY=optional_paid_openai_key
OPENAI_RESUME_MODEL=gpt-4.1-mini
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_vercel_team_or_org_id
VERCEL_PORTFOLIO_PROJECT_ID=your_public_portfolio_project_id
```

The CMS lets users create their own portfolio workspace after sign-in. `CMS_ADMIN_EMAILS` remains an optional override for support/admin access.

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
4. Visit the CMS deployment and sign up/sign in.
5. The CMS creates a draft portfolio from the Praveen template on first login.
6. Edit content or import a resume, then click `Make Portfolio`.
7. Confirm the portfolio loads at `/p/[slug]`.

## Content Model
- `portfolios`: owner, slug, status, domain configuration, and publish metadata.
- `profile`: identity, role, contact links, summary.
- `sections`: hero/about/projects/experience/approach/contact copy.
- `settings`: navigation, resume URL, WhatsApp phone/message, build steps.
- `metrics`: recruiter-facing quantified proof.
- `skills`: grouped skills with featured flags.
- `experience`: roles, company, period, bullets, tech.
- `projects`: project details, media, tech, optional links.
- `achievements`: awards and proof points.
- `education`: degree and school information.

## Resume AI And Domain Automation
- Resume autofill works without a paid OpenAI key by using the built-in PDF/DOCX text parser.
- If `OPENAI_API_KEY` is provided, the CMS upgrades resume extraction to OpenAI structured output and falls back to the built-in parser on API failure.
- Custom domain automation requires `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and `VERCEL_PORTFOLIO_PROJECT_ID`.
- Users must already own their domains; the CMS only adds/verifies domains on the shared Vercel portfolio project.
