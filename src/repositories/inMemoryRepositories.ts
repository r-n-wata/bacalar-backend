import {
  eventDetailsByLanguage,
  eventsContentByLanguage,
  restaurantDetailsByLanguage,
  restaurantsContentByLanguage,
  tourDetailsByLanguage,
  toursContentByLanguage,
} from '../data/seedContent'
import type { ContentRepositories } from './interfaces'
import { paginateEvents, selectFeaturedEvents } from './eventsPagination'
import { paginateRestaurants, selectFeaturedRestaurants } from './restaurantsPagination'
import { paginateTours, selectFeaturedTours } from './toursPagination'
import type { AppLanguage, RestaurantMoment } from '../types/content'

const FEATURED_ITEMS_CAP = 5

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

export function createInMemoryRepositories(): ContentRepositories {
  return {
    home: {
      async getHomeContent(language) {
        const tours = toursContentByLanguage[language]
        const restaurants = restaurantsContentByLanguage[language]
        const events = eventsContentByLanguage[language]

        if (!tours || !restaurants || !events) {
          return null
        }

        return {
          hero: {
            eyebrow: 'Bacalar, made simple',
            title: 'A calmer way to tour Bacalar',
            description:
              'Curated recommendations for visitors who want less noise and better choices.',
          },
          spotlight: {
            actions: [
              { key: 'tours', label: 'Tours' },
              { key: 'restaurants', label: 'Restaurants' },
              { key: 'events', label: 'Events' },
            ],
            entries: {
              tours: {
                title: 'Choose a lagoon tour with less second-guessing',
                description:
                  'Compare a few high-confidence tour options first, then keep browsing if you want more range.',
                route: '/tours',
                cta: 'Browse tours',
                metrics: [],
              },
              restaurants: {
                title: 'Match breakfast, lunch, and dinner to the shape of the day',
                description:
                  'Restaurant picks should support the itinerary, not compete with it.',
                route: '/restaurants',
                cta: 'Browse restaurants',
                metrics: [],
              },
              events: {
                title: 'Use events as the timely extra, not the whole plan',
                description:
                  'Give returning visitors something fresh while keeping the homepage calm for newcomers.',
                route: '/events',
                cta: 'Browse events',
                metrics: [],
              },
            },
          },
          featuredTours: {
            intro: {
              eyebrow: tours.eyebrow,
              title: tours.title,
              description: tours.description,
            },
            items: tours.featuredItems.slice(0, FEATURED_ITEMS_CAP).map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: item.category,
              description: item.bestFor,
              meta: `${item.duration} - ${item.priceFrom}`,
              route: item.route,
              image: item.image,
            })),
          },
          diningMoments: {
            intro: {
              eyebrow: restaurants.eyebrow,
              title: restaurants.title,
              description: restaurants.description,
            },
            items: restaurants.featuredItems
              .slice(0, FEATURED_ITEMS_CAP)
              .map((item) => ({
                id: item.id,
                label: item.moments
                  .map((moment) => formatRestaurantMoment(moment, language))
                  .join(' / '),
                title: item.name,
                subtitle: item.cuisine,
                description: item.vibe,
                meta: `${item.cuisine} - ${item.priceBand}`,
                route: item.route,
                image: item.image,
              })),
          },
          weeklyHappenings: {
            intro: {
              eyebrow: events.eyebrow,
              title: events.title,
              description: events.description,
            },
            items: events.featuredItems.slice(0, FEATURED_ITEMS_CAP).map((item) => ({
              id: item.id,
              label: item.dateLabel,
              title: item.title,
              subtitle: item.venue,
              description: item.venue,
              meta: item.dateLabel,
              route: item.route,
              image: item.image,
            })),
          },
        }
      },
    },
    events: {
      async getEventsContent(language, pagination) {
        const content = eventsContentByLanguage[language]

        if (!content) {
          return null
        }

        const { items, pagination: pageMeta } = paginateEvents(
          content.items
            .map((item, index) => ({
              ...item,
              sortOrder: index,
            }))
            .filter((item) => !content.featuredItems.some((featured) => featured.id === item.id))
            .filter((item) =>
              pagination.category ? item.category === pagination.category : true,
            )
            .filter((item) => {
              const searchTerm = pagination.search?.trim().toLowerCase()

              if (!searchTerm) {
                return true
              }

              return [
                item.title,
                item.venue,
                item.category,
                item.dateLabel,
                item.description,
              ]
                .join(' ')
                .toLowerCase()
                .includes(searchTerm)
            }),
          pagination,
        )
        const filteredEvents = content.items
          .map((item, index) => ({
            ...item,
            sortOrder: index,
          }))
          .filter((item) => !content.featuredItems.some((featured) => featured.id === item.id))
          .filter((item) =>
            pagination.category ? item.category === pagination.category : true,
          )
          .filter((item) => {
            const searchTerm = pagination.search?.trim().toLowerCase()

            if (!searchTerm) {
              return true
            }

            return [
              item.title,
              item.venue,
              item.category,
              item.dateLabel,
              item.description,
            ]
              .join(' ')
              .toLowerCase()
              .includes(searchTerm)
          })

        return {
          ...content,
          featuredItems: selectFeaturedEvents(
            content.featuredItems.map((item, index) => ({
              ...item,
              sortOrder: index,
              featuredOrder: index,
            })),
            FEATURED_ITEMS_CAP,
          ),
          items,
          totalCount: filteredEvents.length,
          pagination: pageMeta,
        }
      },
      async getEventDetail(id, language) {
        return eventDetailsByLanguage[language]?.[id] ?? null
      },
    },
    restaurants: {
      async getRestaurantsContent(language, pagination) {
        const content = restaurantsContentByLanguage[language]

        if (!content) {
          return null
        }

        const allItems = content.items.map((item, index) => ({
          ...item,
          sortOrder: index,
          featuredOrder: index,
        }))
        const featuredIds = new Set(content.featuredItems.map((item) => item.id))
        const filteredItems = allItems
          .filter((item) => !featuredIds.has(item.id))
          .filter((item) =>
            pagination.category
              ? item.moments.includes(pagination.category)
              : true,
          )
          .filter((item) =>
            pagination.priceBand ? item.priceBand === pagination.priceBand : true,
          )
          .filter((item) => {
            const searchTerm = pagination.search?.trim().toLowerCase()

            if (!searchTerm) {
              return true
            }

            return [
              item.name,
              item.cuisine,
              item.vibe,
              item.description,
              item.moments.join(' '),
              item.priceBand,
            ]
              .join(' ')
              .toLowerCase()
              .includes(searchTerm)
          })

        const paginatedRestaurants = paginateRestaurants(filteredItems, pagination)

        return {
          ...content,
          featuredItems: selectFeaturedRestaurants(allItems, FEATURED_ITEMS_CAP),
          items: paginatedRestaurants.items,
          totalCount: filteredItems.length,
          pagination: paginatedRestaurants.pagination,
        }
      },
      async getRestaurantDetail(id, language) {
        return restaurantDetailsByLanguage[language]?.[id] ?? null
      },
    },
    tours: {
      async getToursContent(language, pagination) {
        const content = toursContentByLanguage[language]

        if (!content) {
          return null
        }

        const allItems = content.items.map((item, index) => ({
          ...item,
          sortOrder: index,
          featuredOrder: index,
        }))
        const featuredIds = new Set(content.featuredItems.map((item) => item.id))
        const filteredItems = allItems
          .filter((item) => !featuredIds.has(item.id))
          .filter((item) => {
            if (pagination.category && item.category !== pagination.category) {
              return false
            }

            if (
              typeof pagination.priceMin === 'number' &&
              item.priceFromValue < pagination.priceMin
            ) {
              return false
            }

            if (
              typeof pagination.priceMax === 'number' &&
              item.priceFromValue > pagination.priceMax
            ) {
              return false
            }

            if (
              pagination.durationHours &&
              pagination.durationHours.length > 0 &&
              !pagination.durationHours.includes(item.durationHoursValue)
            ) {
              return false
            }

            const searchTerm = pagination.search?.trim().toLowerCase()

            if (!searchTerm) {
              return true
            }

            const haystack = [
              item.name,
              item.operatorName,
              item.category,
              item.bestFor,
              item.description,
            ]
              .join(' ')
              .toLowerCase()

            return haystack.includes(searchTerm)
          })
        const paginatedTours = paginateTours(filteredItems, pagination)

        return {
          ...content,
          durationOptions: [
            ...new Set(allItems.map((item) => item.durationHoursValue)),
          ].sort((left, right) => left - right),
          featuredItems: selectFeaturedTours(allItems, FEATURED_ITEMS_CAP),
          items: paginatedTours.items,
          totalCount: filteredItems.length,
          pagination: paginatedTours.pagination,
        }
      },
      async getTourDetail(id, language) {
        return tourDetailsByLanguage[language]?.[id] ?? null
      },
    },
  }
}
