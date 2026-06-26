# Portfolio CMS Problem Statement

## Goal
Build a recruiter-ready portfolio for Praveen Gupta where all portfolio content is managed from a separate CMS instead of hardcoded source files.

## Audience
- Recruiters and hiring managers evaluating full-stack, React, Next.js, Node.js, and AI workflow experience.
- Praveen as the portfolio owner, who needs to update projects, experience, resume links, WhatsApp contact data, and achievements without editing code.

## Current Problems
- Portfolio content was hardcoded in the app and required code changes for every update.
- Resume content was not fully reflected in the site, especially FYND experience, quantified impact, AI/LLM skills, Vently, achievements, and education.
- Contact actions needed stronger conversion paths: WhatsApp chat and resume download.
- A separate admin link was needed so the public portfolio can stay clean while content management lives elsewhere.

## CMS Ownership Requirement
The CMS is the source of truth for portfolio content:
- Profile and contact details.
- Hero, section copy, navigation, and CTAs.
- Metrics, skills, work experience, projects, achievements, education, resume URL, and WhatsApp settings.
- Public portfolio should render CMS data only when Supabase is configured and available.

## Separate Hosting Requirement
The CMS lives in `/cms` and can be deployed as a separate Vercel project with root directory `cms`.

## Success Criteria
- Portfolio reads published content from Supabase.
- CMS supports authenticated admin editing of every content collection.
- Public site shows a clear CMS configuration/unavailable state if Supabase env vars are missing or content cannot load.
- WhatsApp and resume buttons are powered by CMS settings.
- Supabase policies allow public reads for published content and admin writes only.
