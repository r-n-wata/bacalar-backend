# Bacalar Backend Architecture

## Overview

This backend is the greenfield runtime for the Bacalar app's MVP read APIs. It serves structured, localized content for:

- home
- events
- restaurants
- tours

Booking is explicitly out of MVP scope.

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
  src/
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    types/
    utils/
  tests/
  proposals/
```

## Layering

- routes register public HTTP endpoints
- controllers resolve locale and delegate to services
- services own payload assembly and cache-aware reads
- repositories own data access
- Prisma is the default persistence layer
- cache is abstracted behind a swappable provider, starting with in-memory TTL caching

## MVP Endpoints

- `GET /api/health`
- `GET /api/home`
- `GET /api/events`
- `GET /api/restaurants`
- `GET /api/tours`

## Non-MVP

- booking endpoints
- admin/write endpoints
- auth
- payment
- live availability
