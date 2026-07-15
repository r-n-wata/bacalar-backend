import {
  ContentStatus,
  FeatureType,
  HomeSectionKind,
  type PrismaClient,
} from '@prisma/client'
import type {
  AppLanguage,
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
  AdminPublishedContentItem,
  AdminPublishedContentType,
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
  whatToBring?: string | null
  operatorDescription?: string | null
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
  translations: Array<{ title: string; dateLabel: string; venue: string }>
  approvedSubmissions?: SubmissionWithImages[]
}): EventItem & { sortOrder: number; featuredOrder?: number | null } {
  const translation = event.translations[0]
  const image = mapLeadImage(event.approvedSubmissions)

  return {
    id: event.slug,
    title: translation.title,
    dateLabel: translation.dateLabel,
    venue: translation.venue,
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
  translation: { name: string; cuisine: string; vibe: string }
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
    priceFrom: tour.priceFrom,
    bestFor: tour.bestFor,
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

        const paginatedEvents = paginateEvents(
          listEvents
            .filter((event) => event.translations.length > 0)
            .map(mapEventItem),
          pagination,
        )

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

        const paginatedRestaurants = paginateRestaurants(
          restaurantItems,
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
              operatorName: tour.operatorName,
              imageUrls: tour.imageUrls,
              sortOrder: tour.sortOrder,
              featuredOrder: tour.featuredOrder,
              translation,
              approvedSubmissions: tour.approvedSubmissions,
            })
          })
          .filter(isPresent)

        const filteredTourItems = tourItems.filter((tour) =>
          pagination.category ? tour.category === pagination.category : true,
        )
        const paginatedTours = paginateTours(filteredTourItems, pagination)
        const categories = [...new Set(tourItems.map((item) => item.category))].sort(
          (left, right) => left.localeCompare(right),
        )

        return {
          eyebrow: intro.eyebrow,
          title: intro.title,
          description: intro.description,
          categories,
          featuredItems: selectFeaturedTours(featuredTourItems, FEATURED_ITEMS_CAP),
          items: paginatedTours.items,
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
