import {
  ContentStatus,
  FeatureType,
  HomeSectionKind,
  type PrismaClient,
} from '@prisma/client'
import type {
  AppLanguage,
  EventDetail,
  HomeContent,
  HomeSuggestionCard,
  RestaurantDetail,
  RestaurantMoment,
  RestaurantsContent,
  TourDetail,
  ToursContent,
} from '../types/content'
import type { ContentRepositories } from './interfaces'
import { paginateEvents, selectFeaturedEvents } from './eventsPagination'
import {
  paginateRestaurants,
  selectFeaturedRestaurants,
} from './restaurantsPagination'

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

function mapSectionCards(
  cards: Array<{
    id: string
    route: string
    translations: Array<{
      label: string | null
      title: string
      description: string
      meta: string
    }>
  }>,
): HomeSuggestionCard[] {
  return cards
    .filter((card) => card.translations.length > 0)
    .map((card) => ({
      id: card.id,
      label: card.translations[0].label ?? undefined,
      title: card.translations[0].title,
      subtitle: deriveCardSubtitle(card.route, card.translations[0].label),
      description: card.translations[0].description,
      meta: card.translations[0].meta,
      route: card.route,
    }))
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

function deriveRestaurantFeaturedOrder(moment: RestaurantMoment) {
  switch (moment) {
    case 'breakfast':
      return 0
    case 'lunch':
      return 1
    case 'dinner':
      return 2
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
                cards: {
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
          (section) => section.kind === HomeSectionKind.FEATURED_EXPERIENCES,
        )
        const diningSection = homePage.sections.find(
          (section) => section.kind === HomeSectionKind.DINING_MOMENTS,
        )
        const weeklySection = homePage.sections.find(
          (section) => section.kind === HomeSectionKind.WEEKLY_HAPPENINGS,
        )

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
          featuredExperiences: {
            intro: {
              eyebrow: featuredSection.translations[0].eyebrow,
              title: featuredSection.translations[0].title,
              description: featuredSection.translations[0].description,
            },
            items: mapSectionCards(featuredSection.cards),
          },
          diningMoments: {
            intro: {
              eyebrow: diningSection.translations[0].eyebrow,
              title: diningSection.translations[0].title,
              description: diningSection.translations[0].description,
            },
            items: mapSectionCards(diningSection.cards),
          },
          weeklyHappenings: {
            intro: {
              eyebrow: weeklySection.translations[0].eyebrow,
              title: weeklySection.translations[0].title,
              description: weeklySection.translations[0].description,
            },
            items: mapSectionCards(weeklySection.cards),
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
              ...(pagination.category
                ? {
                    category: pagination.category,
                  }
                : {}),
            },
            include: {
              translations: {
                where: getLocaleWhere(language),
              },
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
            },
          }),
        ])

        const mapEventItem = (event: (typeof listEvents)[number]) => ({
          id: event.slug,
          title: event.translations[0].title,
          dateLabel: event.translations[0].dateLabel,
          venue: event.translations[0].venue,
          category: event.category,
          startsAt: event.startsAt?.toISOString(),
          endsAt: event.endsAt?.toISOString(),
          route: `/events/${event.slug}`,
          sortOrder: event.sortOrder,
          featuredOrder: event.featuredOrder,
        })

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
          5,
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
          description:
            translation.description ??
            `${translation.title} in ${translation.venue} during ${translation.dateLabel}.`,
          startsAt: event.startsAt?.toISOString(),
          endsAt: event.endsAt?.toISOString(),
          route: `/events/${event.slug}`,
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
                ? {
                    moment: pagination.category,
                  }
                : {}),
            },
            include: {
              translations: {
                where: getLocaleWhere(language),
              },
            },
          }),
          prisma.restaurant.findMany({
            where: {
              status: ContentStatus.PUBLISHED,
            },
            include: {
              translations: {
                where: getLocaleWhere(language),
              },
            },
          }),
        ])

        const mapRestaurantItem = (
          restaurant: (typeof featuredRestaurants)[number],
        ) => ({
          id: restaurant.slug,
          name: restaurant.translations[0].name,
          cuisine: restaurant.translations[0].cuisine,
          vibe: restaurant.translations[0].vibe,
          priceBand: restaurant.priceBand as '$' | '$$' | '$$$',
          moment: restaurant.moment as RestaurantMoment,
          route: `/restaurants/${restaurant.slug}`,
          sortOrder: restaurant.sortOrder,
          featuredOrder: deriveRestaurantFeaturedOrder(
            restaurant.moment as RestaurantMoment,
          ),
        })

        const restaurantItems = listRestaurants
          .filter((restaurant) => restaurant.translations.length > 0)
          .map(mapRestaurantItem)
        const featuredRestaurantItems = featuredRestaurants
          .filter((restaurant) => restaurant.translations.length > 0)
          .map(mapRestaurantItem)

        const paginatedRestaurants = paginateRestaurants(
          restaurantItems,
          pagination,
        )

        return {
          eyebrow: intro.eyebrow,
          title: intro.title,
          description: intro.description,
          featuredItems: selectFeaturedRestaurants(featuredRestaurantItems, 3),
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
            translations: {
              where: getLocaleWhere(language),
            },
          },
        })

        if (!restaurant || restaurant.translations.length === 0) {
          return null
        }

        const translation = restaurant.translations[0]

        return {
          id: restaurant.slug,
          name: translation.name,
          cuisine: translation.cuisine,
          vibe: translation.vibe,
          priceBand: restaurant.priceBand as '$' | '$$' | '$$$',
          moment: restaurant.moment as RestaurantMoment,
          description:
            translation.description ??
            `${translation.name} offers a ${translation.vibe.toLowerCase()} experience.`,
          route: `/restaurants/${restaurant.slug}`,
        }
      },
    },
    tours: {
      async getToursContent(language): Promise<ToursContent | null> {
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

        const tours = await prisma.tour.findMany({
          where: {
            status: ContentStatus.PUBLISHED,
          },
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
          },
        })

        return {
          eyebrow: intro.eyebrow,
          title: intro.title,
          description: intro.description,
          items: tours
            .filter((tour) => tour.translations.length > 0)
            .map((tour) => ({
              id: tour.slug,
              name: tour.translations[0].name,
              category: tour.translations[0].category,
              durationHours: tour.durationHours,
              priceFrom: tour.priceFrom,
              route: `/tours/${tour.slug}`,
            })),
        }
      },
      async getTourDetail(id, language): Promise<TourDetail | null> {
        const tour = await prisma.tour.findFirst({
          where: {
            slug: id,
            status: ContentStatus.PUBLISHED,
          },
          include: {
            translations: {
              where: getLocaleWhere(language),
            },
          },
        })

        if (!tour || tour.translations.length === 0) {
          return null
        }

        const translation = tour.translations[0]

        return {
          id: tour.slug,
          name: translation.name,
          category: translation.category,
          durationHours: tour.durationHours,
          priceFrom: tour.priceFrom,
          description:
            translation.description ??
            `${translation.name} is a ${tour.durationHours}-hour lagoon experience.`,
          route: `/tours/${tour.slug}`,
        }
      },
    },
  }
}
