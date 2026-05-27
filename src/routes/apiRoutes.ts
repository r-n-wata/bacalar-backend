import { Router } from 'express'
import { getHealth } from '../controllers/healthController'
import { createContentController } from '../controllers/contentController'
import { createEventSubmissionController } from '../controllers/eventSubmissionController'
import type { ContentService } from '../services/contentService'
import type { EventSubmissionService } from '../services/eventSubmissionService'
import type { AppLanguage } from '../types/content'

export function createApiRoutes(dependencies: {
  contentService: ContentService
  eventSubmissionService: EventSubmissionService
  defaultLanguage: AppLanguage
}) {
  const router = Router()
  const contentController = createContentController(dependencies)
  const eventSubmissionController = createEventSubmissionController(
    dependencies.eventSubmissionService,
  )

  router.get('/health', getHealth)
  router.get('/home', contentController.getHome)
  router.get('/events', contentController.getEvents)
  router.get('/events/:id', contentController.getEventDetail)
  router.post('/event-submissions', eventSubmissionController.createSubmission)
  router.post('/event-submissions/upload', eventSubmissionController.prepareUpload)
  router.get('/restaurants', contentController.getRestaurants)
  router.get('/restaurants/:id', contentController.getRestaurantDetail)
  router.get('/tours', contentController.getTours)
  router.get('/tours/:id', contentController.getTourDetail)

  return router
}
