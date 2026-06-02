import express from 'express'
import { createRequestLogger } from './middlewares/requestLogger'
import { createErrorHandler } from './middlewares/errorHandler'
import { notFoundHandler } from './middlewares/notFound'
import { createApiRoutes } from './routes/apiRoutes'
import { createCorsMiddleware } from './middlewares/cors'
import { createRateLimitMiddleware } from './middlewares/rateLimit'
import type { Logger } from './config/logger'
import type { ContentService } from './services/contentService'
import type { EventSubmissionService } from './services/eventSubmissionService'
import type { RestaurantSubmissionService } from './services/restaurantSubmissionService'
import type { TourSubmissionService } from './services/tourSubmissionService'
import type { AppLanguage } from './types/content'

type AppDependencies = {
  contentService: ContentService
  eventSubmissionService: EventSubmissionService
  restaurantSubmissionService: RestaurantSubmissionService
  tourSubmissionService: TourSubmissionService
  logger: Logger
  defaultLanguage: AppLanguage
  allowedOrigins: string[]
  netlifySiteName?: string
  rateLimitWindowMs: number
  rateLimitMaxRequests: number
}

export function createApp(dependencies: AppDependencies) {
  const app = express()

  app.use(express.json())
  app.use(createRequestLogger(dependencies.logger))
  app.use(
    createCorsMiddleware({
      allowedOrigins: dependencies.allowedOrigins,
      netlifySiteName: dependencies.netlifySiteName,
    }),
  )
  app.use(
    createRateLimitMiddleware({
      windowMs: dependencies.rateLimitWindowMs,
      maxRequests: dependencies.rateLimitMaxRequests,
    }),
  )
  app.use(
    '/api',
    createApiRoutes({
      contentService: dependencies.contentService,
      eventSubmissionService: dependencies.eventSubmissionService,
      restaurantSubmissionService: dependencies.restaurantSubmissionService,
      tourSubmissionService: dependencies.tourSubmissionService,
      defaultLanguage: dependencies.defaultLanguage,
    }),
  )
  app.use(notFoundHandler)
  app.use(createErrorHandler(dependencies.logger))

  return app
}
