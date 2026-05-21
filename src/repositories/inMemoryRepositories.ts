import {
  eventsContentByLanguage,
  homeContentByLanguage,
  restaurantsContentByLanguage,
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
    },
    restaurants: {
      async getRestaurantsContent(language) {
        return restaurantsContentByLanguage[language] ?? null
      },
    },
    tours: {
      async getToursContent(language) {
        return toursContentByLanguage[language] ?? null
      },
    },
  }
}
