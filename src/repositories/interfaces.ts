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
import type { EventPaginationInput } from './eventsPagination'

export type HomeRepository = {
  getHomeContent(language: AppLanguage): Promise<HomeContent | null>
}

export type EventsRepository = {
  getEventsContent(
    language: AppLanguage,
    pagination: EventPaginationInput,
  ): Promise<EventsContent | null>
  getEventDetail(id: string, language: AppLanguage): Promise<EventDetail | null>
}

export type RestaurantsRepository = {
  getRestaurantsContent(language: AppLanguage): Promise<RestaurantsContent | null>
  getRestaurantDetail(
    id: string,
    language: AppLanguage,
  ): Promise<RestaurantDetail | null>
}

export type ToursRepository = {
  getToursContent(language: AppLanguage): Promise<ToursContent | null>
  getTourDetail(id: string, language: AppLanguage): Promise<TourDetail | null>
}

export type ContentRepositories = {
  home: HomeRepository
  events: EventsRepository
  restaurants: RestaurantsRepository
  tours: ToursRepository
}
