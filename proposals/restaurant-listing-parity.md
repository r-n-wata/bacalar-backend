# Restaurant Listing Parity With Events

## Objective

- Upgrade the restaurant listing flow to follow the same product and technical pattern as `events`
- Keep the feature localized and frontend-ready
- Preserve the current restaurant detail route while making the listing richer and easier to browse

## Proposed Experience

- `GET /api/restaurants` returns localized intro copy plus:
  - featured restaurant items
  - paginated main list items
  - pagination metadata
- The restaurants page mirrors the `events` page structure:
  - page intro
  - featured strip
  - category chips
  - main list
  - empty state
  - error state
- Category chips represent dining moments:
  - `all`
  - `breakfast`
  - `lunch`
  - `dinner`
- Featured restaurants stay global while chips filter the main list only, matching current `events` behavior
- The existing restaurant detail page remains in place and can surface the new dining moment metadata

## API Contract

### `GET /api/restaurants`

- Supports query params:
  - `lang`
  - `limit`
  - `cursor`
  - `category`
- Supported category values:
  - `all`
  - `breakfast`
  - `lunch`
  - `dinner`
- Invalid category values return `400`

### Response shape

- `eyebrow`
- `title`
- `description`
- `featuredItems`
- `items`
- `pagination`

### Restaurant item fields

- `id`
- `name`
- `cuisine`
- `vibe`
- `priceBand`
- `moment`
- `route`

### Pagination fields

- `hasMore`
- `nextCursor`

## Data Model Direction

- Add a stable `moment` field to `Restaurant`
- `moment` is locale-agnostic and separate from translated copy
- Restaurant translations continue to own:
  - `name`
  - `cuisine`
  - `vibe`
  - `description`
- Ordering continues to use `sortOrder`

## Implementation Direction

- Backend:
  - extend restaurant content types to match the events listing pattern
  - add restaurant query parsing in the content controller
  - update service cache keys to include locale, category, limit, and cursor
  - update in-memory and Prisma repositories to support filtering, featured selection, and pagination
- Frontend:
  - replace the current single-query restaurant hook with an infinite-query flow
  - update restaurant API helpers and query keys to include category and pagination inputs
  - add restaurant listing components parallel to the event feature:
    - featured section
    - category nav
    - paginated list
  - update restaurant i18n strings in English and Spanish for the new listing states
- Mocks and tests:
  - expand restaurant fixtures and MSW handlers for featured items, category filtering, pagination, empty states, and errors
  - add route-level tests parallel to `EventsPage.test.tsx`
  - add backend controller and repository coverage for restaurant pagination behavior

## Acceptance Criteria

- The restaurants listing page follows the same browsing pattern as `events`
- Restaurant chips filter the main list by dining moment
- Featured restaurants render independently from the active filter
- Load-more behavior uses pagination metadata from the API
- Empty and error states are localized
- The backend and frontend restaurant contracts stay aligned
- Existing restaurant detail routes continue to work
- The restaurants listing page includes a CTA that leads to a real restaurant submission workflow
- Restaurant submissions persist separately from published restaurant content and stay pending review

## Out Of Scope

- booking features
- admin and editorial tools
- major redesign of the restaurant detail page beyond parity-driven metadata updates

## Validation

- Frontend:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- Backend:
  - relevant controller, repository, and service tests for restaurant listing behavior

## Assumptions

- "Same pattern as events" means behavior and contract parity, not forced component sharing
- Dining moment is the right stable filter model for restaurants
- The main list may still include featured items, matching current event-list behavior unless implementation reveals a stronger existing convention
