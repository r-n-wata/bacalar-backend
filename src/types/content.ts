export type AppLanguage = 'en' | 'es'

export type EventCategory = 'music' | 'wellness' | 'food'
export type ExperienceKey = 'events' | 'restaurants' | 'tours' | 'booking'

export type HomeSpotlightMetric = {
  label: string
  value: string
}

export type HomeSpotlightEntry = {
  title: string
  description: string
  route: string
  cta: string
  metrics: HomeSpotlightMetric[]
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
  label?: string
  title: string
  description: string
  meta: string
  route: string
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
  planningCallout: HomeSectionIntro & {
    items: string[]
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
  bookingCta: {
    eyebrow: string
    title: string
    description: string
    primaryAction: {
      label: string
      route: string
    }
    secondaryAction: {
      label: string
      route: string
    }
  }
}

export type EventItem = {
  id: string
  title: string
  dateLabel: string
  venue: string
  category: EventCategory
}

export type EventsContent = {
  eyebrow: string
  title: string
  description: string
  items: EventItem[]
}

export type RestaurantItem = {
  id: string
  name: string
  cuisine: string
  vibe: string
  priceBand: '$' | '$$' | '$$$'
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
}

export type ToursContent = {
  eyebrow: string
  title: string
  description: string
  items: TourItem[]
}
