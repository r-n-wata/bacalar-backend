import type { Request, Response } from 'express'
import type {
  AppLanguage,
  EventCategory,
  RestaurantMoment,
  TourCategory,
} from '../types/content'
import { resolveLanguage } from '../utils/locale'
import type { ContentService } from '../services/contentService'
import type { EventPaginationInput } from '../repositories/eventsPagination'
import type { RestaurantPaginationInput } from '../repositories/restaurantsPagination'
import type { TourPaginationInput } from '../repositories/toursPagination'
import { HttpError } from '../utils/httpError'

type ContentControllerDependencies = {
  contentService: ContentService
  defaultLanguage: AppLanguage
}

function resolveId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function resolveQueryStringValue(
  value: Request['query'][string],
): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined
  }

  return typeof value === 'string' ? value : undefined
}

const DEFAULT_EVENTS_LIMIT = 10
const MAX_EVENTS_LIMIT = 24
const DEFAULT_RESTAURANTS_LIMIT = 2
const MAX_RESTAURANTS_LIMIT = 24
const DEFAULT_TOURS_LIMIT = 2
const MAX_TOURS_LIMIT = 24
const eventCategories = ['music', 'wellness', 'food'] satisfies EventCategory[]
const restaurantMoments = [
  'breakfast',
  'lunch',
  'dinner',
] satisfies RestaurantMoment[]
const tourCategories = [
  'premium',
  'group',
  'adventure',
] satisfies TourCategory[]

function resolveEventCategory(
  value: string | undefined,
): EventCategory | undefined {
  if (!value || value === 'all') {
    return undefined
  }

  if (eventCategories.includes(value as EventCategory)) {
    return value as EventCategory
  }

  throw new HttpError(400, 'Unsupported event category query parameter')
}

function resolveEventsPagination(query: Request['query']): EventPaginationInput {
  const limitValue = resolveQueryStringValue(query.limit)
  const parsedLimit = Number.parseInt(limitValue ?? String(DEFAULT_EVENTS_LIMIT), 10)
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, MAX_EVENTS_LIMIT)
      : DEFAULT_EVENTS_LIMIT

  return {
    limit,
    cursor: resolveQueryStringValue(query.cursor),
    category: resolveEventCategory(resolveQueryStringValue(query.category)),
  }
}

function resolveRestaurantMoment(
  value: string | undefined,
): RestaurantMoment | undefined {
  if (!value || value === 'all') {
    return undefined
  }

  if (restaurantMoments.includes(value as RestaurantMoment)) {
    return value as RestaurantMoment
  }

  throw new HttpError(400, 'Unsupported restaurant category query parameter')
}

function resolveRestaurantsPagination(
  query: Request['query'],
): RestaurantPaginationInput {
  const limitValue = resolveQueryStringValue(query.limit)
  const parsedLimit = Number.parseInt(
    limitValue ?? String(DEFAULT_RESTAURANTS_LIMIT),
    10,
  )
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, MAX_RESTAURANTS_LIMIT)
      : DEFAULT_RESTAURANTS_LIMIT

  return {
    limit,
    cursor: resolveQueryStringValue(query.cursor),
    category: resolveRestaurantMoment(resolveQueryStringValue(query.category)),
  }
}

function resolveTourCategory(
  value: string | undefined,
): TourCategory | undefined {
  if (!value || value === 'all') {
    return undefined
  }

  if (tourCategories.includes(value as TourCategory)) {
    return value as TourCategory
  }

  throw new HttpError(400, 'Unsupported tour category query parameter')
}

function resolveToursPagination(query: Request['query']): TourPaginationInput {
  const limitValue = resolveQueryStringValue(query.limit)
  const parsedLimit = Number.parseInt(limitValue ?? String(DEFAULT_TOURS_LIMIT), 10)
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, MAX_TOURS_LIMIT)
      : DEFAULT_TOURS_LIMIT

  return {
    limit,
    cursor: resolveQueryStringValue(query.cursor),
    category: resolveTourCategory(resolveQueryStringValue(query.category)),
  }
}

export function createContentController({
  contentService,
  defaultLanguage,
}: ContentControllerDependencies) {
  return {
    getHome: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getHome(language)

      response.json(payload)
    },
    getEvents: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getEvents(
        language,
        resolveEventsPagination(request.query),
      )

      response.json(payload)
    },
    getEventDetail: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getEventDetail(
        resolveId(request.params.id),
        language,
      )

      response.json(payload)
    },
    getRestaurants: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getRestaurants(
        language,
        resolveRestaurantsPagination(request.query),
      )

      response.json(payload)
    },
    getRestaurantDetail: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getRestaurantDetail(
        resolveId(request.params.id),
        language,
      )

      response.json(payload)
    },
    getTours: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getTours(
        language,
        resolveToursPagination(request.query),
      )

      response.json(payload)
    },
    getTourDetail: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getTourDetail(
        resolveId(request.params.id),
        language,
      )

      response.json(payload)
    },
  }
}
