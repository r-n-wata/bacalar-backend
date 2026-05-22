import type {
  AppLanguage,
  EventDetail,
  EventsContent,
  HomeContent,
  RestaurantDetail,
  RestaurantsContent,
  TourDetail,
  ToursContent,
} from '../types/content'
import type { CacheProvider } from '../utils/cache'
import { HttpError } from '../utils/httpError'
import type { ContentRepositories } from '../repositories/interfaces'

type CachePolicy = {
  ttlMs: number
}

export type ContentService = {
  getHome(language: AppLanguage): Promise<HomeContent>
  getEvents(language: AppLanguage): Promise<EventsContent>
  getEventDetail(id: string, language: AppLanguage): Promise<EventDetail>
  getRestaurants(language: AppLanguage): Promise<RestaurantsContent>
  getRestaurantDetail(id: string, language: AppLanguage): Promise<RestaurantDetail>
  getTours(language: AppLanguage): Promise<ToursContent>
  getTourDetail(id: string, language: AppLanguage): Promise<TourDetail>
}

const cachePolicies = {
  home: { ttlMs: 1000 * 60 * 10 },
  events: { ttlMs: 1000 * 60 * 3 },
  eventDetail: { ttlMs: 1000 * 60 * 3 },
  restaurants: { ttlMs: 1000 * 60 * 8 },
  restaurantDetail: { ttlMs: 1000 * 60 * 8 },
  tours: { ttlMs: 1000 * 60 * 5 },
  tourDetail: { ttlMs: 1000 * 60 * 5 },
} satisfies Record<string, CachePolicy>

async function getCachedContent<T>(
  cache: CacheProvider,
  key: string,
  policy: CachePolicy,
  getter: () => Promise<T | null>,
) {
  const cached = cache.get<T>(key)

  if (cached) {
    return cached
  }

  const value = await getter()

  if (!value) {
    throw new HttpError(404, 'Content not found')
  }

  cache.set(key, value, policy.ttlMs)

  return value
}

export function createContentService(
  repositories: ContentRepositories,
  cache: CacheProvider,
): ContentService {
  return {
    getHome(language) {
      return getCachedContent(
        cache,
        `home:${language}`,
        cachePolicies.home,
        () => repositories.home.getHomeContent(language),
      )
    },
    getEvents(language) {
      return getCachedContent(
        cache,
        `events:${language}`,
        cachePolicies.events,
        () => repositories.events.getEventsContent(language),
      )
    },
    getEventDetail(id, language) {
      return getCachedContent(
        cache,
        `events:${id}:${language}`,
        cachePolicies.eventDetail,
        () => repositories.events.getEventDetail(id, language),
      )
    },
    getRestaurants(language) {
      return getCachedContent(
        cache,
        `restaurants:${language}`,
        cachePolicies.restaurants,
        () => repositories.restaurants.getRestaurantsContent(language),
      )
    },
    getRestaurantDetail(id, language) {
      return getCachedContent(
        cache,
        `restaurants:${id}:${language}`,
        cachePolicies.restaurantDetail,
        () => repositories.restaurants.getRestaurantDetail(id, language),
      )
    },
    getTours(language) {
      return getCachedContent(
        cache,
        `tours:${language}`,
        cachePolicies.tours,
        () => repositories.tours.getToursContent(language),
      )
    },
    getTourDetail(id, language) {
      return getCachedContent(
        cache,
        `tours:${id}:${language}`,
        cachePolicies.tourDetail,
        () => repositories.tours.getTourDetail(id, language),
      )
    },
  }
}
