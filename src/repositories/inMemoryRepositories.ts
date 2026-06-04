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

const FEATURED_ITEMS_CAP = 5

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
            title:
              'Start with the water, then layer in food and what is happening this week.',
            description:
              'A calmer homepage for both first-time visitors and returning travelers, with lagoon picks first and timely events only when they help.',
          },
          spotlight: {
            actions: [
              { key: 'tours', label: 'Tours' },
              { key: 'restaurants', label: 'Restaurants' },
              { key: 'events', label: 'Events' },
            ],
            entries: {
              tours: {
                title: 'Choose a lagoon experience with less second-guessing',
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
          featuredExperiences: {
            intro: {
              eyebrow: tours.eyebrow,
              title: tours.title,
              description: tours.description,
            },
            items: tours.featuredItems.slice(0, FEATURED_ITEMS_CAP).map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: item.categoryLabel,
              description: `${item.durationHours} hours`,
              meta: `From ${item.priceFrom} MXN`,
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
                label: item.moment,
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
            .filter((item) =>
              pagination.category ? item.category === pagination.category : true,
            ),
          pagination,
        )

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
        const filteredItems = allItems
          .filter((item) =>
            pagination.category ? item.moment === pagination.category : true,
          )

        const paginatedRestaurants = paginateRestaurants(filteredItems, pagination)

        return {
          ...content,
          featuredItems: selectFeaturedRestaurants(allItems, FEATURED_ITEMS_CAP),
          items: paginatedRestaurants.items,
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
        const filteredItems = allItems.filter((item) =>
          pagination.category ? item.category === pagination.category : true,
        )
        const paginatedTours = paginateTours(filteredItems, pagination)

        return {
          ...content,
          featuredItems: selectFeaturedTours(allItems, FEATURED_ITEMS_CAP),
          items: paginatedTours.items,
          pagination: paginatedTours.pagination,
        }
      },
      async getTourDetail(id, language) {
        return tourDetailsByLanguage[language]?.[id] ?? null
      },
    },
  }
}
