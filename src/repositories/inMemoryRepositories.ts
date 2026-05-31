import {
  eventDetailsByLanguage,
  eventsContentByLanguage,
  homeContentByLanguage,
  restaurantDetailsByLanguage,
  restaurantsContentByLanguage,
  tourDetailsByLanguage,
  toursContentByLanguage,
} from '../data/seedContent'
import type { ContentRepositories } from './interfaces'
import { paginateEvents } from './eventsPagination'

export function createInMemoryRepositories(): ContentRepositories {
  return {
    home: {
      async getHomeContent(language) {
        return homeContentByLanguage[language] ?? null
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
          featuredItems: content.featuredItems,
          items,
          pagination: pageMeta,
        }
      },
      async getEventDetail(id, language) {
        return eventDetailsByLanguage[language]?.[id] ?? null
      },
    },
    restaurants: {
      async getRestaurantsContent(language) {
        return restaurantsContentByLanguage[language] ?? null
      },
      async getRestaurantDetail(id, language) {
        return restaurantDetailsByLanguage[language]?.[id] ?? null
      },
    },
    tours: {
      async getToursContent(language) {
        return toursContentByLanguage[language] ?? null
      },
      async getTourDetail(id, language) {
        return tourDetailsByLanguage[language]?.[id] ?? null
      },
    },
  }
}
