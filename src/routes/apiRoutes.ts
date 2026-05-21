import { Router } from 'express'
import { getHealth } from '../controllers/healthController'
import { createContentController } from '../controllers/contentController'
import type { ContentService } from '../services/contentService'
import type { AppLanguage } from '../types/content'

export function createApiRoutes(dependencies: {
  contentService: ContentService
  defaultLanguage: AppLanguage
}) {
  const router = Router()
  const contentController = createContentController(dependencies)

  router.get('/health', getHealth)
  router.get('/home', contentController.getHome)
  router.get('/events', contentController.getEvents)
  router.get('/restaurants', contentController.getRestaurants)
  router.get('/tours', contentController.getTours)

  return router
}
