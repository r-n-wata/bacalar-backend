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
import { paginateRestaurants, selectFeaturedRestaurants } from './restaurantsPagination'
import { paginateTours, selectFeaturedTours } from './toursPagination'

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
          featuredItems: selectFeaturedRestaurants(allItems, 3),
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
          featuredItems: selectFeaturedTours(allItems, 3),
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
