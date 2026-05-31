export type AppLanguage = 'en' | 'es'

export type EventCategory = 'music' | 'wellness' | 'food'
export type ExperienceKey = 'events' | 'restaurants' | 'tours'

export type HomeSpotlightMetric = {
  label: string
  value: string
}

export type HomeImage = {
  src: string
  alt: string
}

export type HomeSpotlightEntry = {
  title: string
  description: string
  route: string
  cta: string
  metrics: HomeSpotlightMetric[]
  image?: HomeImage
}

export type HomeSpotlightAction = {
  key: ExperienceKey
  label: string
}

export type HomeSectionIntro = {
  eyebrow: string
  title: string
  description: string
}

export type HomeSuggestionCard = {
  id: string
  label?: string
  title: string
  subtitle: string
  description: string
  meta: string
  route: string
  image?: HomeImage
}

export type HomeContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  spotlight: {
    actions: HomeSpotlightAction[]
    entries: Record<ExperienceKey, HomeSpotlightEntry>
  }
  featuredExperiences: {
    intro: HomeSectionIntro
    items: HomeSuggestionCard[]
  }
  diningMoments: {
    intro: HomeSectionIntro
    items: HomeSuggestionCard[]
  }
  weeklyHappenings: {
    intro: HomeSectionIntro
    items: HomeSuggestionCard[]
  }
}

export type EventItem = {
  id: string
  title: string
  dateLabel: string
  venue: string
  category: EventCategory
  startsAt?: string
  endsAt?: string
  route: string
}

export type EventsPagination = {
  hasMore: boolean
  nextCursor: string | null
}

export type EventsContent = {
  eyebrow: string
  title: string
  description: string
  featuredItems: EventItem[]
  items: EventItem[]
  pagination: EventsPagination
}

export type RestaurantItem = {
  id: string
  name: string
  cuisine: string
  vibe: string
  priceBand: '$' | '$$' | '$$$'
  route: string
}

export type RestaurantsContent = {
  eyebrow: string
  title: string
  description: string
  items: RestaurantItem[]
}

export type TourItem = {
  id: string
  name: string
  category: string
  durationHours: number
  priceFrom: number
  route: string
}

export type ToursContent = {
  eyebrow: string
  title: string
  description: string
  items: TourItem[]
}

export type EventDetail = {
  id: string
  title: string
  category: EventCategory
  dateLabel: string
  venue: string
  description: string
  startsAt?: string
  endsAt?: string
  route: string
  image?: HomeImage
}

export type RestaurantDetail = {
  id: string
  name: string
  cuisine: string
  vibe: string
  priceBand: '$' | '$$' | '$$$'
  description: string
  route: string
  image?: HomeImage
}

export type TourDetail = {
  id: string
  name: string
  category: string
  durationHours: number
  priceFrom: number
  description: string
  route: string
  image?: HomeImage
}
