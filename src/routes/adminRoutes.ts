import { Router } from 'express'
import { createAdminModerationController } from '../controllers/adminModerationController'
import type { AdminModerationService } from '../services/adminModerationService'

export function createAdminRoutes(dependencies: {
  adminModerationService: AdminModerationService
}) {
  const router = Router()
  const controller = createAdminModerationController(
    dependencies.adminModerationService,
  )

  router.get('/session', controller.getSession)
  router.get('/submissions', controller.listPendingSubmissions)
  router.post('/submissions/events/:id/approve', controller.approveEventSubmission)
  router.post('/submissions/events/:id/reject', controller.rejectEventSubmission)
  router.post(
    '/submissions/restaurants/:id/approve',
    controller.approveRestaurantSubmission,
  )
  router.post(
    '/submissions/restaurants/:id/reject',
    controller.rejectRestaurantSubmission,
  )
  router.post('/submissions/tours/:id/approve', controller.approveTourSubmission)
  router.post('/submissions/tours/:id/reject', controller.rejectTourSubmission)

  return router
}
