# MVP Read API Spec

## Endpoints

### `GET /api/health`

- Returns `{ "status": "ok" }`

### `GET /api/home`

- Returns the full localized homepage payload consumed by the frontend `home` feature
- Locale resolution:
  - query param `lang` first
  - `Accept-Language` fallback
  - default `en`

### `GET /api/events`

- Returns localized intro copy plus ordered event items

### `GET /api/restaurants`

- Returns localized intro copy plus ordered restaurant items

### `GET /api/tours`

- Returns localized intro copy plus ordered tour items

## Response Rules

- only published content is returned
- locale is part of response selection
- responses are shaped for direct frontend consumption
- booking is excluded from MVP
