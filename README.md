# Bacalar Backend

This backend is the MVP read API for Bacalar. It serves structured, localized content for the frontend's active MVP experience:

- home
- events
- restaurants
- tours

Booking is future-only and intentionally excluded from the active API contract.

## What this app does

The service provides frontend-ready JSON payloads for the Bacalar experience using:

- Express + TypeScript for the HTTP runtime
- Prisma for schema management and data access
- PostgreSQL as the primary database target
- localized content resolution for `en` and `es`
- service-layer caching with a swappable in-memory cache provider
- CORS and lightweight rate limiting for a public read-only MVP

Current public endpoints:

- `GET /api/health`
- `GET /api/home`
- `GET /api/events`
- `GET /api/restaurants`
- `GET /api/tours`

## Runtime architecture

Request flow:

1. route receives the request
2. controller resolves locale and delegates work
3. service assembles the response and applies cache-aware reads
4. repository reads structured content from Prisma-backed storage
5. middleware applies CORS, rate limiting, and standardized error handling
6. response is returned as a frontend-oriented payload

Layer ownership:

- `src/routes`: public endpoint registration
- `src/controllers`: HTTP boundary and locale selection
- `src/services`: content assembly and cache-aware reads
- `src/repositories`: Prisma-backed persistence access
- `src/middlewares`: CORS, rate limiting, request logging, and error handling
- `src/data/seedContent.ts`: local/dev seed content aligned with the frontend contract

For deeper notes, see `/Users/ruth.wata/Projects/bacalar/backend/architecture.md`.

## Environment

The backend expects these variables:

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bacalar?schema=public"
DEFAULT_LOCALE=en
ALLOWED_ORIGINS="http://localhost:5173"
NETLIFY_SITE_NAME=your-netlify-site-name
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
```

Starter values live in `/Users/ruth.wata/Projects/bacalar/backend/.env.example`.

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

5. Create or update the local schema using Prisma migrations:

```bash
npm run prisma:migrate:dev -- --name init
```

6. Seed the local database with the MVP content set:

```bash
npm run prisma:seed
```

7. Start the development server:

```bash
npm run dev
```

The API will then be available at [http://localhost:4000](http://localhost:4000) unless `PORT` is changed.

## Prisma workflow

Migrations are the official schema workflow for MVP.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate:dev -- --name your_change_name
npm run prisma:migrate:deploy
npm run prisma:migrate:status
npm run prisma:seed
```

Seed policy:

- local/dev: required
- preview/demo: optional if you want content bootstrap automatically
- production: only when intentionally bootstrapping a new environment

## Netlify + Render deployment

Deployment targets are explicit:

- frontend: Netlify
- backend: Render
- database: PostgreSQL connected to Render through `DATABASE_URL`

### Render backend settings

Recommended Render configuration is captured in `/Users/ruth.wata/Projects/bacalar/backend/render.yaml`.

Key expectations:

- build command: `npm ci && npm run prisma:generate && npm run build`
- pre-deploy command: `npm run prisma:migrate:deploy`
- start command: `npm run start`
- health check path: `/api/health`

### CORS behavior

The backend defaults closed and only allows configured origins.

Use:

- `ALLOWED_ORIGINS` for exact origins such as local dev and the production Netlify site
- `NETLIFY_SITE_NAME` to allow Netlify production and preview deploy domains for that site

Example:

```bash
ALLOWED_ORIGINS="http://localhost:5173,https://bacalar.netlify.app"
NETLIFY_SITE_NAME=bacalar
```

## API behavior

### Locale handling

The backend resolves locale using frontend-compatible request patterns:

- query param first: `?lang=en` or `?lang=es`
- `Accept-Language` fallback
- `DEFAULT_LOCALE` fallback when neither is provided

If `lang` is provided but unsupported, the API returns `400` with a standardized error shape.

### Response shape

The API returns frontend-ready payloads instead of heavily normalized response contracts. This keeps the MVP aligned with the current frontend feature contracts.

### Caching and protection

Caching is implemented in the service layer, not in controllers.

Current cache intent:

- `home`: longest cache window
- `restaurants`: long cache window
- `tours`: medium cache window
- `events`: shortest cache window among MVP endpoints

Runtime hardening included now:

- explicit CORS policy
- lightweight in-memory rate limiting
- sanitized error responses
- request logging

## Testing and validation

Recommended local verification:

```bash
npm run ci
```

That runs:

- Prisma client generation
- Prisma schema validation
- TypeScript checks
- backend tests
- production build

## Frontend compatibility

This backend is designed to replace MSW for the frontend's active MVP read paths without major frontend response reshaping.

Compatibility targets:

- `/api/home`
- `/api/events`
- `/api/restaurants`
- `/api/tours`

The homepage contract is intentionally booking-free to match the current frontend MVP.

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
