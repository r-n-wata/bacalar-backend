import type { Request, Response } from 'express'
import type { AppLanguage } from '../types/content'
import { resolveLanguage } from '../utils/locale'
import type { ContentService } from '../services/contentService'

type ContentControllerDependencies = {
  contentService: ContentService
  defaultLanguage: AppLanguage
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
    getRestaurants: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getRestaurants(language)

      response.json(payload)
    },
    getTours: async (request: Request, response: Response) => {
      const language = resolveLanguage(request, defaultLanguage)
      const payload = await contentService.getTours(language)

      response.json(payload)
    },
  }
}
