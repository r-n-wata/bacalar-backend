# Admin Dashboard Moderation

## Problem
- The app can collect event, restaurant, and tour submissions, but there is no authenticated admin workflow to review or publish them.
- Approval status exists in the schema, yet there are no protected admin APIs or frontend routes to act on pending submissions.

## Objective
- Add a first admin-only moderation workflow that lets authenticated admins review pending submissions, approve them into public content, or reject them.

## Scope
- In scope:
  - Supabase-backed admin authentication with a database allow-list
  - Protected backend admin routes
  - Protected frontend admin routes
  - Pending submission filters for all, events, restaurants, and tours
  - Approve and reject actions that update submission state and publication state
  - Proposal tracking and automated coverage
- Out of scope:
  - Public contributor authentication
  - Multi-role editorial workflows
  - Review notes UI
  - Editing approved content after publication

## Inputs and Dependencies
- Relevant files:
  - `backend/prisma/schema.prisma`
  - `backend/src/routes/apiRoutes.ts`
  - `backend/src/services/*SubmissionService.ts`
  - `frontend/src/app/router/AppRouter.tsx`
  - `frontend/src/app/i18n/config.ts`
- External systems:
  - Supabase Auth
- Existing docs:
  - `/Users/ruth.wata/Projects/bacalar/architecture.md`
  - `/Users/ruth.wata/Projects/bacalar/ci.md`
  - `/Users/ruth.wata/Projects/bacalar/sdd/references/spec-template.md`

## Constraints
- Architecture:
  - Keep backend controllers thin and move review rules into services/repositories.
  - Preserve the existing feature-first frontend structure.
- State management:
  - React Query owns admin server state and mutation refresh behavior.
- API or data model:
  - Only authenticated admins can access `/api/admin/*`.
  - Approved submissions publish immediately into the public content models.
- CI or quality gates:
  - Frontend must continue to pass lint, typecheck, tests, and build.
  - Backend must continue to pass typecheck, tests, Prisma validation, and build.

## Proposed Behavior
- Happy path:
  - An admin signs in with Supabase email/password.
  - The frontend validates the session against `/api/admin/session`.
  - The admin opens `/admin/submissions`, filters pending items, reviews details and images, then approves or rejects an item.
  - Approvals create published content and mark the submission approved in one transaction.
  - Rejections mark the submission rejected without creating public content.
- Edge cases:
  - Missing or invalid bearer token returns `401`.
  - Authenticated non-admin users return `403`.
  - Reviewing a non-pending submission returns `409`.
  - Missing submission returns `404`.
- Failure states:
  - If publication fails, the submission state must not partially update.
  - If Supabase auth is unavailable, admin routes return a structured error.

## Acceptance Criteria
- [ ] Only authenticated, allow-listed admins can access admin routes on frontend and backend.
- [ ] Admins can filter pending submissions by all, events, restaurants, and tours.
- [ ] Review cards display submission details, images, and metadata before moderation.
- [ ] Approving a submission publishes it and updates submission review state transactionally.
- [ ] Rejecting a submission updates submission review state without publishing content.
- [ ] The dashboard refreshes automatically after approve or reject actions.
- [ ] Frontend and backend tests cover auth protection, filtering, and moderation behavior.

## Implementation Plan
- Step 1: Add admin schema, migration, proposal tracking, and backend auth/moderation foundations.
- Step 2: Add protected admin endpoints for session, pending list, and approve/reject actions.
- Step 3: Build frontend admin auth, protected routes, dashboard filters, and moderation UI.
- Step 4: Add backend and frontend tests plus validation runs.

## Risks
- Risk: Restaurant submissions do not currently collect a dedicated `vibe` field, while published restaurant content requires one.
- Mitigation: Derive a simple localized vibe label from the submitted dining moment for v1 publication.

## Open Questions
- Question: Should approval only change submission state or immediately publish public content?
- Assumption if unanswered: Approval immediately publishes public content.

## Tracking
- [x] Admin auth
- [x] Backend route protection
- [x] Moderation endpoints
- [x] Frontend admin pages
- [x] Tests and validation
