# OptiHire UI/UX Implementation Plan

Plan date: 2026-05-26  
Branch: `chore/uiux-promax-audit`  
Source audit: `docs/uiux-repo-audit.md`

## Recommended UI Strategy

Improve the existing Next.js dashboard into a coherent job-search workspace while preserving the current backend and product capabilities.

The first implementation pass should focus on the surfaces that already exist:

- dashboard home
- recommended jobs
- ATS audit
- resumes
- shared design tokens and reusable states

Do not add company discovery, careers-page scraping, outreach generation, or database schema changes in the first UI implementation pass. Those are future product capabilities and need backend/domain work first.

## Why This Fits the Current Repo

The repo already has:

- Next.js App Router pages under `apps/frontend/src/app`
- shadcn-style UI primitives under `apps/frontend/src/components/ui`
- a dashboard shell and sidebar
- job cards, filters, match scores, status updates, and empty/error/loading states
- ATS audit input/results/history
- resume upload/builder flows
- FastAPI endpoints for resumes, analyses, jobs, and users
- Zustand stores for shared frontend state

This means the fastest, lowest-risk improvement is to polish and reorganise the current UI rather than introducing a new frontend framework or product surface.

## Alternative Strategies Considered

### Strategy A: Build a new company discovery web app

Rejected for phase 1. The backend does not currently include company discovery, careers-page extraction, outreach drafts, company fit scoring, or company/contact models.

### Strategy B: Convert to CLI/TUI

Rejected. The repository is already a web application with a mature frontend. A CLI/TUI would be a new product direction and would not improve the existing user-facing app.

### Strategy C: Heavy dashboard rewrite with new chart/table libraries

Deferred. The repo can get meaningful UX gains with existing components, Tailwind, Radix, Lucide, and lightweight custom components. Add heavier libraries only when data volume or chart complexity demands it.

### Strategy D: Focused Next.js dashboard polish

Recommended. This matches the current architecture and keeps changes reviewable.

## Phase 1 Implementation Scope

Goal: make the existing web app feel more trustworthy, coherent, and workflow-oriented without changing backend business logic.

Deliverables:

- Remove or replace misleading placeholder dashboard metrics.
- Add a dashboard "next action" panel driven by available frontend state.
- Add shared UI state components for empty, error, loading, and page headers.
- Improve `/dashboard/jobs` into a more review-oriented experience.
- Add a compact jobs summary/pipeline derived from loaded job matches.
- Add a card/list density toggle if feasible without a heavy table dependency.
- Tighten score and status presentation with semantic tokens and accessible labels.
- Improve copy so current capabilities are clear: resume optimisation, ATS audit, curated job matches, and application tracking.
- Preserve all existing resume upload, builder, audit, and job status functionality.

Out of scope for phase 1:

- New backend models.
- Scraping/crawling.
- Outreach draft generation.
- Company CRM pages.
- New auth flows.
- New dependencies unless clearly justified.

## Phase 2 Implementation Scope

Goal: deepen workflow support after phase 1 is stable.

Possible work:

- Add application pipeline summaries from backend/application status.
- Add saved/hidden/shortlisted job states if backend support is added.
- Add audit export/share view.
- Add job comparison table with bulk actions if data volume grows.
- Add real dashboard metrics endpoint or frontend aggregation from existing APIs.
- Add user preferences for target role, location, work mode, salary, and seniority.
- Add better onboarding checklist and resume processing queue.

## Phase 3 Implementation Scope

Goal: support the broader product context once backend/domain capabilities exist.

Possible work:

- Company discovery workspace.
- Careers-page candidate review queue.
- Company profile/detail view.
- Company fit scoring dashboard.
- Role extraction review queue with provenance/confidence.
- Outreach draft generator and review/edit/export flow.
- CRM-style company/contact/application pipeline.

## Exact Files Likely To Change In Phase 1

Primary frontend files:

- `apps/frontend/src/app/globals.css`
- `apps/frontend/src/components/dashboard/dashboard-ui.tsx`
- `apps/frontend/src/components/dashboard/quick-stats-grid.tsx`
- `apps/frontend/src/components/dashboard/quick-actions.tsx`
- `apps/frontend/src/components/dashboard/dashboard-widgets.tsx`
- `apps/frontend/src/components/jobs/recommended-jobs-view.tsx`
- `apps/frontend/src/components/jobs/job-card.tsx`
- `apps/frontend/src/app/dashboard/jobs/page.tsx`
- `apps/frontend/src/app/dashboard/page.tsx`
- `apps/frontend/src/components/app-sidebar.tsx`

Likely new frontend files:

- `apps/frontend/src/components/shared/page-heading.tsx`
- `apps/frontend/src/components/shared/empty-state.tsx`
- `apps/frontend/src/components/shared/error-state.tsx`
- `apps/frontend/src/components/shared/loading-state.tsx`
- `apps/frontend/src/components/jobs/jobs-summary.tsx`
- `apps/frontend/src/components/jobs/job-review-list.tsx`
- `apps/frontend/src/lib/status-styles.ts`
- `apps/frontend/src/lib/score-utils.ts`

Maybe changed if needed:

- `apps/frontend/src/stores/saved-resumes-store.ts`
- `apps/frontend/src/stores/audit-history-store.ts`
- `apps/frontend/src/lib/job-types.ts`
- `apps/frontend/src/lib/constants.ts`

## Exact Files Likely To Change Later

Phase 2:

- `apps/backend/app/api/v1/endpoints/jobs.py`
- `apps/backend/app/models/job_model.py`
- `apps/backend/app/schemas/job_schema.py`
- `apps/backend/app/services/job_match_service.py`
- `apps/backend/alembic/versions/*`
- `apps/frontend/src/middle-service/jobs.ts`
- `apps/frontend/src/stores/*`

Phase 3:

- `apps/backend/app/models/company_model.py`
- `apps/backend/app/schemas/company_schema.py`
- `apps/backend/app/services/company_discovery_service.py`
- `apps/backend/app/services/outreach_service.py`
- `apps/backend/app/api/v1/endpoints/companies.py`
- `apps/frontend/src/app/dashboard/companies/*`
- `apps/frontend/src/components/companies/*`
- `apps/frontend/src/components/outreach/*`
- `apps/frontend/src/middle-service/companies.ts`
- `apps/frontend/src/middle-service/outreach.ts`

These phase 3 files do not currently exist and should not be created in phase 1 unless the backend product scope is approved.

## Proposed Design Tokens

Keep Tailwind CSS variables in `apps/frontend/src/app/globals.css` and introduce semantic product tokens. Prefer OKLCH to match the existing file.

### Colours

Recommended light theme roles:

- background: `#F8FAFC`
- foreground: `#0F172A`
- card: `#FFFFFF`
- card foreground: `#0F172A`
- primary: `#2563EB`
- primary foreground: `#FFFFFF`
- secondary: `#EFF6FF`
- secondary foreground: `#1E3A8A`
- accent: `#059669`
- accent foreground: `#FFFFFF`
- muted: `#F1F5F9`
- muted foreground: `#64748B`
- border: `#E2E8F0`
- ring: `#2563EB`
- destructive: `#DC2626`

Product-specific tokens:

- score strong: `#047857`
- score good: `#0D9488`
- score fair: `#B45309`
- score weak: `#B91C1C`
- status not applied: neutral slate
- status applied: blue
- status interviewing: amber
- status offer: emerald
- status rejected: red
- AI enhancement: violet
- freshness/current: emerald
- freshness/stale: amber
- freshness/unknown: slate

### Typography

Keep the existing `geist` package for now because the root layout already avoids external font requests. Use:

- font family: Geist Sans
- mono/data: Geist Mono
- body size: 16px base
- small text: 14px minimum for dense dashboard content
- captions: 12px only for secondary labels
- line-height: 1.5 for body and 1.25 to 1.35 for headings
- tabular figures for metrics, scores, dates, and counts

### Spacing

Use a 4/8px scale:

- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

Dashboard content:

- mobile page padding: 16px
- tablet page padding: 24px
- desktop page padding: 32px
- card internal padding: 16px to 24px depending density
- grid gap: 16px to 24px

### Border Radius

Per project UI guidance, reduce broad decorative rounding:

- primitive controls: 6px to 8px
- repeated cards: 8px
- dialogs/sheets: 10px to 12px
- pills/badges: 6px

Avoid making every section a `rounded-xl` card. Use cards only for repeated items, panels, and framed tools.

### Shadows

Use restrained shadows:

- shadow-xs for controls and subtle surfaces
- shadow-sm for hoverable cards
- shadow-md only for popovers/dialogs
- prefer borders and background contrast over heavy elevation

### Status Colours

Every status colour must include text and/or icon cues:

- Not Applied: `Minus`, neutral label
- Applied: `CheckCircle2`, blue label
- Interviewing: `Clock`, amber label
- Offer: `Trophy`, emerald label
- Rejected: `XCircle`, red label

## Proposed Component Inventory

Shared:

- `PageHeading`
- `StatePanel` or separate `EmptyState`, `ErrorState`, `LoadingState`
- `MetricCard`
- `ScoreBadge`
- `StatusBadge`
- `FilterBar`
- `SegmentedControl`
- `InlineProgress`
- `ActionList`

Jobs:

- `JobsSummary`
- `JobReviewList`
- `JobCard`
- `JobStatusSelect`
- `JobSkillChips`
- `JobScoreExplanation`

Dashboard:

- `NextActionPanel`
- `WorkflowChecklist`
- `ApplicationPipelineSummary`
- `ResumeReadinessPanel`

Audit:

- existing `ScoreRing`
- existing results panels, tightened visually
- optional `AuditSummaryCard`

## Proposed Screens, Views, and Commands

Existing screens to improve:

- `/dashboard`: action-oriented overview.
- `/dashboard/jobs`: review queue for curated job matches.
- `/dashboard/audit`: clearer analysis workflow and states.
- `/dashboard/resumes`: keep existing builder, improve consistency only if touched.

No new top-level pages in phase 1 unless needed for shared state testing.

Potential future screens:

- `/dashboard/companies`
- `/dashboard/outreach`
- `/dashboard/pipeline`

## Proposed Navigation Structure

Phase 1 sidebar:

- Dashboard
- Resumes
- ATS Audit
- Jobs
- Settings

Optional label refinement:

- Rename `Jobs` to `Job Matches` if the UI needs clearer scope.
- Keep `ATS Audit` because backend and copy already use it.

Future sidebar after backend expansion:

- Dashboard
- Companies
- Job Matches
- Outreach
- Pipeline
- Resumes
- Settings

## Proposed Table and Review Patterns

For phase 1, avoid heavy dependencies. Use:

- card grid on mobile and casual browsing
- compact list/table-like row layout on desktop for review mode
- filters above results with search, work type, job type, min score, and status
- visible result count and active filter summary
- row/card actions: apply/view job, update status, inspect score explanation
- keep `aria-live` on result count changes

If true tables are added:

- wrap in `overflow-x-auto` for mobile
- ensure column headers are real `th`
- avoid hiding critical actions behind hover
- provide a card fallback or stacked rows under small breakpoints

## Proposed Empty, Loading, and Error States

Empty states:

- No resume: "Upload or create a resume before matching jobs."
- No audit history: "Run your first ATS audit to compare against a role."
- No jobs: "No curated matches are available for this resume yet."
- No filter results: "No jobs match these filters" plus clear filters action.

Loading states:

- Skeleton cards/lists for page-level content.
- Button loading states for submit/update actions.
- Long-running audit state with staged copy: preparing resume, comparing keywords, generating recommendations.

Error states:

- Inline error panel with message and retry action.
- Toast may supplement but should not be the only recovery path.
- API setup/network error should mention backend URL/config if detectable.

## Accessibility Checklist

Phase 1 should verify:

- All interactive controls are keyboard reachable.
- All icon-only buttons have aria labels.
- Button labels remain visible or have accessible names during loading.
- Errors use `role="alert"` or `aria-live`.
- Result counts use `aria-live="polite"` where filters change.
- Score/status UI includes text, not colour alone.
- Focus-visible rings remain visible after token changes.
- No global CSS hides important scroll affordances.
- Body/browser zoom is not overridden.
- Touch targets are at least 44px where practical.
- Dialogs and sheets have titles and descriptions.
- Tabs have matching `aria-controls`/`aria-labelledby`.

## Testing Plan

Run, as practical:

- `pnpm --filter optihire lint`
- `pnpm --filter optihire build`
- `cd apps/backend && python -m pytest`

Manual/browser verification after implementation:

- dashboard route loads
- jobs route loads with loading, error, empty, and populated states where feasible
- status update still calls the existing API
- audit route still submits and displays results
- resume upload/review dialog still opens
- mobile layout at 375px, tablet at 768px, desktop at 1440px
- keyboard navigation through sidebar, filters, cards/list, dialogs, and tabs

## Lint and Typecheck Plan

Frontend:

- Use existing Biome command through `pnpm --filter optihire lint`.
- Use `pnpm --filter optihire build` for TypeScript/Next validation because no separate `typecheck` script is defined.

Backend:

- Use pytest for existing backend tests.
- Ruff is configured in `apps/backend/pyproject.toml`, but no root script exists. If needed, run `ruff check apps/backend/app apps/backend/tests` only if Ruff is installed.

## Acceptance Criteria

Phase 1 is complete when:

- No placeholder dashboard metrics remain without clear sample/local labelling.
- Dashboard gives a clear next action based on available state.
- Jobs page supports faster review than the current card-only layout.
- Jobs still load from `getActiveResume` and `getJobMatches`.
- Application status updates still work through the existing API.
- Empty/loading/error states are consistent and actionable.
- Product copy accurately reflects current ATS/resume/job-match capabilities.
- Design tokens are more semantic and accessible.
- No company discovery/outreach/backend schema changes are introduced.
- Frontend lint and build pass, or failures are documented with concrete blockers.

## Rollback Considerations

Keep changes scoped and easy to revert:

- Shared components should be additive.
- Existing API service functions should not be renamed unless all call sites are updated.
- Preserve existing route paths.
- Avoid migrations in phase 1.
- Avoid new dependencies in phase 1.
- If the jobs review/list mode causes regressions, retain the existing card grid as the fallback.

## Open Questions

1. Should phase 1 rename `Jobs` to `Job Matches` to avoid implying live discovery?
2. Should dashboard widgets like focus timer and quick notes stay, or should dashboard become strictly product-data driven?
3. Should the curated job catalogue be visibly labelled as curated/static?
4. Should the next implementation pass remove global `body { zoom: 0.9; }` and hidden scrollbars immediately?
5. Should phase 2 prioritise real pipeline metrics or future company discovery?
6. Should outreach remain future scope until company/contact data exists?

## Ready-To-Copy Second Codex Implementation Prompt

```text
You are working inside the OptiHire repository.

This is the second pass after the UI/UX audit. Implement a focused frontend UI polish pass only. Do not add company discovery, careers-page scraping, outreach generation, backend schema changes, or new heavy dependencies.

Use the existing repo architecture:
- pnpm monorepo
- Next.js 16 / React 19 frontend in apps/frontend
- Tailwind CSS v4 and shadcn-style local components
- Radix UI primitives, Lucide icons, Zustand stores, Axios services
- FastAPI backend in apps/backend

Read first:
- docs/uiux-repo-audit.md
- docs/uiux-implementation-plan.md
- apps/frontend/src/app/globals.css
- apps/frontend/src/components/dashboard/dashboard-ui.tsx
- apps/frontend/src/components/dashboard/quick-stats-grid.tsx
- apps/frontend/src/components/dashboard/quick-actions.tsx
- apps/frontend/src/components/dashboard/dashboard-widgets.tsx
- apps/frontend/src/components/jobs/recommended-jobs-view.tsx
- apps/frontend/src/components/jobs/job-card.tsx
- apps/frontend/src/components/app-sidebar.tsx

Goal:
Make the existing OptiHire web app feel like a coherent job-search operating workspace for resume optimisation, ATS audits, curated job matches, and application tracking.

Phase 1 scope:
1. Replace or relabel misleading placeholder dashboard metrics and recent activity.
2. Add an action-oriented dashboard overview that guides users through:
   - upload/create resume
   - run ATS audit
   - review job matches
   - update application status
3. Add shared lightweight UI components for page headings and empty/error/loading states if useful.
4. Improve /dashboard/jobs for review:
   - keep existing API behaviour
   - keep job card browsing
   - add a compact review/list mode or denser layout using existing components
   - add summary counts by application status and score range from loaded job matches
   - keep search/work type/job type/min score filters
   - consider adding status filtering if straightforward
   - make score/status explanations clearer and accessible
5. Improve design tokens in apps/frontend/src/app/globals.css:
   - remove risky global browser zoom
   - avoid globally hiding scrollbars if it harms usability
   - add semantic product tokens for score/status states
   - keep the existing Geist font setup
6. Preserve all existing routes and core behaviour:
   - resume upload still works
   - extracted-data review dialog still opens
   - ATS audit still submits and displays results
   - audit history still works
   - jobs still load through getActiveResume/getJobMatches
   - application status update still calls updateApplicationStatus

Design direction:
- Professional SaaS/job-search dashboard
- Minimal, high-contrast, data-dense but calm
- Use Lucide icons, not emoji
- Use cards only for repeated items or framed tools
- Prefer clear action bars, compact summaries, semantic badges, and accessible progress/score indicators
- Do not create a marketing landing-page redesign in this pass

Accessibility requirements:
- visible focus states
- aria labels for icon-only buttons
- aria-live for result counts/errors where useful
- status and score are not conveyed by colour alone
- keyboard usable filters and actions
- no broken mobile layout at 375px

Suggested files likely to change:
- apps/frontend/src/app/globals.css
- apps/frontend/src/components/dashboard/dashboard-ui.tsx
- apps/frontend/src/components/dashboard/quick-stats-grid.tsx
- apps/frontend/src/components/dashboard/quick-actions.tsx
- apps/frontend/src/components/dashboard/dashboard-widgets.tsx
- apps/frontend/src/components/jobs/recommended-jobs-view.tsx
- apps/frontend/src/components/jobs/job-card.tsx
- apps/frontend/src/app/dashboard/jobs/page.tsx
- apps/frontend/src/app/dashboard/page.tsx
- apps/frontend/src/components/app-sidebar.tsx

Optional new files:
- apps/frontend/src/components/shared/page-heading.tsx
- apps/frontend/src/components/shared/empty-state.tsx
- apps/frontend/src/components/shared/error-state.tsx
- apps/frontend/src/components/shared/loading-state.tsx
- apps/frontend/src/components/jobs/jobs-summary.tsx
- apps/frontend/src/components/jobs/job-review-list.tsx
- apps/frontend/src/lib/status-styles.ts
- apps/frontend/src/lib/score-utils.ts

Do not:
- add a new web framework
- convert to CLI/TUI
- add company/outreach pages unless backend support exists and I explicitly ask
- alter backend scoring logic
- add database migrations
- remove existing functionality
- add heavy chart/table dependencies unless you explain and get approval

Before editing:
- run git status
- protect any existing uncommitted user changes
- create a new branch with prefix codex/ unless already on an appropriate task branch

After implementation:
- run pnpm --filter optihire lint
- run pnpm --filter optihire build
- run backend tests only if backend files were changed; otherwise state they were not needed
- use the Browser plugin to open the local app if a dev server is practical, and verify desktop/mobile screenshots or at least responsive browser states
- report changed files, checks run, results, and any known limitations
```
