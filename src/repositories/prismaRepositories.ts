import {
  ContentStatus,
  FeatureType,
  HomeSectionKind,
  LocaleCode,
  type PrismaClient,
} from '@prisma/client'
import type {
  AppLanguage,
  ContactInfo,
  EventDetail,
  EventItem,
  FeaturedListItemImage,
  HomeContent,
  HomeSuggestionCard,
  RestaurantDetail,
  RestaurantItem,
  RestaurantMoment,
  RestaurantsContent,
  TourCategory,
  TourDetail,
  TourItem,
  ToursContent,
} from '../types/content'
import type {
  AdminPublishedContentDetail,
  ArchiveAdminPublishedContentResult,
  AdminPublishedContentItem,
  AdminPublishedContentType,
  UpdateAdminPublishedContentInput,
  UpdateAdminPublishedContentFeaturedInput,
} from '../types/admin'
import type {
  ContentRepositories,
  PublishedContentRepository,
} from './interfaces'
import { paginateEvents, selectFeaturedEvents } from './eventsPagination'
import {
  paginateRestaurants,
  selectFeaturedRestaurants,
} from './restaurantsPagination'
import { paginateTours, selectFeaturedTours } from './toursPagination'
import {
  normalizeIncludedItems,
  resolveIncludedItems,
  serializeIncludedItems,
} from '../lib/tourIncludedItems'

const FEATURED_ITEMS_CAP = 5

function getLocaleWhere(language: AppLanguage) {
  return {
    locale: {
      code: language,
    },
  }
}

function assertFeaturePageTranslation<
  T extends { translations: Array<{ eyebrow: string; title: string; description: string }> },
>(page: T | null) {
  if (!page || page.translations.length === 0) {
    return null
  }

  return page.translations[0]
}

type SubmissionImageRecord = {
  url: string
}

type SubmissionWithImages = {
  images: SubmissionImageRecord[]
}

type RestaurantTranslationWithLocale = {
  locale: {
    code: AppLanguage
  }
  name: string
  cuisine: string
  vibe: string
  description?: string | null
}

type TourTranslationWithLocale = {
  locale: {
    code: AppLanguage
  }
  name: string
  description?: string | null
  included?: string | null
  includedItems: string[]
  whatToBring?: string | null
  operatorDescription?: string | null
}

type AdminSubmissionImageRecord = {
  id: string
  source: 'UPLOADED' | 'EXTERNAL_URL'
  url: string
  objectKey?: string
  mimeType?: string
  originalFilename?: string
  sortOrder: number
}

type TranslationByLocale<TTranslation> = {
  en: TTranslation
  es: TTranslation
}

function mapSubmissionImages(
  images:
    | Array<{
        id: string
        source: 'UPLOADED' | 'EXTERNAL_URL'
        url: string
        objectKey: string | null
        mimeType: string | null
        originalFilename: string | null
        sortOrder: number
      }>
    | undefined,
): AdminSubmissionImageRecord[] {
  return (images ?? []).map((image) => ({
    id: image.id,
    source: image.source,
    url: image.url,
    objectKey: image.objectKey ?? undefined,
    mimeType: image.mimeType ?? undefined,
    originalFilename: image.originalFilename ?? undefined,
    sortOrder: image.sortOrder,
  }))
}

function emptyEventTranslation() {
  return {
    title: '',
    dateLabel: '',
    venue: '',
    description: '',
  }
}

function emptyRestaurantTranslation() {
  return {
    name: '',
    cuisine: '',
    vibe: '',
    description: '',
  }
}

function emptyTourTranslation() {
  return {
    name: '',
    description: '',
    included: '',
    includedItems: [] as string[],
    whatToBring: '',
    operatorDescription: '',
  }
}

function mapTranslationsByLocale<TTranslation extends { locale: { code: AppLanguage } }, TOutput>(
  translations: TTranslation[],
  mapValue: (translation: TTranslation) => TOutput,
  createEmpty: () => TOutput,
): TranslationByLocale<TOutput> {
  const mapped: TranslationByLocale<TOutput> = {
    en: createEmpty(),
    es: createEmpty(),
  }

  for (const translation of translations) {
    mapped[translation.locale.code] = mapValue(translation)
  }

  return mapped
}

function parseTourDurationHours(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 1
}

function parseTourPriceFrom(value: string) {
  const match = value.replace(/,/g, '').match(/\d+/)
  return match ? Number(match[0]) : 1
}

function mapLeadImage(
  approvedSubmissions: SubmissionWithImages[] | undefined,
): FeaturedListItemImage | undefined {
  const leadImage = approvedSubmissions?.[0]?.images[0]

  if (!leadImage) {
    return undefined
  }

  return {
    src: leadImage.url,
    alt: '',
  }
}

function withImageAlt(
  image: FeaturedListItemImage | undefined,
  alt: string,
): FeaturedListItemImage | undefined {
  if (!image) {
    return undefined
  }

  return {
    ...image,
    alt,
  }
}

function toOptionalValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

async function getRequiredLocaleIds(
  client: Pick<PrismaClient, 'locale'>,
): Promise<{ en: number; es: number }> {
  const locales = await client.locale.findMany({
    where: {
      code: {
        in: [LocaleCode.en, LocaleCode.es],
      },
    },
    select: {
      id: true,
      code: true,
    },
  })

  const localeIdByCode = locales.reduce<Partial<Record<LocaleCode, number>>>((accumulator, locale) => {
    accumulator[locale.code] = locale.id
    return accumulator
  }, {})

  if (!localeIdByCode.en || !localeIdByCode.es) {
    throw new Error('Missing required locales for published content updates.')
  }

  return {
    en: localeIdByCode.en,
    es: localeIdByCode.es,
  }
}

function createContactInfo(input: ContactInfo): ContactInfo {
  return {
    providerName: input.providerName,
    whatsapp: toOptionalValue(input.whatsapp),
    phone: toOptionalValue(input.phone),
    website: toOptionalValue(input.website),
    instagram: toOptionalValue(input.instagram),
    facebook: toOptionalValue(input.facebook),
    email: toOptionalValue(input.email),
    mapsUrl: toOptionalValue(input.mapsUrl),
  }
}

function mapConfiguredImage(imageUrls: string[] | undefined) {
  const primaryImage = imageUrls?.[0]

  if (!primaryImage) {
    return undefined
  }

  return {
    src: primaryImage,
    alt: '',
  } satisfies FeaturedListItemImage
}

function deriveCardSubtitle(route: string, label: string | null) {
  if (route.startsWith('/tours/')) {
    return 'Lagoon, Bacalar'
  }

  if (route.startsWith('/restaurants/')) {
    return label ?? 'Bacalar dining'
  }

  if (route.startsWith('/events/')) {
    return 'Bacalar this week'
  }

  return label ?? 'Bacalar'
}

function formatRestaurantMoment(moment: RestaurantMoment, language: AppLanguage) {
  if (language === 'es') {
    switch (moment) {
      case 'breakfast':
        return 'Desayuno'
      case 'lunch':
        return 'Comida'
      case 'dinner':
        return 'Cena'
    }
  }

  switch (moment) {
    case 'breakfast':
      return 'Breakfast'
    case 'lunch':
      return 'Lunch'
    case 'dinner':
      return 'Dinner'
  }
}

function formatRestaurantMomentsLabel(
  moments: RestaurantMoment[],
  language: AppLanguage,
) {
  return moments.map((moment) => formatRestaurantMoment(moment, language)).join(' / ')
}

function selectRestaurantTranslation(
  translations: RestaurantTranslationWithLocale[],
  language: AppLanguage,
) {
  return (
    translations.find((translation) => translation.locale.code === language) ??
    translations.find((translation) => translation.locale.code === 'en') ??
    null
  )
}

function selectTourTranslation(
  translations: TourTranslationWithLocale[],
  language: AppLanguage,
) {
  return (
    translations.find((translation) => translation.locale.code === language) ??
    translations.find((translation) => translation.locale.code === 'en') ??
    null
  )
}

function isPresent<T>(value: T | null): value is T {
  return value !== null
}

function toHomeSuggestionCard(
  item: EventItem | RestaurantItem | TourItem,
  language: AppLanguage,
): HomeSuggestionCard {
  if ('title' in item) {
    return {
      id: item.id,
      label: item.dateLabel,
      title: item.title,
      subtitle: item.venue,
      description: item.venue,
      meta: item.startsAt ? new Date(item.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : item.dateLabel,
      route: item.route,
      image: withImageAlt(item.image, item.title),
    }
  }

  if ('cuisine' in item) {
    return {
      id: item.id,
      label: formatRestaurantMomentsLabel(item.moments, language),
      title: item.name,
      subtitle: item.cuisine,
      description: item.vibe,
      meta: `${item.cuisine} - ${item.priceBand}`,
      route: item.route,
      image: withImageAlt(item.image, item.name),
    }
  }

  return {
    id: item.id,
    title: item.name,
    subtitle: item.category,
    description: item.bestFor,
    meta: `${item.duration} - ${item.priceFrom}`,
    route: item.route,
    image: withImageAlt(item.image, item.name),
  }
}

function mapHomeSectionItems(
  items: Array<EventItem | RestaurantItem | TourItem>,
  language: AppLanguage,
): HomeSuggestionCard[] {
  return items.map((item) => toHomeSuggestionCard(item, language))
}

function mapEventItem(event: {
  slug: string
  category: string
  startsAt: Date | null
  endsAt: Date | null
  sortOrder: number
  featuredOrder: number | null
  translations: Array<{ title: string; dateLabel: string; venue: string; description?: string | null }>
  approvedSubmissions?: SubmissionWithImages[]
}): EventItem & { sortOrder: number; featuredOrder?: number | null } {
  const translation = event.translations[0]
  const image = mapLeadImage(event.approvedSubmissions)

  return {
    id: event.slug,
    title: translation.title,
    dateLabel: translation.dateLabel,
    venue: translation.venue,
    description:
      translation.description ??
      `${translation.title} is part of Bacalar's upcoming events.`,
    category: event.category as EventItem['category'],
    startsAt: event.startsAt?.toISOString(),
    endsAt: event.endsAt?.toISOString(),
    route: `/events/${event.slug}`,
    image: withImageAlt(image, translation.title),
    sortOrder: event.sortOrder,
    featuredOrder: event.featuredOrder,
  }
}

function mapRestaurantItem(restaurant: {
  slug: string
  priceBand: string
  moments: RestaurantMoment[]
  sortOrder: number
  featuredOrder: number | null
  translation: { name: string; cuisine: string; vibe: string; description?: string | null }
  approvedSubmissions?: SubmissionWithImages[]
}): RestaurantItem & { sortOrder: number; featuredOrder?: number | null } {
  const translation = restaurant.translation
  const image = mapLeadImage(restaurant.approvedSubmissions)

  return {
    id: restaurant.slug,
    name: translation.name,
    cuisine: translation.cuisine,
    vibe: translation.vibe,
    priceBand: restaurant.priceBand as '$' | '$$' | '$$$',
    moments: restaurant.moments,
    description:
      translation.description ??
      `${translation.name} is one of Bacalar's current dining picks.`,
    route: `/restaurants/${restaurant.slug}`,
    image: withImageAlt(image, translation.name),
    sortOrder: restaurant.sortOrder,
    featuredOrder: restaurant.featuredOrder,
  }
}

function mapTourItem(tour: {
  slug: string
  category: TourCategory
  duration: string
  priceFrom: string
  bestFor: string
  description: string
  operatorName: string
  imageUrls: string[]
  sortOrder: number
  featuredOrder: number | null
  translation: { name: string }
  approvedSubmissions?: SubmissionWithImages[]
}): TourItem & { sortOrder: number; featuredOrder?: number | null } {
  const translation = tour.translation
  const image =
    mapConfiguredImage(tour.imageUrls) ?? mapLeadImage(tour.approvedSubmissions)

  return {
    id: tour.slug,
    name: translation.name,
    category: tour.category as TourCategory,
    duration: tour.duration,
    durationHoursValue: parseTourDurationHours(tour.duration),
    priceFrom: tour.priceFrom,
    priceFromValue: parseTourPriceFrom(tour.priceFrom),
    bestFor: tour.bestFor,
    description: tour.description,
    operatorName: tour.operatorName,
    route: `/tours/${tour.slug}`,
    image: withImageAlt(image, translation.name),
    sortOrder: tour.sortOrder,
    featuredOrder: tour.featuredOrder,
  }
}

function getApprovedSubmissionInclude() {
  return {
    approvedSubmissions: {
      where: {
        status: 'APPROVED' as const,
      },
      orderBy: {
        createdAt: 'asc' as const,
      },
      take: 1,
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc' as const,
          },
          take: 1,
        },
      },
    },
  }
}

function getRestaurantTranslationInclude(_language: AppLanguage) {
  return {
    translations: {
      include: {
        locale: true,
      },
    },
  }
}

function getPublishedContentFeatureModel(type: AdminPublishedContentType) {
  switch (type) {
    case 'events':
      return 'event' as const
    case 'restaurants':
      return 'restaurant' as const
    case 'tours':
      return 'tour' as const
  }
}

async function countFeaturedForType(
  prisma: PrismaClient,
  type: AdminPublishedContentType,
) {
  const model = getPublishedContentFeatureModel(type)

  switch (model) {
    case 'event':
      return prisma.event.count({
        where: { status: ContentStatus.PUBLISHED, isFeatured: true },
      })
    case 'restaurant':
      return prisma.restaurant.count({
        where: { status: ContentStatus.PUBLISHED, isFeatured: true },
      })
    case 'tour':
      return prisma.tour.count({
        where: { status: ContentStatus.PUBLISHED, isFeatured: true },
      })
  }
}

function mapPublishedEventItem(
  item: ReturnType<typeof mapEventItem>,
): AdminPublishedContentItem {
  return {
    id: item.id,
    type: 'events',
    title: item.title,
    route: item.route,
    isFeatured: typeof item.featuredOrder === 'number',
    featuredOrder: item.featuredOrder ?? undefined,
    image: item.image,
    category: item.category,
    subtitle: `${item.dateLabel} - ${item.venue}`,
  }
}

function mapPublishedRestaurantItem(
  item: ReturnType<typeof mapRestaurantItem>,
): AdminPublishedContentItem {
  return {
    id: item.id,
    type: 'restaurants',
    title: item.name,
    route: item.route,
    isFeatured: typeof item.featuredOrder === 'number',
    featuredOrder: item.featuredOrder ?? undefined,
    image: item.image,
    moments: item.moments,
    subtitle: `${item.cuisine} - ${item.priceBand}`,
  }
}

function mapPublishedTourItem(
  item: ReturnType<typeof mapTourItem>,
): AdminPublishedContentItem {
  return {
    id: item.id,
    type: 'tours',
    title: item.name,
    route: item.route,
    isFeatured: typeof item.featuredOrder === 'number',
    featuredOrder: item.featuredOrder ?? undefined,
    image: item.image,
    category: item.category,
    subtitle: `${item.duration} - ${item.priceFrom}`,
  }
}

function mapEventDetailItem(event: {
  slug: string
  status: ContentStatus
  category: 'music' | 'wellness' | 'food'
  isFeatured: boolean
  featuredOrder: number | null
  startsAt: Date | null
  organizerName: string | null
  whatsapp: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  email: string | null
  address: string | null
  mapUrl: string | null
  mapEmbedUrl: string | null
  translations: Array<{
    locale: { code: AppLanguage }
    title: string
    dateLabel: string
    venue: string
    description: string | null
  }>
  approvedSubmissions: Array<{
    images: Array<{
      id: string
      source: 'UPLOADED' | 'EXTERNAL_URL'
      url: string
      objectKey: string | null
      mimeType: string | null
      originalFilename: string | null
      sortOrder: number
    }>
  }>
}): AdminPublishedContentDetail {
  return {
    id: event.slug,
    type: 'events',
    route: `/events/${event.slug}`,
    isFeatured: event.isFeatured,
    featuredOrder: event.featuredOrder ?? undefined,
    status: event.status,
    category: event.category,
    startsAt: event.startsAt?.toISOString() ?? new Date().toISOString(),
    organizerName: event.organizerName ?? undefined,
    whatsapp: event.whatsapp ?? undefined,
    phone: event.phone ?? undefined,
    website: event.website ?? undefined,
    instagram: event.instagram ?? undefined,
    facebook: event.facebook ?? undefined,
    email: event.email ?? undefined,
    address: event.address ?? undefined,
    mapUrl: event.mapUrl ?? undefined,
    mapEmbedUrl: event.mapEmbedUrl ?? undefined,
    media: mapSubmissionImages(event.approvedSubmissions[0]?.images),
    translations: mapTranslationsByLocale(
      event.translations,
      (translation) => ({
        title: translation.title,
        dateLabel: translation.dateLabel,
        venue: translation.venue,
        description: translation.description ?? '',
      }),
      emptyEventTranslation,
    ),
  }
}

async function getPublishedEventDetail(
  prisma: PrismaClient,
  id: string,
): Promise<AdminPublishedContentDetail | null> {
  const item = await prisma.event.findFirst({
    where: { slug: id, status: ContentStatus.PUBLISHED },
    include: {
      translations: { include: { locale: true } },
      approvedSubmissions: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  return item ? mapEventDetailItem(item) : null
}

async function getPublishedRestaurantDetail(
  prisma: PrismaClient,
  id: string,
): Promise<AdminPublishedContentDetail | null> {
  const item = await prisma.restaurant.findFirst({
    where: { slug: id, status: ContentStatus.PUBLISHED },
    include: {
      translations: { include: { locale: true } },
      approvedSubmissions: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  return item ? mapRestaurantDetailItem(item) : null
}

async function getPublishedTourDetail(
  prisma: PrismaClient,
  id: string,
): Promise<AdminPublishedContentDetail | null> {
  const item = await prisma.tour.findFirst({
    where: { slug: id, status: ContentStatus.PUBLISHED },
    include: {
      translations: { include: { locale: true } },
    },
  })

  return item ? mapTourDetailItem(item) : null
}

function mapRestaurantDetailItem(restaurant: {
  slug: string
  status: ContentStatus
  isFeatured: boolean
  featuredOrder: number | null
  priceBand: string
  moments: RestaurantMoment[]
  whatsapp: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  email: string | null
  address: string | null
  mapUrl: string | null
  mapEmbedUrl: string | null
  translations: RestaurantTranslationWithLocale[]
  approvedSubmissions: Array<{
    images: Array<{
      id: string
      source: 'UPLOADED' | 'EXTERNAL_URL'
      url: string
      objectKey: string | null
      mimeType: string | null
      originalFilename: string | null
      sortOrder: number
    }>
  }>
}): AdminPublishedContentDetail {
  return {
    id: restaurant.slug,
    type: 'restaurants',
    route: `/restaurants/${restaurant.slug}`,
    isFeatured: restaurant.isFeatured,
    featuredOrder: restaurant.featuredOrder ?? undefined,
    status: restaurant.status,
    priceBand: restaurant.priceBand as '$' | '$$' | '$$$',
    moments: restaurant.moments,
    whatsapp: restaurant.whatsapp ?? undefined,
    phone: restaurant.phone ?? undefined,
    website: restaurant.website ?? undefined,
    instagram: restaurant.instagram ?? undefined,
    facebook: restaurant.facebook ?? undefined,
    email: restaurant.email ?? undefined,
    address: restaurant.address ?? undefined,
    mapUrl: restaurant.mapUrl ?? undefined,
    mapEmbedUrl: restaurant.mapEmbedUrl ?? undefined,
    media: mapSubmissionImages(restaurant.approvedSubmissions[0]?.images),
    translations: mapTranslationsByLocale(
      restaurant.translations,
      (translation) => ({
        name: translation.name,
        cuisine: translation.cuisine,
        vibe: translation.vibe,
        description: translation.description ?? '',
      }),
      emptyRestaurantTranslation,
    ),
  }
}

function mapTourDetailItem(tour: {
  slug: string
  status: ContentStatus
  isFeatured: boolean
  featuredOrder: number | null
  category: TourCategory
  duration: string
  priceFrom: string
  privateOrShared: string
  bestFor: string
  difficulty: string
  suitableForKids: string
  meetingPoint: string | null
  providerName: string | null
  whatsapp: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  email: string | null
  address: string | null
  mapUrl: string | null
  mapEmbedUrl: string | null
  operatorName: string
  operatorWhatsapp: string | null
  operatorInstagram: string | null
  operatorWebsite: string | null
  operatorPrimaryContactMethod: string | null
  imageUrls: string[]
  translations: TourTranslationWithLocale[]
}): AdminPublishedContentDetail {
  return {
    id: tour.slug,
    type: 'tours',
    route: `/tours/${tour.slug}`,
    isFeatured: tour.isFeatured,
    featuredOrder: tour.featuredOrder ?? undefined,
    status: tour.status,
    category: tour.category,
    durationHours: parseTourDurationHours(tour.duration),
    priceFrom: parseTourPriceFrom(tour.priceFrom),
    privateOrShared: tour.privateOrShared,
    bestFor: tour.bestFor,
    difficulty: tour.difficulty,
    suitableForKids: tour.suitableForKids,
    meetingPoint: tour.meetingPoint ?? undefined,
    providerName: tour.providerName ?? undefined,
    whatsapp: tour.whatsapp ?? undefined,
    phone: tour.phone ?? undefined,
    website: tour.website ?? undefined,
    instagram: tour.instagram ?? undefined,
    facebook: tour.facebook ?? undefined,
    email: tour.email ?? undefined,
    address: tour.address ?? undefined,
    mapUrl: tour.mapUrl ?? undefined,
    mapEmbedUrl: tour.mapEmbedUrl ?? undefined,
    operatorName: tour.operatorName,
    operatorWhatsapp: tour.operatorWhatsapp ?? undefined,
    operatorInstagram: tour.operatorInstagram ?? undefined,
    operatorWebsite: tour.operatorWebsite ?? undefined,
    operatorPrimaryContactMethod: tour.operatorPrimaryContactMethod ?? undefined,
    media: tour.imageUrls.map((url, index) => ({
      id: `tour-image-${index}`,
      source: 'EXTERNAL_URL',
      url,
      sortOrder: index,
    })),
    translations: mapTranslationsByLocale(
      tour.translations,
      (translation) => ({
        name: translation.name,
        description: translation.description ?? '',
        included: translation.included ?? '',
        includedItems: resolveIncludedItems(
          translation.includedItems,
          translation.included,
        ),
        whatToBring: translation.whatToBring ?? '',
        operatorDescription: translation.operatorDescription ?? '',
      }),
      emptyTourTranslation,
    ),
  }
}

async function replaceEventSubmissionImages(
  prisma: PrismaClient,
  submissionId: string,
  media: UpdateAdminPublishedContentInput['media'],
) {
  await prisma.eventSubmissionImage.deleteMany({
    where: { submissionId },
  })

  if (media.length === 0) {
    return
  }

  await prisma.eventSubmissionImage.createMany({
    data: media.map((item, index) => ({
      submissionId,
      source: item.kind === 'uploaded' ? 'UPLOADED' : 'EXTERNAL_URL',
      url: item.url,
      objectKey: item.kind === 'uploaded' ? item.objectKey : null,
      mimeType: item.kind === 'uploaded' ? item.mimeType : null,
      originalFilename: item.kind === 'uploaded' ? item.filename : null,
      sortOrder: index,
    })),
  })
}

async function replaceRestaurantSubmissionImages(
  prisma: PrismaClient,
  submissionId: string,
  media: UpdateAdminPublishedContentInput['media'],
) {
  await prisma.restaurantSubmissionImage.deleteMany({
    where: { submissionId },
  })

  if (media.length === 0) {
    return
  }

  await prisma.restaurantSubmissionImage.createMany({
    data: media.map((item, index) => ({
      submissionId,
      source: item.kind === 'uploaded' ? 'UPLOADED' : 'EXTERNAL_URL',
      url: item.url,
      objectKey: item.kind === 'uploaded' ? item.objectKey : null,
      mimeType: item.kind === 'uploaded' ? item.mimeType : null,
      originalFilename: item.kind === 'uploaded' ? item.filename : null,
      sortOrder: index,
    })),
  })
}

async function replaceTourSubmissionImages(
  prisma: PrismaClient,
  submissionId: string,
  media: UpdateAdminPublishedContentInput['media'],
) {
  await prisma.tourSubmissionImage.deleteMany({
    where: { submissionId },
  })

  if (media.length === 0) {
    return
  }

  await prisma.tourSubmissionImage.createMany({
    data: media.map((item, index) => ({
      submissionId,
      source: item.kind === 'uploaded' ? 'UPLOADED' : 'EXTERNAL_URL',
      url: item.url,
      objectKey: item.kind === 'uploaded' ? item.objectKey : null,
      mimeType: item.kind === 'uploaded' ? item.mimeType : null,
      originalFilename: item.kind === 'uploaded' ? item.filename : null,
      sortOrder: index,
    })),
  })
}

export function createPrismaRepositories(
  prisma: PrismaClient,
): ContentRepositories {
  return {
    home: {
      async getHomeContent(language): Promise<HomeContent | null> {
        const homePage = await prisma.homePage.findFirst({
          where: {
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
            spotlightEntries: {
              orderBy: {
                sortOrder: 'asc',
              },
              include: {
                translations: {
                  where: getLocaleWhere(language),
                  include: {
                    metrics: {
                      orderBy: {
                        sortOrder: 'asc',
                      },
                    },
                  },
                },
              },
            },
            sections: {
              orderBy: {
                sortOrder: 'asc',
              },
              include: {
                translations: {
                  where: getLocaleWhere(language),
                },
              },
            },
          },
        })

        if (!homePage || homePage.translations.length === 0) {
          return null
        }

        const translation = homePage.translations[0]
        const spotlightActions = homePage.spotlightEntries
          .filter((entry) => entry.translations.length > 0)
          .map((entry) => ({
            key: entry.key.toLowerCase(),
            label: entry.translations[0].actionLabel,
          })) as HomeContent['spotlight']['actions']

        const spotlightEntries = Object.fromEntries(
          homePage.spotlightEntries
            .filter((entry) => entry.translations.length > 0)
            .map((entry) => [
              entry.key.toLowerCase(),
              {
                title: entry.translations[0].title,
                description: entry.translations[0].description,
                route: entry.route,
                cta: entry.translations[0].ctaLabel,
                metrics: entry.translations[0].metrics.map((metric) => ({
                  label: metric.label,
                  value: metric.value,
                })),
              },
            ]),
        ) as HomeContent['spotlight']['entries']

        const featuredSection = homePage.sections.find(
          (section) => section.kind === HomeSectionKind.FEATURED_TOURS,
        )
        const diningSection = homePage.sections.find(
          (section) => section.kind === HomeSectionKind.DINING_MOMENTS,
        )
        const weeklySection = homePage.sections.find(
          (section) => section.kind === HomeSectionKind.WEEKLY_HAPPENINGS,
        )

        const [featuredTours, featuredRestaurants, featuredEvents] =
          await Promise.all([
            prisma.tour.findMany({
              where: { status: ContentStatus.PUBLISHED, isFeatured: true },
              orderBy: [{ featuredOrder: 'asc' }, { sortOrder: 'asc' }, { slug: 'asc' }],
              include: {
                translations: { include: { locale: true } },
                ...getApprovedSubmissionInclude(),
              },
            }),
            prisma.restaurant.findMany({
              where: { status: ContentStatus.PUBLISHED, isFeatured: true },
              orderBy: [{ featuredOrder: 'asc' }, { sortOrder: 'asc' }, { slug: 'asc' }],
              include: {
                ...getRestaurantTranslationInclude(language),
                ...getApprovedSubmissionInclude(),
              },
            }),
            prisma.event.findMany({
              where: { status: ContentStatus.PUBLISHED, isFeatured: true },
              orderBy: [{ featuredOrder: 'asc' }, { startsAt: 'asc' }, { sortOrder: 'asc' }, { slug: 'asc' }],
              include: {
                translations: { where: getLocaleWhere(language) },
                ...getApprovedSubmissionInclude(),
              },
            }),
          ])

        if (
          !featuredSection ||
          !diningSection ||
          !weeklySection ||
          featuredSection.translations.length === 0 ||
          diningSection.translations.length === 0 ||
          weeklySection.translations.length === 0 ||
          spotlightActions.length === 0
        ) {
          return null
        }

        return {
          hero: {
            eyebrow: translation.heroEyebrow,
            title: translation.heroTitle,
            description: translation.heroDescription,
          },
          spotlight: {
            actions: spotlightActions,
            entries: spotlightEntries,
          },
          featuredTours: {
            intro: {
              eyebrow: featuredSection.translations[0].eyebrow,
              title: featuredSection.translations[0].title,
              description: featuredSection.translations[0].description,
            },
            items: mapHomeSectionItems(
              selectFeaturedTours(
                featuredTours
                  .map((tour) => {
                    const translation = selectTourTranslation(
                      tour.translations,
                      language,
                    )

                    return translation
                      ? mapTourItem({
                          slug: tour.slug,
                          category: tour.category as TourCategory,
                          duration: tour.duration,
                          priceFrom: tour.priceFrom,
                          bestFor: tour.bestFor,
                          operatorName: tour.operatorName,
                          imageUrls: tour.imageUrls,
                          sortOrder: tour.sortOrder,
                          featuredOrder: tour.featuredOrder,
                          translation,
                          approvedSubmissions: tour.approvedSubmissions,
                        })
                      : null
                  })
                  .filter(isPresent),
                FEATURED_ITEMS_CAP,
              ),
              language,
            ),
          },
          diningMoments: {
            intro: {
              eyebrow: diningSection.translations[0].eyebrow,
              title: diningSection.translations[0].title,
              description: diningSection.translations[0].description,
            },
            items: mapHomeSectionItems(
              selectFeaturedRestaurants(
                featuredRestaurants
                  .map((restaurant) => {
                    const translation = selectRestaurantTranslation(
                      restaurant.translations,
                      language,
                    )

                    return translation
                      ? mapRestaurantItem({
                          ...restaurant,
                          translation,
                        })
                      : null
                  })
                  .filter(isPresent),
                FEATURED_ITEMS_CAP,
              ),
              language,
            ),
          },
          weeklyHappenings: {
            intro: {
              eyebrow: weeklySection.translations[0].eyebrow,
              title: weeklySection.translations[0].title,
              description: weeklySection.translations[0].description,
            },
            items: mapHomeSectionItems(
              selectFeaturedEvents(
                featuredEvents
                  .filter((event) => event.translations.length > 0)
                  .map(mapEventItem),
                FEATURED_ITEMS_CAP,
              ),
              language,
            ),
          },
        }
      },
    },
    events: {
      async getEventsContent(language, pagination) {
        const page = await prisma.featurePage.findUnique({
          where: {
            feature: FeatureType.EVENTS,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
          },
        })

        const intro = assertFeaturePageTranslation(page)

        if (!intro) {
          return null
        }

        const [listEvents, featuredEvents] = await Promise.all([
          prisma.event.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
              isFeatured: false,
              ...(pagination.category ? { category: pagination.category } : {}),
            },
            include: {
              translations: {
                where: getLocaleWhere(language),
              },
              ...getApprovedSubmissionInclude(),
            },
          }),
          prisma.event.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
              isFeatured: true,
            },
            include: {
              translations: {
                where: getLocaleWhere(language),
              },
              ...getApprovedSubmissionInclude(),
            },
          }),
        ])

        const eventItems = listEvents
          .filter((event) => event.translations.length > 0)
          .map(mapEventItem)
        const searchTerm = pagination.search?.trim().toLowerCase()
        const filteredEvents = eventItems.filter((event) => {
          if (!searchTerm) {
            return true
          }

          const haystack = [
            event.title,
            event.venue,
            event.category,
            event.dateLabel,
            event.description,
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(searchTerm)
        })
        const paginatedEvents = paginateEvents(filteredEvents, pagination)

        const featuredItems = selectFeaturedEvents(
          featuredEvents
            .filter((event) => event.translations.length > 0)
            .map(mapEventItem),
          FEATURED_ITEMS_CAP,
        )

        return {
          eyebrow: intro.eyebrow,
          title: intro.title,
          description: intro.description,
          featuredItems,
          items: paginatedEvents.items,
          totalCount: filteredEvents.length,
          pagination: paginatedEvents.pagination,
        }
      },
      async getEventDetail(id, language): Promise<EventDetail | null> {
        const event = await prisma.event.findFirst({
          where: {
            slug: id,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
            ...getApprovedSubmissionInclude(),
          },
        })

        if (!event || event.translations.length === 0) {
          return null
        }

        const translation = event.translations[0]

        return {
          id: event.slug,
          title: translation.title,
          category: event.category,
          dateLabel: translation.dateLabel,
          venue: translation.venue,
          address: event.address ?? undefined,
          mapUrl: event.mapUrl ?? undefined,
          mapEmbedUrl: event.mapEmbedUrl ?? undefined,
          description:
            translation.description ??
            `${translation.title} in ${translation.venue} during ${translation.dateLabel}.`,
          startsAt: event.startsAt?.toISOString(),
          endsAt: event.endsAt?.toISOString(),
          contact: createContactInfo({
            providerName:
              toOptionalValue(event.organizerName) ?? translation.venue,
            whatsapp: event.whatsapp ?? undefined,
            phone: event.phone ?? undefined,
            website: event.website ?? undefined,
            instagram: event.instagram ?? undefined,
            facebook: event.facebook ?? undefined,
            email: event.email ?? undefined,
            mapsUrl: event.mapUrl ?? undefined,
          }),
          route: `/events/${event.slug}`,
          image: withImageAlt(
            mapLeadImage(event.approvedSubmissions),
            translation.title,
          ),
        }
      },
    },
    restaurants: {
      async getRestaurantsContent(
        language,
        pagination,
      ): Promise<RestaurantsContent | null> {
        const page = await prisma.featurePage.findUnique({
          where: {
            feature: FeatureType.RESTAURANTS,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
          },
        })

        const intro = assertFeaturePageTranslation(page)

        if (!intro) {
          return null
        }

        const [listRestaurants, featuredRestaurants] = await Promise.all([
          prisma.restaurant.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
              isFeatured: false,
              ...(pagination.category
                ? { moments: { has: pagination.category } }
                : {}),
            },
            include: {
              ...getRestaurantTranslationInclude(language),
              ...getApprovedSubmissionInclude(),
            },
          }),
          prisma.restaurant.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
              isFeatured: true,
            },
            include: {
              ...getRestaurantTranslationInclude(language),
              ...getApprovedSubmissionInclude(),
            },
          }),
        ])

        const restaurantItems = listRestaurants
          .map((restaurant) => {
            const translation = selectRestaurantTranslation(
              restaurant.translations,
              language,
            )

            return translation
              ? mapRestaurantItem({
                  ...restaurant,
                  translation,
                })
              : null
          })
          .filter(isPresent)
        const featuredRestaurantItems = featuredRestaurants
          .map((restaurant) => {
            const translation = selectRestaurantTranslation(
              restaurant.translations,
              language,
            )

            return translation
              ? mapRestaurantItem({
                  ...restaurant,
                  translation,
                })
              : null
          })
          .filter(isPresent)

        const searchTerm = pagination.search?.trim().toLowerCase()
        const filteredRestaurants = restaurantItems.filter((restaurant) => {
          if (pagination.priceBand && restaurant.priceBand !== pagination.priceBand) {
            return false
          }

          if (!searchTerm) {
            return true
          }

          const haystack = [
            restaurant.name,
            restaurant.cuisine,
            restaurant.vibe,
            restaurant.description,
            restaurant.moments.join(' '),
            restaurant.priceBand,
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(searchTerm)
        })
        const paginatedRestaurants = paginateRestaurants(
          filteredRestaurants,
          pagination,
        )

        return {
          eyebrow: intro.eyebrow,
          title: intro.title,
          description: intro.description,
          featuredItems: selectFeaturedRestaurants(
            featuredRestaurantItems,
            FEATURED_ITEMS_CAP,
          ),
          items: paginatedRestaurants.items,
          totalCount: filteredRestaurants.length,
          pagination: paginatedRestaurants.pagination,
        }
      },
      async getRestaurantDetail(
        id,
        language,
      ): Promise<RestaurantDetail | null> {
        const restaurant = await prisma.restaurant.findFirst({
          where: {
            slug: id,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            ...getRestaurantTranslationInclude(language),
            ...getApprovedSubmissionInclude(),
          },
        })

        if (!restaurant) {
          return null
        }

        const translation = selectRestaurantTranslation(
          restaurant.translations,
          language,
        )

        if (!translation) {
          return null
        }

        return {
          id: restaurant.slug,
          name: translation.name,
          cuisine: translation.cuisine,
          vibe: translation.vibe,
          priceBand: restaurant.priceBand as '$' | '$$' | '$$$',
          moments: restaurant.moments as RestaurantMoment[],
          address: restaurant.address ?? undefined,
          mapUrl: restaurant.mapUrl ?? undefined,
          mapEmbedUrl: restaurant.mapEmbedUrl ?? undefined,
          description:
            translation.description ??
            `${translation.name} offers a ${translation.vibe.toLowerCase()} tour.`,
          contact: createContactInfo({
            providerName: translation.name,
            whatsapp: restaurant.whatsapp ?? undefined,
            phone: restaurant.phone ?? undefined,
            website: restaurant.website ?? undefined,
            instagram: restaurant.instagram ?? undefined,
            facebook: restaurant.facebook ?? undefined,
            email: restaurant.email ?? undefined,
            mapsUrl: restaurant.mapUrl ?? undefined,
          }),
          route: `/restaurants/${restaurant.slug}`,
          image: withImageAlt(
            mapLeadImage(restaurant.approvedSubmissions),
            translation.name,
          ),
        }
      },
    },
    tours: {
      async getToursContent(language, pagination): Promise<ToursContent | null> {
        const page = await prisma.featurePage.findUnique({
          where: {
            feature: FeatureType.TOURS,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
          },
        })

        const intro = assertFeaturePageTranslation(page)

        if (!intro) {
          return null
        }

        const [tours, featuredTours] = await Promise.all([
          prisma.tour.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
              isFeatured: false,
            },
            orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
            include: {
              translations: { include: { locale: true } },
              ...getApprovedSubmissionInclude(),
            },
          }),
          prisma.tour.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
              isFeatured: true,
            },
            orderBy: [{ featuredOrder: 'asc' }, { sortOrder: 'asc' }, { slug: 'asc' }],
            include: {
              translations: { include: { locale: true } },
              ...getApprovedSubmissionInclude(),
            },
          }),
        ])

        const tourItems = tours
          .map((tour) => {
            const translation = selectTourTranslation(tour.translations, language)

            if (!translation) {
              return null
            }

            return mapTourItem({
              slug: tour.slug,
              category: tour.category as TourCategory,
              duration: tour.duration,
              priceFrom: tour.priceFrom,
              bestFor: tour.bestFor,
              description:
                translation.description ??
                `${translation.name} is one of Bacalar's curated tours.`,
              operatorName: tour.operatorName,
              imageUrls: tour.imageUrls,
              sortOrder: tour.sortOrder,
              featuredOrder: tour.featuredOrder,
              translation,
              approvedSubmissions: tour.approvedSubmissions,
            })
          })
          .filter(isPresent)

        const featuredTourItems = featuredTours
          .map((tour) => {
            const translation = selectTourTranslation(tour.translations, language)

            if (!translation) {
              return null
            }

            return mapTourItem({
              slug: tour.slug,
              category: tour.category as TourCategory,
              duration: tour.duration,
              priceFrom: tour.priceFrom,
              bestFor: tour.bestFor,
              description:
                translation.description ??
                `${translation.name} is one of Bacalar's curated tours.`,
              operatorName: tour.operatorName,
              imageUrls: tour.imageUrls,
              sortOrder: tour.sortOrder,
              featuredOrder: tour.featuredOrder,
              translation,
              approvedSubmissions: tour.approvedSubmissions,
            })
          })
          .filter(isPresent)

        const searchTerm = pagination.search?.trim().toLowerCase()
        const filteredTourItems = tourItems.filter((tour) => {
          if (pagination.category && tour.category !== pagination.category) {
            return false
          }

          if (
            typeof pagination.priceMin === 'number' &&
            tour.priceFromValue < pagination.priceMin
          ) {
            return false
          }

          if (
            typeof pagination.priceMax === 'number' &&
            tour.priceFromValue > pagination.priceMax
          ) {
            return false
          }

          if (
            pagination.durationHours &&
            pagination.durationHours.length > 0 &&
            !pagination.durationHours.includes(tour.durationHoursValue)
          ) {
            return false
          }

          if (!searchTerm) {
            return true
          }

          const haystack = [
            tour.name,
            tour.operatorName,
            tour.category,
            tour.bestFor,
            tour.description,
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(searchTerm)
        })
        const paginatedTours = paginateTours(filteredTourItems, pagination)
        const categories = [...new Set(tourItems.map((item) => item.category))].sort(
          (left, right) => left.localeCompare(right),
        )

        return {
          eyebrow: intro.eyebrow,
          title: intro.title,
          description: intro.description,
          categories,
          durationOptions: [
            ...new Set(tourItems.map((item) => item.durationHoursValue)),
          ].sort((left, right) => left - right),
          featuredItems: selectFeaturedTours(featuredTourItems, FEATURED_ITEMS_CAP),
          items: paginatedTours.items,
          totalCount: filteredTourItems.length,
          pagination: paginatedTours.pagination,
        }
      },
      async getTourDetail(id, language): Promise<TourDetail | null> {
        const tour = await prisma.tour.findFirst({
          where: {
            slug: id,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: { include: { locale: true } },
            ...getApprovedSubmissionInclude(),
          },
        })

        if (!tour) {
          return null
        }

        const translation = selectTourTranslation(tour.translations, language)

        if (!translation) {
          return null
        }

        return {
          id: tour.slug,
          name: translation.name,
          category: tour.category as TourCategory,
          duration: tour.duration,
          priceFrom: tour.priceFrom,
          privateOrShared: tour.privateOrShared,
          bestFor: tour.bestFor,
          difficulty: tour.difficulty,
          suitableForKids: tour.suitableForKids,
          description:
            translation.description ??
            `${translation.name} is one of Bacalar's curated tours.`,
          included: translation.included ?? undefined,
          includedItems: resolveIncludedItems(
            translation.includedItems,
            translation.included,
          ),
          whatToBring: translation.whatToBring ?? undefined,
          meetingPoint: tour.meetingPoint ?? undefined,
          address: tour.address ?? undefined,
          mapUrl: tour.mapUrl ?? undefined,
          mapEmbedUrl: tour.mapEmbedUrl ?? undefined,
          imageUrls: tour.imageUrls,
          operatorName: tour.operatorName,
          operatorDescription: translation.operatorDescription ?? undefined,
          operatorWhatsapp: tour.operatorWhatsapp ?? undefined,
          operatorInstagram: tour.operatorInstagram ?? undefined,
          operatorWebsite: tour.operatorWebsite ?? undefined,
          operatorPrimaryContactMethod:
            tour.operatorPrimaryContactMethod ?? undefined,
          contact: createContactInfo({
            providerName:
              toOptionalValue(tour.providerName) ?? tour.operatorName,
            whatsapp: tour.whatsapp ?? tour.operatorWhatsapp ?? undefined,
            phone: tour.phone ?? undefined,
            website: tour.website ?? tour.operatorWebsite ?? undefined,
            instagram: tour.instagram ?? tour.operatorInstagram ?? undefined,
            facebook: tour.facebook ?? undefined,
            email: tour.email ?? undefined,
            mapsUrl: tour.mapUrl ?? undefined,
          }),
          route: `/tours/${tour.slug}`,
          image: withImageAlt(
            mapConfiguredImage(tour.imageUrls) ??
              mapLeadImage(tour.approvedSubmissions),
            translation.name,
          ),
        }
      },
    },
  }
}

export function createPrismaPublishedContentRepository(
  prisma: PrismaClient,
): PublishedContentRepository {
  return {
    async listPublishedContent(type, language) {
      switch (type) {
        case 'events': {
          const items = await prisma.event.findMany({
            where: { status: ContentStatus.PUBLISHED },
            orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
            include: {
              translations: { where: getLocaleWhere(language) },
              ...getApprovedSubmissionInclude(),
            },
          })

          return items
            .filter((item) => item.translations.length > 0)
            .map(mapEventItem)
            .map(mapPublishedEventItem)
        }
        case 'restaurants': {
          const items = await prisma.restaurant.findMany({
            where: { status: ContentStatus.PUBLISHED },
            orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
            include: {
              ...getRestaurantTranslationInclude(language),
              ...getApprovedSubmissionInclude(),
            },
          })

          return items
            .map((item) => {
              const translation = selectRestaurantTranslation(
                item.translations,
                language,
              )

              return translation
                ? mapRestaurantItem({
                    ...item,
                    translation,
                  })
                : null
            })
            .filter(isPresent)
            .map(mapPublishedRestaurantItem)
        }
        case 'tours': {
          const items = await prisma.tour.findMany({
            where: { status: ContentStatus.PUBLISHED },
            orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
            include: {
              translations: { include: { locale: true } },
              ...getApprovedSubmissionInclude(),
            },
          })

          return items
            .map((item) => {
              const translation = selectTourTranslation(item.translations, language)

              return translation
                ? mapTourItem({
                    slug: item.slug,
                    category: item.category as TourCategory,
                    duration: item.duration,
                    priceFrom: item.priceFrom,
                    bestFor: item.bestFor,
                    operatorName: item.operatorName,
                    imageUrls: item.imageUrls,
                    sortOrder: item.sortOrder,
                    featuredOrder: item.featuredOrder,
                    translation,
                    approvedSubmissions: item.approvedSubmissions,
                  })
                : null
            })
            .filter(isPresent)
            .map(mapPublishedTourItem)
        }
      }
    },
    async getPublishedContentDetail(type, id) {
      switch (type) {
        case 'events': {
          return getPublishedEventDetail(prisma, id)
        }
        case 'restaurants': {
          return getPublishedRestaurantDetail(prisma, id)
        }
        case 'tours': {
          return getPublishedTourDetail(prisma, id)
        }
      }
    },
    async updatePublishedContent(input) {
      switch (input.type) {
        case 'events': {
          const current = await prisma.event.findFirst({
            where: { slug: input.id, status: ContentStatus.PUBLISHED },
            include: {
              approvedSubmissions: {
                where: { status: 'APPROVED' },
                orderBy: { createdAt: 'asc' },
                take: 1,
                include: {
                  images: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          })

          if (!current) {
            return null
          }

          await prisma.$transaction(async (transaction) => {
            const localeIds = await getRequiredLocaleIds(transaction as PrismaClient)

            await transaction.event.update({
              where: { id: current.id },
              data: {
                category: input.category,
                startsAt: new Date(input.startsAt),
                organizerName: input.organizerName,
                whatsapp: input.whatsapp,
                phone: input.phone,
                website: input.website,
                instagram: input.instagram,
                facebook: input.facebook,
                email: input.email,
                address: input.address,
                mapUrl: input.mapUrl,
                mapEmbedUrl: input.mapEmbedUrl,
                updatedBy: input.updatedBy,
                translations: {
                  upsert: [
                    {
                      where: {
                        eventId_localeId: {
                          eventId: current.id,
                          localeId: localeIds.en,
                        },
                      },
                      update: {
                        title: input.translations.en.title,
                        dateLabel: input.translations.en.dateLabel,
                        venue: input.translations.en.venue,
                        description: input.translations.en.description,
                      },
                      create: {
                        localeId: localeIds.en,
                        title: input.translations.en.title,
                        dateLabel: input.translations.en.dateLabel,
                        venue: input.translations.en.venue,
                        description: input.translations.en.description,
                      },
                    },
                    {
                      where: {
                        eventId_localeId: {
                          eventId: current.id,
                          localeId: localeIds.es,
                        },
                      },
                      update: {
                        title: input.translations.es.title,
                        dateLabel: input.translations.es.dateLabel,
                        venue: input.translations.es.venue,
                        description: input.translations.es.description,
                      },
                      create: {
                        localeId: localeIds.es,
                        title: input.translations.es.title,
                        dateLabel: input.translations.es.dateLabel,
                        venue: input.translations.es.venue,
                        description: input.translations.es.description,
                      },
                    },
                  ],
                },
              },
            })

            const submissionId = current.approvedSubmissions[0]?.id

            if (submissionId) {
              await replaceEventSubmissionImages(transaction as PrismaClient, submissionId, input.media)
            }
          })

          return getPublishedEventDetail(prisma, input.id)
        }
        case 'restaurants': {
          const current = await prisma.restaurant.findFirst({
            where: { slug: input.id, status: ContentStatus.PUBLISHED },
            include: {
              approvedSubmissions: {
                where: { status: 'APPROVED' },
                orderBy: { createdAt: 'asc' },
                take: 1,
                include: {
                  images: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          })

          if (!current) {
            return null
          }

          await prisma.$transaction(async (transaction) => {
            const localeIds = await getRequiredLocaleIds(transaction as PrismaClient)

            await transaction.restaurant.update({
              where: { id: current.id },
              data: {
                priceBand: input.priceBand,
                moments: input.moments,
                whatsapp: input.whatsapp,
                phone: input.phone,
                website: input.website,
                instagram: input.instagram,
                facebook: input.facebook,
                email: input.email,
                address: input.address,
                mapUrl: input.mapUrl,
                mapEmbedUrl: input.mapEmbedUrl,
                updatedBy: input.updatedBy,
                translations: {
                  upsert: [
                    {
                      where: {
                        restaurantId_localeId: {
                          restaurantId: current.id,
                          localeId: localeIds.en,
                        },
                      },
                      update: {
                        name: input.translations.en.name,
                        cuisine: input.translations.en.cuisine,
                        vibe: input.translations.en.vibe,
                        description: input.translations.en.description,
                      },
                      create: {
                        localeId: localeIds.en,
                        name: input.translations.en.name,
                        cuisine: input.translations.en.cuisine,
                        vibe: input.translations.en.vibe,
                        description: input.translations.en.description,
                      },
                    },
                    {
                      where: {
                        restaurantId_localeId: {
                          restaurantId: current.id,
                          localeId: localeIds.es,
                        },
                      },
                      update: {
                        name: input.translations.es.name,
                        cuisine: input.translations.es.cuisine,
                        vibe: input.translations.es.vibe,
                        description: input.translations.es.description,
                      },
                      create: {
                        localeId: localeIds.es,
                        name: input.translations.es.name,
                        cuisine: input.translations.es.cuisine,
                        vibe: input.translations.es.vibe,
                        description: input.translations.es.description,
                      },
                    },
                  ],
                },
              },
            })

            const submissionId = current.approvedSubmissions[0]?.id

            if (submissionId) {
              await replaceRestaurantSubmissionImages(
                transaction as PrismaClient,
                submissionId,
                input.media,
              )
            }
          })

          return getPublishedRestaurantDetail(prisma, input.id)
        }
        case 'tours': {
          const current = await prisma.tour.findFirst({
            where: { slug: input.id, status: ContentStatus.PUBLISHED },
            include: {
              approvedSubmissions: {
                where: { status: 'APPROVED' },
                orderBy: { createdAt: 'asc' },
                take: 1,
              },
            },
          })

          if (!current) {
            return null
          }

          await prisma.$transaction(async (transaction) => {
            const localeIds = await getRequiredLocaleIds(transaction as PrismaClient)

            await transaction.tour.update({
              where: { id: current.id },
              data: {
                category: input.category,
                duration: `${input.durationHours} hours`,
                priceFrom: `From ${input.priceFrom} MXN`,
                privateOrShared: input.privateOrShared,
                bestFor: input.bestFor,
                difficulty: input.difficulty,
                suitableForKids: input.suitableForKids,
                meetingPoint: input.meetingPoint,
                providerName: input.providerName,
                whatsapp: input.whatsapp,
                phone: input.phone,
                website: input.website,
                instagram: input.instagram,
                facebook: input.facebook,
                email: input.email,
                address: input.address,
                mapUrl: input.mapUrl,
                mapEmbedUrl: input.mapEmbedUrl,
                operatorName: input.operatorName,
                operatorWhatsapp: input.operatorWhatsapp,
                operatorInstagram: input.operatorInstagram,
                operatorWebsite: input.operatorWebsite,
                operatorPrimaryContactMethod: input.operatorPrimaryContactMethod,
                imageUrls: input.media.map((item) => item.url),
                updatedBy: input.updatedBy,
                translations: {
                  upsert: [
                    {
                      where: {
                        tourId_localeId: {
                          tourId: current.id,
                          localeId: localeIds.en,
                        },
                      },
                      update: {
                        name: input.translations.en.name,
                        description: input.translations.en.description,
                        included: serializeIncludedItems(
                          input.translations.en.includedItems,
                        ),
                        includedItems:
                          normalizeIncludedItems(input.translations.en.includedItems),
                        whatToBring: input.translations.en.whatToBring,
                        operatorDescription: input.translations.en.operatorDescription,
                      },
                      create: {
                        localeId: localeIds.en,
                        name: input.translations.en.name,
                        description: input.translations.en.description,
                        included: serializeIncludedItems(
                          input.translations.en.includedItems,
                        ),
                        includedItems:
                          normalizeIncludedItems(input.translations.en.includedItems),
                        whatToBring: input.translations.en.whatToBring,
                        operatorDescription: input.translations.en.operatorDescription,
                      },
                    },
                    {
                      where: {
                        tourId_localeId: {
                          tourId: current.id,
                          localeId: localeIds.es,
                        },
                      },
                      update: {
                        name: input.translations.es.name,
                        description: input.translations.es.description,
                        included: serializeIncludedItems(
                          input.translations.es.includedItems,
                        ),
                        includedItems:
                          normalizeIncludedItems(input.translations.es.includedItems),
                        whatToBring: input.translations.es.whatToBring,
                        operatorDescription: input.translations.es.operatorDescription,
                      },
                      create: {
                        localeId: localeIds.es,
                        name: input.translations.es.name,
                        description: input.translations.es.description,
                        included: serializeIncludedItems(
                          input.translations.es.includedItems,
                        ),
                        includedItems:
                          normalizeIncludedItems(input.translations.es.includedItems),
                        whatToBring: input.translations.es.whatToBring,
                        operatorDescription: input.translations.es.operatorDescription,
                      },
                    },
                  ],
                },
              },
            })

            const submissionId = current.approvedSubmissions[0]?.id

            if (submissionId) {
              await replaceTourSubmissionImages(transaction as PrismaClient, submissionId, input.media)
            }
          })

          return getPublishedTourDetail(prisma, input.id)
        }
      }
    },
    async archivePublishedContent(input) {
      switch (input.type) {
        case 'events': {
          const item = await prisma.event.updateMany({
            where: { slug: input.id, status: ContentStatus.PUBLISHED },
            data: {
              status: ContentStatus.ARCHIVED,
              isFeatured: false,
              featuredOrder: null,
            },
          })

          return item.count > 0 ? { id: input.id, type: input.type, status: 'ARCHIVED' } : null
        }
        case 'restaurants': {
          const item = await prisma.restaurant.updateMany({
            where: { slug: input.id, status: ContentStatus.PUBLISHED },
            data: {
              status: ContentStatus.ARCHIVED,
              isFeatured: false,
              featuredOrder: null,
            },
          })

          return item.count > 0 ? { id: input.id, type: input.type, status: 'ARCHIVED' } : null
        }
        case 'tours': {
          const item = await prisma.tour.updateMany({
            where: { slug: input.id, status: ContentStatus.PUBLISHED },
            data: {
              status: ContentStatus.ARCHIVED,
              isFeatured: false,
              featuredOrder: null,
            },
          })

          return item.count > 0 ? { id: input.id, type: input.type, status: 'ARCHIVED' } : null
        }
      }
    },
    async updateFeaturedState(input) {
      const { type, id, isFeatured, language } = input

      switch (type) {
        case 'events': {
          if (isFeatured) {
            const featuredCount = await countFeaturedForType(prisma, type)

            if (featuredCount >= FEATURED_ITEMS_CAP) {
              return null
            }
          }

          const current = await prisma.event.findFirst({
            where: { slug: id, status: ContentStatus.PUBLISHED },
            select: { featuredOrder: true },
          })

          if (!current) {
            return null
          }

          const maxFeatured = await prisma.event.aggregate({
            _max: { featuredOrder: true },
            where: { status: ContentStatus.PUBLISHED, isFeatured: true },
          })

          const item = await prisma.event.update({
            where: { slug: id },
            data: {
              isFeatured,
              featuredOrder: isFeatured
                ? current.featuredOrder ?? (maxFeatured._max.featuredOrder ?? -1) + 1
                : null,
            },
            include: {
              translations: { where: getLocaleWhere(language) },
              ...getApprovedSubmissionInclude(),
            },
          })

          return item.translations.length > 0
            ? mapPublishedEventItem(mapEventItem(item))
            : null
        }
        case 'restaurants': {
          if (isFeatured) {
            const featuredCount = await countFeaturedForType(prisma, type)

            if (featuredCount >= FEATURED_ITEMS_CAP) {
              return null
            }
          }

          const current = await prisma.restaurant.findFirst({
            where: { slug: id, status: ContentStatus.PUBLISHED },
            select: { featuredOrder: true },
          })

          if (!current) {
            return null
          }

          const maxFeatured = await prisma.restaurant.aggregate({
            _max: { featuredOrder: true },
            where: { status: ContentStatus.PUBLISHED, isFeatured: true },
          })

          const item = await prisma.restaurant.update({
            where: { slug: id },
            data: {
              isFeatured,
              featuredOrder: isFeatured
                ? current.featuredOrder ?? (maxFeatured._max.featuredOrder ?? -1) + 1
                : null,
            },
            include: {
              ...getRestaurantTranslationInclude(language),
              ...getApprovedSubmissionInclude(),
            },
          })

          const translation = selectRestaurantTranslation(item.translations, language)

          return translation
            ? mapPublishedRestaurantItem(
                mapRestaurantItem({
                  ...item,
                  translation,
                }),
              )
            : null
        }
        case 'tours': {
          if (isFeatured) {
            const featuredCount = await countFeaturedForType(prisma, type)

            if (featuredCount >= FEATURED_ITEMS_CAP) {
              return null
            }
          }

          const current = await prisma.tour.findFirst({
            where: { slug: id, status: ContentStatus.PUBLISHED },
            select: { featuredOrder: true },
          })

          if (!current) {
            return null
          }

          const maxFeatured = await prisma.tour.aggregate({
            _max: { featuredOrder: true },
            where: { status: ContentStatus.PUBLISHED, isFeatured: true },
          })

          const item = await prisma.tour.update({
            where: { slug: id },
            data: {
              isFeatured,
              featuredOrder: isFeatured
                ? current.featuredOrder ?? (maxFeatured._max.featuredOrder ?? -1) + 1
                : null,
            },
            include: {
              translations: { include: { locale: true } },
              ...getApprovedSubmissionInclude(),
            },
          })

          const translation = selectTourTranslation(item.translations, language)

          return translation
            ? mapPublishedTourItem(
                mapTourItem({
                  slug: item.slug,
                  category: item.category as TourCategory,
                  duration: item.duration,
                  priceFrom: item.priceFrom,
                  bestFor: item.bestFor,
                  operatorName: item.operatorName,
                  imageUrls: item.imageUrls,
                  sortOrder: item.sortOrder,
                  featuredOrder: item.featuredOrder,
                  translation,
                  approvedSubmissions: item.approvedSubmissions,
                }),
              )
            : null
        }
      }
    },
    async countFeaturedItems(type) {
      return countFeaturedForType(prisma, type)
    },
  }
}
