import type { Request, Response } from 'express'
import type { AppLanguage } from '../types/content'
import { resolveLanguage } from '../utils/locale'
import type { ContentService } from '../services/contentService'

type ContentControllerDependencies = {
  contentService: ContentService
  defaultLanguage: AppLanguage
}

function resolveId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
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
      const payload = await contentService.getEvents(language)

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
