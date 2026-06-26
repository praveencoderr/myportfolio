# Multi-User Portfolio CMS + Resume AI + One-Click Publish Plan

## Summary
Build the CMS into a multi-user portfolio platform: users can sign up/sign in with Google or email/password, upload a resume, let AI prefill portfolio data, edit it, then publish a portfolio with one click. The public portfolio will be served by one shared Vercel app, not one Vercel project per user.

## Key Changes

### Auth And Ownership
- Replace the single-admin CMS model with Supabase Auth user ownership.
- Add CMS sign up/sign in UI:
  - Google OAuth via Supabase `signInWithOAuth`.
  - Email/password sign up and sign in.
  - Keep magic link optional as a fallback.
- Add tenant data model:
  - `portfolios`: `id`, `owner_id`, `slug`, `title`, `status`, `custom_domain`, `domain_status`, timestamps.
  - Add `portfolio_id` to profile, sections, settings, metrics, skills, experience, projects, achievements, education.
- Update RLS:
  - Public can read published portfolios and published content.
  - Authenticated users can create/update/delete only their own portfolio content.
  - Platform admin emails remain optional for support/admin override.

### CMS UX
- Fix current CMS empty-state issue:
  - CMS should load and show current portfolio/template content immediately.
  - Saving requires signed-in ownership, not anonymous access.
- Replace JSON-only editing with structured dashboard sections:
  - Profile, hero, skills, metrics, experience, projects, education, achievements, settings, domain/deploy.
  - Keep an "Advanced JSON" editor for power users.
- On first login:
  - If the user has no portfolio, create a draft from the current Praveen portfolio template.
  - User can edit manually or upload resume to autofill.

### Resume Upload + AI Autofill
- Add private Supabase Storage bucket `resumes`.
- Add CMS route `POST /api/resume/parse`.
- Accept PDF and DOCX uploads.
- Extract text using server-side parsing, then use OpenAI structured JSON output when a paid key is configured.
- Use a free built-in parser when OpenAI is not configured, so resume upload still autofills basic portfolio fields.
- Map parsed output into CMS fields: profile, summary, skills, experience, projects, education, achievements, metrics.
- User reviews extracted data before saving.
- Optional env vars for enhanced AI extraction:
  - `OPENAI_API_KEY`
  - `OPENAI_RESUME_MODEL`
- If OpenAI env is missing, keep resume autofill enabled with the built-in parser and tell the user to review before saving.

### One-Click Publish And Domains
- "Make Portfolio" button creates or updates a published portfolio record and returns a live URL.
- Default live URL uses shared app routing:
  - `/p/[slug]`
- Public portfolio app resolves content by:
  - path slug for default URLs,
  - host header for custom domains.
- Custom domain flow:
  - User enters a domain.
  - API validates domain format.
  - API calls Vercel REST API to add domain to the shared portfolio project.
  - If verification is required, show DNS instructions and keep default URL active.
  - No domain buying in v1.
- Required env vars:
  - `VERCEL_TOKEN`
  - `VERCEL_TEAM_ID`
  - `VERCEL_PORTFOLIO_PROJECT_ID`
  - `PORTFOLIO_BASE_URL`
  - optional `PLATFORM_ROOT_DOMAIN`

## Interfaces
- CMS API:
  - `GET /api/content?portfolioId=...`
  - `PUT /api/content?portfolioId=...`
  - `POST /api/portfolio/create`
  - `POST /api/resume/parse`
  - `POST /api/domain/add`
  - `GET /api/domain/status?portfolioId=...`
- Public portfolio:
  - `GET /p/[slug]`
  - host-based custom domain lookup.
- Root docs:
  - Add `implement-plan.md`.
  - Update existing implementation docs later after the feature lands.

## Test Plan
- Run:
  - `npm run lint`
  - `npm run build`
  - `cd cms && npm run lint`
  - `cd cms && npm run build`
- Auth tests:
  - Google sign-in works.
  - Email/password sign up and sign in work.
  - Signed-out user can view template/current content but cannot save.
  - User A cannot read/write User B draft content.
- Resume tests:
  - PDF upload parses.
  - DOCX upload parses.
  - Bad file type is rejected.
  - Missing OpenAI env shows a clear error.
  - AI output can be reviewed before save.
- Publish/domain tests:
  - New user can click "Make Portfolio" and receive a live URL.
  - Published portfolio renders CMS data by slug.
  - Custom domain request stores pending DNS status.
  - Invalid domain is rejected.
  - Missing Vercel env disables custom domain actions safely.
- Regression:
  - Existing Praveen portfolio remains published.
  - No CMS page shows empty `[]` as loaded content before fetch completes.

## Assumptions
- Use one shared Vercel portfolio app for all users, selected for speed and lower cost.
- Saving requires login ownership only, not a separate update password.
- OpenAI is used for higher-quality resume autofill when a paid key is present; otherwise the built-in parser is used.
- Users must already own custom domains; v1 does not buy domains.
- Google OAuth requires Supabase and Google Console setup.
- References: Supabase Google Auth, Supabase OAuth, Vercel REST API/domains/deployments, OpenAI structured/file-capable extraction.
