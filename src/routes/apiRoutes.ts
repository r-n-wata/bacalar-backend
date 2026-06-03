import { Router, type RequestHandler } from 'express'
import { getHealth } from '../controllers/healthController'
import { createContentController } from '../controllers/contentController'
import { createEventSubmissionController } from '../controllers/eventSubmissionController'
import { createRestaurantSubmissionController } from '../controllers/restaurantSubmissionController'
import { createTourSubmissionController } from '../controllers/tourSubmissionController'
import { createAdminRoutes } from './adminRoutes'
import type { ContentService } from '../services/contentService'
import type { AdminModerationService } from '../services/adminModerationService'
import type { EventSubmissionService } from '../services/eventSubmissionService'
import type { RestaurantSubmissionService } from '../services/restaurantSubmissionService'
import type { TourSubmissionService } from '../services/tourSubmissionService'
import type { AppLanguage } from '../types/content'

export function createApiRoutes(dependencies: {
  contentService: ContentService
  eventSubmissionService: EventSubmissionService
  restaurantSubmissionService: RestaurantSubmissionService
  tourSubmissionService: TourSubmissionService
  adminModerationService: AdminModerationService
  adminAuthMiddleware: RequestHandler
  defaultLanguage: AppLanguage
}) {
  const router = Router()
  const contentController = createContentController(dependencies)
  const eventSubmissionController = createEventSubmissionController(
    dependencies.eventSubmissionService,
  )
  const restaurantSubmissionController = createRestaurantSubmissionController(
    dependencies.restaurantSubmissionService,
  )
  const tourSubmissionController = createTourSubmissionController(
    dependencies.tourSubmissionService,
  )

  router.get('/health', getHealth)
  router.get('/home', contentController.getHome)
  router.get('/events', contentController.getEvents)
  router.get('/events/:id', contentController.getEventDetail)
  router.post('/event-submissions', eventSubmissionController.createSubmission)
  router.post('/event-submissions/upload', eventSubmissionController.prepareUpload)
  router.post(
    '/restaurant-submissions',
    restaurantSubmissionController.createSubmission,
  )
  router.post(
    '/restaurant-submissions/upload',
    restaurantSubmissionController.prepareUpload,
  )
  router.post('/tour-submissions', tourSubmissionController.createSubmission)
  router.post('/tour-submissions/upload', tourSubmissionController.prepareUpload)
  router.get('/restaurants', contentController.getRestaurants)
  router.get('/restaurants/:id', contentController.getRestaurantDetail)
  router.get('/tours', contentController.getTours)
  router.get('/tours/:id', contentController.getTourDetail)
  router.use(
    '/admin',
    dependencies.adminAuthMiddleware,
    createAdminRoutes({
      adminModerationService: dependencies.adminModerationService,
    }),
  )

  return router
}
