export type AppLanguage = 'en' | 'es'

export type EventCategory = 'music' | 'wellness' | 'food'
export type RestaurantMoment = 'breakfast' | 'lunch' | 'dinner'
export type TourCategory = string
export type TourKey = 'events' | 'restaurants' | 'tours'

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
  key: TourKey
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

export type FeaturedListItemImage = HomeImage

export type ContactInfo = {
  providerName: string
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  mapsUrl?: string
}

export type HomeContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  spotlight: {
    actions: HomeSpotlightAction[]
    entries: Record<TourKey, HomeSpotlightEntry>
  }
  featuredTours: {
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
  description?: string
  category: EventCategory
  startsAt?: string
  endsAt?: string
  route: string
  image?: FeaturedListItemImage
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
  totalCount?: number
  pagination: EventsPagination
}

export type RestaurantItem = {
  id: string
  name: string
  cuisine: string
  vibe: string
  priceBand: '$' | '$$' | '$$$'
  moments: RestaurantMoment[]
  description?: string
  route: string
  image?: FeaturedListItemImage
}

export type RestaurantsPagination = {
  hasMore: boolean
  nextCursor: string | null
}

export type RestaurantsContent = {
  eyebrow: string
  title: string
  description: string
  featuredItems: RestaurantItem[]
  items: RestaurantItem[]
  totalCount?: number
  pagination: RestaurantsPagination
}

export type TourItem = {
  id: string
  name: string
  category: TourCategory
  duration: string
  durationHoursValue?: number
  priceFrom: string
  priceFromValue?: number
  bestFor: string
  description?: string
  operatorName: string
  route: string
  image?: FeaturedListItemImage
}

export type ToursPagination = {
  hasMore: boolean
  nextCursor: string | null
}

export type ToursContent = {
  eyebrow: string
  title: string
  description: string
  categories: TourCategory[]
  durationOptions?: number[]
  featuredItems: TourItem[]
  items: TourItem[]
  totalCount?: number
  pagination: ToursPagination
}

export type EventDetail = {
  id: string
  title: string
  category: EventCategory
  dateLabel: string
  venue: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  description: string
  startsAt?: string
  endsAt?: string
  route: string
  image?: HomeImage
  contact?: ContactInfo
}

export type RestaurantDetail = {
  id: string
  name: string
  cuisine: string
  vibe: string
  priceBand: '$' | '$$' | '$$$'
  moments: RestaurantMoment[]
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  description: string
  route: string
  image?: HomeImage
  contact?: ContactInfo
}

export type TourDetail = {
  id: string
  name: string
  category: TourCategory
  duration: string
  priceFrom: string
  privateOrShared: string
  bestFor: string
  difficulty: string
  suitableForKids: string
  description: string
  included?: string
  includedItems?: string[]
  whatToBring?: string
  meetingPoint?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  imageUrls: string[]
  operatorName: string
  operatorDescription?: string
  operatorWhatsapp?: string
  operatorInstagram?: string
  operatorWebsite?: string
  operatorPrimaryContactMethod?: string
  route: string
  image?: HomeImage
  contact?: ContactInfo
}
