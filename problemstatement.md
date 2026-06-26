# Portfolio CMS Problem Statement

## Goal
Build a recruiter-ready portfolio system where Praveen's portfolio remains live and the CMS can also create user-owned portfolios from resume data.

## Audience
- Recruiters and hiring managers evaluating full-stack, React, Next.js, Node.js, and AI workflow experience.
- Praveen as the portfolio owner, who needs to update projects, experience, resume links, WhatsApp contact data, and achievements without editing code.
- Future users who need to sign up, import a resume, edit generated content, and publish a portfolio from the same shared app.

## Current Problems
- Portfolio content was hardcoded in the app and required code changes for every update.
- Resume content was not fully reflected in the site, especially FYND experience, quantified impact, AI/LLM skills, Vently, achievements, and education.
- Contact actions needed stronger conversion paths: WhatsApp chat and resume download.
- A separate admin link was needed so the public portfolio can stay clean while content management lives elsewhere.
- The CMS needed to show current content before login instead of empty editors.
- Users needed a one-click way to publish a portfolio and optionally connect a custom domain.

## CMS Ownership Requirement
The CMS is the source of truth for portfolio content, scoped by portfolio ownership:
- Profile and contact details.
- Hero, section copy, navigation, and CTAs.
- Metrics, skills, work experience, projects, achievements, education, resume URL, and WhatsApp settings.
- Public portfolio should render CMS data only when Supabase is configured and a published portfolio exists.
- Each signed-in user should only save their own portfolio content.

## Separate Hosting Requirement
The CMS lives in `/cms` and can be deployed as a separate Vercel project with root directory `cms`.

## Success Criteria
- Portfolio reads published content from Supabase.
- CMS supports authenticated admin editing of every content collection.
- CMS supports user signup/sign-in, user-owned draft portfolios, and one-click publishing to `/p/[slug]`.
- Resume upload can prefill portfolio fields when OpenAI is configured.
- Public site shows a clear CMS configuration/unavailable state if Supabase env vars are missing or content cannot load.
- WhatsApp and resume buttons are powered by CMS settings.
- Supabase policies allow public reads for published content and owner/admin writes only.
