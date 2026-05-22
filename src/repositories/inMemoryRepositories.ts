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

export function createInMemoryRepositories(): ContentRepositories {
  return {
    home: {
      async getHomeContent(language) {
        return homeContentByLanguage[language] ?? null
      },
    },
    events: {
      async getEventsContent(language) {
        return eventsContentByLanguage[language] ?? null
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
