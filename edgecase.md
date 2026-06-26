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
- User is not signed in: CMS asks for sign-in before loading editable content.
- Signed-in user is not in `CMS_ADMIN_EMAILS`: CMS blocks loading and saving.
- Save payload contains invalid JSON: CMS keeps the last valid content and shows the parse error.
- Ordering conflicts: CMS preserves explicit `sort_order`; equal values are resolved by title/name order in the portfolio fetch.

## Supabase Security
- Public anon users can read only rows where `published = true`.
- Unauthenticated writes fail through RLS.
- Authenticated non-admin writes fail through RLS and CMS API checks.
- Admin email changes require updating both `CMS_ADMIN_EMAILS` and the `cms_admins` table.

## Deployment
- Portfolio and CMS use different Vercel projects: ensure both have matching Supabase URL and anon key.
- CMS deployed without `CMS_ADMIN_EMAILS`: no user should be able to save content.
- Seed data re-run: collection tables are truncated and replaced, so use the CMS for production edits after initial seed.
