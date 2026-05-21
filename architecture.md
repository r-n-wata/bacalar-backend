# Bacalar Backend Architecture

## Overview

This backend is the MVP runtime for the Bacalar app's public read APIs. It serves structured, localized content for:

- home
- events
- restaurants
- tours

Booking is future-only and intentionally out of the active MVP contract.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Vitest

## Structure

```txt
backend/
  prisma/
    migrations/
    schema.prisma
    seed.ts
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
  tests/
  proposals/
  render.yaml
```

## Layering

- routes register public HTTP endpoints
- controllers resolve locale and delegate to services
- services own payload assembly, cache policy, and content retrieval rules
- repositories own Prisma-backed data access
- middlewares own logging, CORS, rate limiting, not-found handling, and sanitized errors
- Prisma migrations are the source of truth for schema evolution

## MVP Endpoints

- `GET /api/health`
- `GET /api/home`
- `GET /api/events`
- `GET /api/restaurants`
- `GET /api/tours`

## Deployment model

The MVP deployment topology is:

- Netlify hosts the frontend
- Render hosts the backend API
- PostgreSQL is connected to the Render service through `DATABASE_URL`

Render expectations:

- build the TypeScript service
- run Prisma client generation during build
- run `prisma migrate deploy` before serving traffic
- use `GET /api/health` for health checks

## Runtime protections

The backend includes the minimum public-MVP safeguards:

- explicit CORS allow-list behavior
- Netlify preview domain support through `NETLIFY_SITE_NAME`
- lightweight in-memory rate limiting
- standardized error responses
- request logging

## Non-MVP

- booking endpoints
- admin/write endpoints
- auth
- payment
- live availability
- multi-instance/distributed rate limiting
