import type {
  AppLanguage,
  EventsContent,
  HomeContent,
  RestaurantsContent,
  ToursContent,
} from '../types/content'

export type HomeRepository = {
  getHomeContent(language: AppLanguage): Promise<HomeContent | null>
}

export type EventsRepository = {
  getEventsContent(language: AppLanguage): Promise<EventsContent | null>
}

export type RestaurantsRepository = {
  getRestaurantsContent(language: AppLanguage): Promise<RestaurantsContent | null>
}

export type ToursRepository = {
  getToursContent(language: AppLanguage): Promise<ToursContent | null>
}

export type ContentRepositories = {
  home: HomeRepository
  events: EventsRepository
  restaurants: RestaurantsRepository
  tours: ToursRepository
}
