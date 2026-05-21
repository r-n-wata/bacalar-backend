# Schema Design

## Strategy

- PostgreSQL relational schema
- Prisma-managed models and migrations
- core entity tables plus translation tables for localized copy
- dedicated home content tables for curated homepage structure
- editorial/admin-ready fields included now

## Core Models

- `Locale`
- `FeaturePage`
- `FeaturePageTranslation`
- `Event`
- `EventTranslation`
- `Restaurant`
- `RestaurantTranslation`
- `Tour`
- `TourTranslation`
- `HomePage`
- `HomePageTranslation`
- `HomeSpotlightEntry`
- `HomeSpotlightEntryTranslation`
- `HomeSpotlightMetric`
- `HomeSection`
- `HomeSectionTranslation`
- `HomeSectionCard`
- `HomeSectionCardTranslation`
- `HomeCta`
- `HomeCtaTranslation`

## Ownership

- home payload comes from dedicated home tables
- events payload comes from `Event` + `EventTranslation` plus `FeaturePage`
- restaurants payload comes from `Restaurant` + `RestaurantTranslation` plus `FeaturePage`
- tours payload comes from `Tour` + `TourTranslation` plus `FeaturePage`

## Non-MVP

- booking schema
- admin endpoints
- write workflows
