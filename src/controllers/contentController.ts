import type { Request, Response } from 'express'
import type { AppLanguage, EventCategory } from '../types/content'
import { resolveLanguage } from '../utils/locale'
import type { ContentService } from '../services/contentService'
import type { EventPaginationInput } from '../repositories/eventsPagination'
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
const eventCategories = ['music', 'wellness', 'food'] satisfies EventCategory[]

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
      const payload = await contentService.getRestaurants(language)

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
      const payload = await contentService.getTours(language)

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
