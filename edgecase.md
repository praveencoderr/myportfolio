# Portfolio CMS Edge Cases

## Portfolio Runtime
- Missing Supabase env vars: show a clear CMS configuration state and do not render stale hardcoded content.
- Supabase fetch fails: show a CMS unavailable state with the failing context.
- Empty CMS collections: render the section shell only when meaningful content exists, or hide the section.
- Invalid image paths: keep stable card dimensions and use text content as the primary signal.
- Long text: cards and hero copy must wrap without horizontal overflow on 390px mobile screens.
- Missing project links: hide the related button instead of rendering an empty link.

## Resume And Contact
- Drive resume URL is private or broken: keep the button visible only when the CMS resume URL is a valid URL.
- WhatsApp number includes spaces or punctuation: normalize to digits for `wa.me` links.
- WhatsApp message is empty: link to the phone number without a prefilled message.
- Email is missing: hide email CTA and rely on other available contact links.

## CMS Admin
- Missing service role key: CMS API returns a configuration error and does not attempt writes.
- User is not signed in: CMS shows the current published/template portfolio but blocks save, resume import, publish, and domain actions.
- New signed-in user has no portfolio: CMS clones the default Praveen portfolio into a draft workspace.
- Signed-in user attempts another user's portfolio: CMS API returns 403.
- Save payload contains invalid JSON: CMS keeps the last valid content and shows the parse error.
- Ordering conflicts: CMS preserves explicit `sort_order`; equal values are resolved by title/name order in the portfolio fetch.

## Resume AI
- Missing `OPENAI_API_KEY`: resume import uses the free built-in parser and tells the user to review before saving.
- OpenAI quota/key failure: fall back to the built-in parser instead of blocking upload.
- Unsupported resume type: reject anything outside PDF and DOCX.
- Oversized resume: reject files larger than 10MB.
- Sparse parser output: merge only extracted non-empty sections and keep existing editable content for empty sections.

## Supabase Security
- Public anon users can read only content under portfolios where `status = 'published'` and rows where `published = true`.
- Unauthenticated writes fail through RLS.
- Authenticated users can write only portfolios they own; platform admins can support via `CMS_ADMIN_EMAILS`.

## Deployment
- Portfolio and CMS use different Vercel projects: ensure both have matching Supabase URL and anon key.
- Missing Vercel domain env vars: custom domain actions return a clear disabled-state error.
- Custom domain is unverified: keep `/p/[slug]` live while showing pending DNS status.
- Seed data re-run: only the default Praveen portfolio is reset; user portfolios are not truncated.
