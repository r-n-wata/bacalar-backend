# Admin Dashboard Moderation v2

## Problem
- The first admin moderation pass only supports a pending-only list with fully expanded cards, which makes the review experience heavier than it needs to be.
- Admins also need visibility into approved and rejected submissions, plus a dedicated review page for full-detail checks before or after moderation.

## Objective
- Turn the admin area into a compact moderation dashboard with status-aware filtering, compact cards, a dedicated submission detail view, and a clear authenticated logout state in the shared header.

## Scope
- In scope:
  - Session-aware header admin action that becomes `Log out` when an admin session exists
  - Protected admin dashboard inbox at `/admin/submissions`
  - Protected admin detail view at `/admin/submissions/:type/:id`
  - Status filters for `all`, `pending`, `approved`, and `rejected`
  - Type filters for `all`, `events`, `restaurants`, and `tours`
  - Compact review cards with first-image thumbnails and direct approve/reject actions
  - Full submission detail view with ordered image gallery and moderation actions
  - Proposal tracking and automated coverage updates
- Out of scope:
  - Public contributor authentication
  - Multi-role editorial workflows
  - Review notes UI
  - Editing approved content after publication

## Inputs and Dependencies
- Relevant files:
  - `backend/src/types/admin.ts`
  - `backend/src/repositories/adminModerationRepository.ts`
  - `frontend/src/components/templates/AppShell.tsx`
  - `frontend/src/features/admin/pages/AdminDashboardPage.tsx`
  - `frontend/src/features/admin/pages/AdminSubmissionDetailPage.tsx`
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
  - React Query owns admin server state, filter state refetch behavior, and post-moderation refresh.
- API or data model:
  - Only authenticated admins can access `/api/admin/*`.
  - The list endpoint defaults to `pending` when no explicit status filter is supplied.
  - Approved submissions publish immediately into the public content models.
- UI:
  - The admin area should feel like a dashboard, but still reuse the app’s existing design language, spacing, and component patterns.
- CI or quality gates:
  - Frontend must continue to pass lint, typecheck, tests, and build.
  - Backend must continue to pass typecheck, tests, Prisma validation, and build.

## Proposed Behavior
- Happy path:
  - An admin signs in with Supabase email/password.
  - The shared header swaps the admin/login entry for a clear `Log out` action.
  - The admin opens `/admin/submissions`, sees `pending` items by default, and can switch both status and type filters.
  - Each submission appears as a compact dashboard card with a first-image thumbnail, summary metadata, and direct approve/reject actions.
  - Clicking a card opens `/admin/submissions/:type/:id`, where the admin can review all details and an ordered image gallery before moderating.
  - Approve/reject updates the database, refreshes the list, and updates the detail state immediately.
- Edge cases:
  - Missing or invalid bearer token returns `401`.
  - Authenticated non-admin users return `403`.
  - Reviewing a non-pending submission returns `409`.
  - Missing submission detail returns `404`.
  - Unsupported list or detail filter values return `400`.
- Failure states:
  - If publication fails, the submission state must not partially update.
  - If Supabase auth is unavailable, admin routes return a structured error.

## Acceptance Criteria
- [x] Only authenticated, allow-listed admins can access admin routes on frontend and backend.
- [x] The shared header shows `Log out` instead of the admin/login entry when an admin session exists.
- [x] Admins can filter submissions by status (`all`, `pending`, `approved`, `rejected`) and type (`all`, `events`, `restaurants`, `tours`).
- [x] Dashboard cards stay compact and show type, title/name, status, submitted date, summary fields, first-image thumbnail, and approve/reject actions.
- [x] Clicking a dashboard card opens a dedicated protected detail route with full metadata and an ordered image gallery.
- [x] Approving a submission publishes it and updates submission review state transactionally.
- [x] Rejecting a submission updates submission review state without publishing content.
- [x] The dashboard and detail views refresh automatically after approve or reject actions.
- [x] Frontend and backend tests cover auth protection, filtering, detail loading, and moderation behavior.

## Implementation Plan
- Step 1: Extend backend admin moderation contracts to support status-aware list filters, compact list DTOs, and full-detail DTOs.
- Step 2: Add a protected admin submission detail endpoint and preserve moderation endpoints for direct approve/reject actions.
- Step 3: Update the shared header, compact dashboard inbox, and dedicated admin detail page on the frontend.
- Step 4: Refresh automated tests plus validation runs for the new dashboard behavior.

## Risks
- Risk: Showing approved and rejected submissions in the dashboard could imply they are still actionable.
- Mitigation: Continue enforcing backend pending-only moderation rules and disable approve/reject buttons in the detail view when the record is no longer pending.

## Open Questions
- Question: Should the detail experience be modal-based or route-based?
- Decision: Use a protected route-based detail view for simpler protection, navigation, and testing.

## Tracking
- [x] Admin auth
- [x] Backend route protection
- [x] Moderation endpoints
- [x] Frontend admin pages
- [x] Tests and validation
