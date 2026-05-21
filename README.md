# Bacalar Backend

This backend is the MVP read API for Bacalar. It serves structured, localized content for the frontend's active MVP experience:

- home
- events
- restaurants
- tours

Booking is intentionally out of MVP scope and is not exposed as an active backend API.

## What this app does

The service provides frontend-ready JSON payloads for the Bacalar experience using:

- Express + TypeScript for the HTTP runtime
- Prisma for data access and schema management
- PostgreSQL as the primary database target
- localized content resolution for `en` and `es`
- service-layer caching behind a swappable in-memory cache implementation

The current public endpoints are:

- `GET /api/health`
- `GET /api/home`
- `GET /api/events`
- `GET /api/restaurants`
- `GET /api/tours`

## Project structure

```txt
backend/
  prisma/
    schema.prisma
    seed.ts
  proposals/
    mvp-read-api-spec.md
    performance-caching.md
    schema-design.md
  src/
    config/
    controllers/
    data/
    middlewares/
    repositories/
    routes/
    services/
    types/
    utils/
    app.ts
    server.ts
  tests/
  architecture.md
  package.json
  README.md
```

## Runtime architecture

Request flow:

1. route receives the request
2. controller resolves locale and delegates work
3. service assembles the response and applies cache-aware reads
4. repository reads structured content from Prisma-backed data sources
5. response is returned as a frontend-oriented payload

Layer ownership:

- `src/routes`: public endpoint registration
- `src/controllers`: HTTP boundary and locale selection
- `src/services`: content assembly and cache-aware read logic
- `src/repositories`: persistence access
- `src/utils/cache.ts`: swappable cache provider used by services
- `src/data/seedContent.ts`: seed content aligned with the frontend's current contract

For deeper system notes, see `/Users/ruth.wata/Projects/bacalar/backend/architecture.md`.

## Environment

The app expects these variables:

```bash
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bacalar?schema=public"
DEFAULT_LOCALE=en
```

A starter file is available at `/Users/ruth.wata/Projects/bacalar/backend/.env.example`.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
cp .env.example .env
```

3. Make sure PostgreSQL is running and `DATABASE_URL` points to a writable database.

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Validate the Prisma schema:

```bash
npm run prisma:validate
```

6. Apply the schema to your database using your Prisma workflow.

If you are bootstrapping locally and want the quickest path, `npx prisma db push` is the simplest option for now.

7. Seed the database with the MVP content set:

```bash
npm run prisma:seed
```

8. Start the development server:

```bash
npm run dev
```

The API will then be available at [http://localhost:4000](http://localhost:4000) unless `PORT` is changed.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run test
npm run prisma:generate
npm run prisma:validate
npm run prisma:seed
```

## API behavior

### Locale handling

The backend resolves locale using frontend-compatible request patterns:

- query param first: `?lang=en` or `?lang=es`
- default fallback from `DEFAULT_LOCALE`

This keeps the runtime aligned with the frontend's current localized request flow.

### Response shape

The API intentionally returns frontend-ready payloads rather than heavily normalized entities. That keeps the MVP simple and compatible with the MSW contracts already used by the frontend.

### Caching

Caching is implemented in the service layer, not in controllers.

Current design:

- `home`: longest cache window
- `restaurants`: long cache window
- `tours`: medium cache window
- `events`: shortest cache window among MVP endpoints

The current implementation uses an in-memory cache abstraction so we can swap in a stronger backend cache later without changing controller contracts.

## Testing and validation

Recommended local verification:

```bash
npm run typecheck
npm run test
npm run build
```

Prisma-specific checks:

```bash
npm run prisma:generate
npm run prisma:validate
```

## Frontend compatibility

This backend is designed to replace MSW for the frontend's active MVP read paths without requiring major frontend response reshaping.

The active compatibility targets are:

- `/api/home`
- `/api/events`
- `/api/restaurants`
- `/api/tours`

## Non-MVP scope

These areas are intentionally deferred:

- booking endpoints
- booking workflow logic
- admin/content management endpoints
- authentication and authorization
- payments
- live availability logic

## Related docs

- `/Users/ruth.wata/Projects/bacalar/backend/architecture.md`
- `/Users/ruth.wata/Projects/bacalar/backend/proposals/mvp-read-api-spec.md`
- `/Users/ruth.wata/Projects/bacalar/backend/proposals/schema-design.md`
- `/Users/ruth.wata/Projects/bacalar/backend/proposals/performance-caching.md`
