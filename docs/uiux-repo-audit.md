# OptiHire UI/UX Repository Audit

Audit date: 2026-05-26  
Branch: `chore/uiux-promax-audit`  
Audit scope: repository inspection, current frontend/UI state, UIUX ProMax-guided UX analysis, and implementation planning only.

## Executive Summary

OptiHire is currently a full-stack web application, not a CLI-only project. The repository is a pnpm monorepo with:

- a Next.js 16 / React 19 frontend in `apps/frontend`
- a FastAPI / SQLModel / Supabase PostgreSQL backend in `apps/backend`
- shadcn-style Radix UI primitives, Tailwind CSS v4 tokens, Lucide icons, Zustand state, Supabase auth, and Axios API services
- backend pytest coverage and frontend Biome linting

The checked-in product is primarily an ATS resume optimisation platform. It supports resume upload/parsing, resume building, job-description audit, AI-enhanced ATS feedback, curated job matching, and application-status tracking. The repository does not yet implement the broader workflow described in the product context: company discovery, careers-page detection, company fit scoring, outreach draft generation, or a company/recruiter CRM.

The most realistic UI improvement path is therefore not to invent a new stack. The second implementation pass should refine and extend the existing Next.js dashboard into a more coherent job-search workspace using the current primitives: sidebar navigation, dashboard pages, cards, forms, status badges, skeletons, tabs, dialogs, and API-backed state.

## Repository Architecture

### Root

- `package.json`: pnpm workspace scripts for frontend, backend, lint, format, and build.
- `pnpm-workspace.yaml`: includes `apps/*`.
- `vercel.json`: Next.js deployment config.
- `.gitignore`: ignores node modules, Next build output, env files, Python virtualenvs, caches, logs, and build artifacts.
- `public/`: README gallery assets (`Frontend.png`, `Dashboard.png`, `ResumeBuilder.png`, `OptihireBanner.png`).

### Frontend

Location: `apps/frontend`

Detected stack:

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn-style component structure via `components.json`
- Radix UI primitives
- Lucide icons
- Zustand stores
- Axios API client
- Supabase auth client
- Sonner toasts
- Biome lint/format

Key entry points:

- `apps/frontend/src/app/layout.tsx`: root layout, fonts, auth provider, error boundary, toaster.
- `apps/frontend/src/app/page.tsx`: public landing page.
- `apps/frontend/src/app/dashboard/layout.tsx`: authenticated dashboard shell.
- `apps/frontend/src/components/dashboard-layout.tsx`: sidebar provider and dashboard inset.
- `apps/frontend/src/components/app-sidebar.tsx`: navigation for Dashboard, Resumes, ATS Audit, Jobs, Settings.

Main UI routes:

- `/`: landing page.
- `/login`, `/sign-up`, `/reset-password`, `/auth/callback`: auth flows.
- `/dashboard`: resume upload and dashboard widgets.
- `/dashboard/resumes`: resume list and builder entry point.
- `/dashboard/audit`: job-description based ATS audit.
- `/dashboard/jobs`: recommended curated jobs.
- `/dashboard/settings`: account/profile/security settings.
- `/privacy`, `/terms`: static legal pages.

Component families:

- `apps/frontend/src/components/ui/*`: reusable UI primitives including button, card, dialog, sidebar, sheet, tabs, select, input, textarea, badge, skeleton, tooltip, alert dialog.
- `apps/frontend/src/components/dashboard/*`: stats, upload, quick actions, widgets, ATS score.
- `apps/frontend/src/components/audit/*`: audit input, results tabs, history sidebar, score ring, keyword panels, formatting checklist, AI enhancement panel.
- `apps/frontend/src/components/jobs/*`: recommended jobs view and job card.
- `apps/frontend/src/components/resume/*`: enhanced resume builder forms and preview.
- `apps/frontend/src/components/settings/*`: settings UI.

### Backend

Location: `apps/backend`

Detected stack:

- FastAPI
- SQLModel
- Alembic
- Supabase PostgreSQL/auth integration
- JWT middleware
- SlowAPI rate limiting
- pytest tests
- Ruff config in `pyproject.toml`

Key entry points:

- `apps/backend/app/main.py`: FastAPI app, middleware, CORS, exception handlers, routers.
- `apps/backend/app/api/v1/endpoints/resumes.py`: resume upload, parsing, CRUD, PDF, active resume, job matches.
- `apps/backend/app/api/v1/endpoints/analysis.py`: audit and analysis results.
- `apps/backend/app/api/v1/endpoints/jobs.py`: application status updates for curated job matches.
- `apps/backend/app/api/v1/endpoints/user_api.py`: profile and account operations.
- `apps/backend/app/services/job_match_service.py`: curated job match scoring.
- `apps/backend/app/data/curated_jobs.py`: static MVP job catalogue.

Storage/data model:

- Supabase PostgreSQL is the database target.
- Alembic migrations define resume, analysis, user, file, and application-state tables.
- Uploaded resume files are handled by backend storage services.
- Curated jobs are currently in memory rather than database-backed.

## Current UI/Frontend State

OptiHire currently has a real web frontend. It is not CLI-only, not TUI, and does not use Rich/Textual/Streamlit/Flask/Django templates.

Frontend state:

- Framework: Next.js App Router.
- UI library approach: shadcn-style local components using Radix and Tailwind CSS variables.
- Design tokens: Tailwind v4 CSS variables in `globals.css`.
- Icons: Lucide.
- Auth: Supabase.
- State: Zustand stores for resumes, audit history, user profile, and resume builder.
- Feedback: Sonner toasts, skeleton loaders, error boundary, route error page.
- Responsive support: Tailwind responsive grids and sidebar primitives are present, but some dashboard surfaces need mobile review.
- Accessibility support: present but inconsistent. There are aria labels, role attributes, sr-only text, focus rings, labels, alert roles, and tab roles in several places. Some custom controls and visual indicators need stronger semantics.

Existing UI surfaces:

- Landing page with header, hero, features, CTA, footer.
- Auth pages and auth callback status.
- Dashboard shell with collapsible sidebar.
- Resume upload card and extracted-data review dialog.
- Resume management cards and empty state.
- Enhanced resume builder with forms and preview.
- ATS audit input form, loading state, results dashboard, tabs, score ring, history sidebar.
- Recommended jobs cards with filters, empty/error/loading states, score bars, skill chips, and application status select.
- Settings tabs with profile/security/danger-zone forms.

No existing UI surfaces found for:

- Company discovery.
- Careers-page finder.
- Company enrichment.
- Company fit scoring.
- Outreach draft generation or editing.
- CRM-style company/contact pipeline.
- Bulk review queue over discovered companies/jobs.

## Product Workflow Mapping

### Configure settings/API keys

Current code:

- User profile/security settings exist in `apps/frontend/src/components/settings/settings-page-ui.tsx`.
- Backend settings live in `apps/backend/app/core/config.py`.
- Supabase auth is wired through frontend middle services and backend JWT middleware.

UI surface:

- User-facing account settings exist.
- There is no UI for data-source/API-key configuration, job-source selection, scraper settings, outreach tone, or LLM provider controls.

UX gaps:

- Settings are account-focused rather than product-workflow focused.
- No environment/setup checklist for missing backend/API configuration.

### Initialise workspace

Current code:

- README documents `pnpm install` and `pnpm dev`.
- Runtime user onboarding is implicit through sign-up, dashboard, and resume upload.

UI surface:

- Landing page and dashboard quick actions.

UX gaps:

- No first-run checklist guiding users through upload resume, run audit, review jobs, track application.
- Dashboard stats currently include placeholder numbers in `quick-stats-grid.tsx`, which weakens trust.

### Import or discover companies

Current code:

- Not implemented.
- No company model, company endpoint, discovery service, crawler, source config, or company table was found.

UI surface:

- None.

UX gaps:

- This is a future product capability, not a current UI polish task.

### Enrich companies

Current code:

- Not implemented for companies.
- Existing enrichment is resume/job related: `analysis_service.py`, `ai_analysis_service.py`, and curated job keyword matching.

UI surface:

- ATS audit results and AI enhancement panel.

UX gaps:

- No company facts, tech stack, hiring signal, careers URL, or source provenance display.

### Find careers pages

Current code:

- Not implemented.

UI surface:

- None.

UX gaps:

- No review queue for careers-page candidates or confidence/provenance.

### Extract jobs

Current code:

- Curated jobs live in `apps/backend/app/data/curated_jobs.py`.
- Matching is computed by `apps/backend/app/services/job_match_service.py`.
- Frontend consumes matches through `apps/frontend/src/middle-service/jobs.ts`.

UI surface:

- `/dashboard/jobs` via `RecommendedJobsView` and `JobCard`.

UX gaps:

- Jobs are static curated listings rather than extracted from discovered company pages.
- Card grid is good for browsing, but weak for comparison, triage, and bulk status management.
- No source freshness, scrape status, deduplication, or confidence indicators.

### Score opportunities

Current code:

- Resume/job match scores in `job_match_service.py`.
- ATS audit scores in `analysis_service.py` and `analysis.py`.

UI surface:

- Job cards show match score, matched/missing skills, and status.
- Audit results show overall, keyword, formatting, section, impact, skills, and AI feedback.

UX gaps:

- Score explanations are split across several panels and chips.
- Job match cards do not expose a compact "why this score" drilldown beyond skill chips.
- Dashboard lacks a real overview of score distribution or status funnel.

### Review roles/companies

Current code:

- Job cards support filtering, retry, and status updates.
- Audit history sidebar supports selection/deletion.

UI surface:

- Jobs grid and audit history sidebar.

UX gaps:

- No table view or review queue for fast scanning.
- No saved/hidden/shortlisted job states.
- No company profile view.
- No bulk actions.
- No timeline/audit trail for applications beyond status.

### Generate outreach drafts

Current code:

- Not implemented.
- AI enhancement exists for resume feedback, not outreach.

UI surface:

- None.

UX gaps:

- No draft generation, tone selection, contact source, edit/review workflow, or export.

### Edit/export/save outputs

Current code:

- Resume builder supports save.
- PDF download exists for resumes.
- Audit results are saved and listed in history.
- Job application status is saved per user/resume/job.

UI surface:

- Resume builder, resume cards, audit history, job status select.

UX gaps:

- No export for audit report, job list, application pipeline, or outreach draft.
- No visible autosave status outside resume builder.

### Track status over time

Current code:

- `UserJobApplication` tracks application status.
- Dashboard shows placeholder stats and recent activity, not computed real data.

UI surface:

- Job card status select.
- Dashboard quick stats/widgets.

UX gaps:

- No real application pipeline dashboard.
- No stage counts from backend.
- No table/board toggle.
- No meaningful trend, follow-up reminders, or next action dates.

## UX Issues

1. Product positioning mismatch: README and UI describe ATS/resume optimisation, while the desired context describes company discovery and outreach. The second pass should not pretend those backend capabilities exist.
2. Dashboard trust issue: stats and recent activity appear hardcoded, which can mislead users.
3. Jobs UX is browse-first, not workflow-first: card grids are pleasant but inefficient for high-volume review, comparison, filtering, and status updates.
4. No unified journey state: resume upload, audit, recommended jobs, and application tracking are separate pages without a clear progress model.
5. Empty/error/loading states exist in some areas but are not standardized across all product-critical flows.
6. Some text output appears mojibake in files, suggesting encoded punctuation was introduced in comments/UI strings. This can harm polish if visible in the browser.
7. Data provenance is weak: curated jobs do not show freshness, source, extraction confidence, or why a listing is recommended beyond score/skills.
8. Settings are account-centric and do not help users configure job search preferences, roles, locations, seniority, source types, or AI/outreach preferences.

## Visual and Design Issues

Current visual direction:

- Mostly monochrome neutral design with black/white primary tokens.
- Some orange brand token exists (`--brand-primary`) but is lightly used.
- Status colours are used locally for scores and statuses.
- UI uses many rounded-xl cards, borders, and muted backgrounds.

Concerns:

- The current theme is not yet a clear product design system. Many values are local Tailwind classes rather than semantic product tokens.
- Global `body { zoom: 0.9; }` is risky for accessibility, browser consistency, and responsive layout testing.
- Scrollbars are globally hidden, which can reduce discoverability and accessibility on long dashboards.
- Dashboard widgets and quick stats feel less connected to real product data than the audit/jobs pages.
- The landing page is more marketing oriented than the operational product experience, but the app itself is the better place to focus first.

## Accessibility Concerns

Strengths:

- Many icon buttons use aria-label or aria-hidden.
- Forms often use labels.
- Errors in auth flows use `role="alert"`/`aria-live`.
- Focus-visible rings are present in reusable UI classes.
- Audit results tabs use tablist/tab/tabpanel roles.

Risks:

- Some custom controls rely on visual state and need keyboard/focus verification.
- Score bars and colour-coded status chips should always include visible text and not rely on colour alone.
- Toast-only feedback should not be the only place critical state changes are communicated.
- Global hidden scrollbars can make overflow areas harder to discover.
- Global zoom can interfere with user text scaling and browser zoom expectations.
- Drag/reorder affordances in resume builder should have keyboard alternatives if implemented as true reordering controls.

UIUX ProMax emphasis applied:

- Maintain 4.5:1 contrast for normal text.
- Keep visible focus states.
- Use aria-live/role alert for errors and async results.
- Do not rely on colour alone for status.
- Preserve keyboard navigation and predictable back/cancel routes.
- Use minimum 44px interactive targets for touch.

## Data Display Concerns

- Jobs are shown only as cards. Cards are readable, but a review queue or table would better support scanning many jobs by company, title, score, salary, status, and date.
- Audit results have useful panels, but the information hierarchy could be tightened around "what changed, why it matters, next action".
- Dashboard stats should be backed by real state or removed/relabelled as sample/local widgets.
- Pipeline metrics need visible counts and definitions.
- Score displays should include accessible labels, thresholds, and explanatory text.

UIUX ProMax guidance applied:

- Use tables or responsive card alternatives for dense comparison.
- Use bullet/progress patterns for compact score-versus-target displays.
- Use funnel/pipeline views only when stages are sequential and clearly labelled.
- Always show numeric values, labels, and text fallbacks for chart-like UI.

## Loading, Error, and Empty State Gaps

Existing strengths:

- Jobs page has skeleton, error, empty, retry, and filter-empty states.
- Audit page has skeletons and an animated loading state.
- Resume list has an empty state.
- Auth and API errors generally surface through toasts or inline messages.

Gaps:

- Empty states are page-specific rather than standardized.
- Some errors are toast-only and may disappear before the user can act.
- Long-running audit/loading states could show clearer stages and cancellation/retry guidance.
- Resume processing states are visible but could be pulled into a unified queue/progress pattern.

## Design System Gaps

Existing:

- `components.json` configures shadcn-style aliases and Lucide icons.
- `globals.css` defines CSS variables for shadcn token roles.
- Reusable primitive components exist under `components/ui`.

Missing:

- Documented product-level design tokens for status, scoring, pipeline stages, confidence, source freshness, and AI states.
- Component usage guidelines for cards vs tables vs panels.
- Standard empty/error/loading components.
- Standard page header/action bar/filter bar pattern.
- Standard data table/review queue pattern.
- Standard responsive dashboard breakpoints beyond ad hoc Tailwind classes.

## Frontend Feasibility Assessment

The existing frontend is a strong base for UI improvement. A web dashboard is already the actual architecture, and the repo already has most primitives required for a polished product experience.

Recommended approach:

- Keep Next.js, Tailwind, Radix/shadcn-style components, Lucide, Zustand, Axios, and Supabase.
- Do not add a separate frontend framework, TUI, or Streamlit layer.
- Improve the existing dashboard and jobs/audit flows first.
- If future company discovery is implemented later, add it as new dashboard sections using the same app shell and component language.

Not recommended:

- Rewriting to a new design system.
- Replacing the current frontend with a CLI/TUI.
- Adding a heavy chart/table dependency before the core layout and state model are settled.
- Building company discovery UI before backend concepts exist.

## Risks and Constraints

- Product scope mismatch: desired company/outreach workflow is broader than current backend.
- Static curated jobs may become stale and should not be presented as live discovery without source/freshness context.
- Placeholder dashboard metrics create trust risk.
- Supabase/auth/backend configuration may be required for full local UI verification.
- Next.js 16/React 19/Tailwind v4 are modern choices; implementation should avoid outdated assumptions about config files.
- The existing codebase contains heavy client components and dynamic imports; performance-sensitive redesign should preserve lazy loading where useful.

## What Should Not Be Changed Yet

- Do not convert to another framework.
- Do not add company discovery, crawler, outreach, or schema changes during the UI polish pass unless explicitly requested.
- Do not change backend scoring logic.
- Do not delete existing resume/audit/jobs functionality.
- Do not add heavy dependencies for charts/tables until the UI direction is approved.
- Do not treat curated jobs as scraped/live company discovery data.

## Recommended UI Direction

The second pass should make OptiHire feel like a coherent job-search operating workspace:

1. Replace placeholder dashboard metrics with real, available data or honest empty states.
2. Add a clearer "next best action" dashboard that guides users from resume upload to audit to job review.
3. Improve `/dashboard/jobs` into a review-oriented interface with a denser list/table option or enhanced cards, stronger filters, and clearer status pipeline.
4. Standardize empty/loading/error states across dashboard, resumes, audit, and jobs.
5. Introduce semantic design tokens for product states: match scores, application statuses, audit severity, freshness, and AI enhancement.
6. Keep company-discovery/outreach as future-facing plan sections until backend support exists.

## UIUX ProMax Notes

The UIUX ProMax SkillHub was used directly, without installation or reinitialisation. Guidance applied:

- Product fit: job board/recruitment and CRM/pipeline products should use flat/minimal design, professional blue/green status colours, and dashboard patterns designed for scanning.
- Design system: minimal Swiss-style dashboard, high contrast, grid-based layout, status colours, restrained effects, and clear hierarchy.
- UX: explicit empty states, skeleton/loading states for async work, retry/recovery on errors, table/card responsive handling, and visible focus states.
- Data display: use bullet/progress patterns for compact score KPIs; use funnel/pipeline only for real sequential stages; show values as text rather than relying on colour.
- Accessibility: maintain contrast, aria-live for errors and async status, keyboard support, labelled controls, non-colour status cues, and no hidden critical feedback.
