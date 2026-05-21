import express from 'express'
import { createRequestLogger } from './middlewares/requestLogger'
import { createErrorHandler } from './middlewares/errorHandler'
import { notFoundHandler } from './middlewares/notFound'
import { createApiRoutes } from './routes/apiRoutes'
import type { Logger } from './config/logger'
import type { ContentService } from './services/contentService'
import type { AppLanguage } from './types/content'

export function createApp(dependencies: {
  contentService: ContentService
  logger: Logger
  defaultLanguage: AppLanguage
}) {
  const app = express()

  app.use(express.json())
  app.use(createRequestLogger(dependencies.logger))
  app.use(
    '/api',
    createApiRoutes({
      contentService: dependencies.contentService,
      defaultLanguage: dependencies.defaultLanguage,
    }),
  )
  app.use(notFoundHandler)
  app.use(createErrorHandler(dependencies.logger))

  return app
}
