import type {
  AppLanguage,
  EventsContent,
  HomeContent,
  RestaurantsContent,
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
  getRestaurants(language: AppLanguage): Promise<RestaurantsContent>
  getTours(language: AppLanguage): Promise<ToursContent>
}

const cachePolicies = {
  home: { ttlMs: 1000 * 60 * 10 },
  events: { ttlMs: 1000 * 60 * 3 },
  restaurants: { ttlMs: 1000 * 60 * 8 },
  tours: { ttlMs: 1000 * 60 * 5 },
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
    getRestaurants(language) {
      return getCachedContent(
        cache,
        `restaurants:${language}`,
        cachePolicies.restaurants,
        () => repositories.restaurants.getRestaurantsContent(language),
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
  }
}
