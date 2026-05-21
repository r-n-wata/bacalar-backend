# Performance and Caching

## Cache Ownership

- services own cache-aware reads
- controllers do not manage caching
- cache provider is swappable
- MVP starts with in-memory TTL caching

## Endpoint Policies

- `/api/home`
  - longest TTL
  - keyed by locale
- `/api/events`
  - shorter TTL
  - keyed by locale
- `/api/restaurants`
  - longer TTL
  - keyed by locale
- `/api/tours`
  - medium TTL
  - keyed by locale

## Invalidation Direction

- home on curated content changes
- events on editorial/timing changes
- restaurants on catalog/content changes
- tours on price/content changes

## Future

- external cache provider
- booking caching after booking becomes in-scope
