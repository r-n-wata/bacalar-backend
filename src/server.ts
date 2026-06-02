import { createApp } from './app'
import { createLogger } from './config/logger'
import { createPrismaClient } from './config/prisma'
import { loadEnv } from './config/env'
import { createPrismaRepositories } from './repositories/prismaRepositories'
import { createPrismaEventSubmissionRepository } from './repositories/eventSubmissionRepository'
import { createPrismaRestaurantSubmissionRepository } from './repositories/restaurantSubmissionRepository'
import { createPrismaTourSubmissionRepository } from './repositories/tourSubmissionRepository'
import { createSubmissionAdminNotifier } from './services/adminNotifications'
import { createContentService } from './services/contentService'
import { createEventSubmissionService } from './services/eventSubmissionService'
import { createExternalImageValidator } from './services/externalImageValidation'
import { createSupabaseSubmissionMediaService } from './services/mediaService'
import { createRestaurantSubmissionService } from './services/restaurantSubmissionService'
import { createTourSubmissionService } from './services/tourSubmissionService'
import { InMemoryCache } from './utils/cache'

function parseAllowedOrigins(rawOrigins: string) {
  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

async function main() {
  const env = loadEnv()
  const logger = createLogger()
  const prisma = createPrismaClient()
  const repositories = createPrismaRepositories(prisma)
  const eventSubmissionRepository = createPrismaEventSubmissionRepository(prisma)
  const restaurantSubmissionRepository =
    createPrismaRestaurantSubmissionRepository(prisma)
  const tourSubmissionRepository = createPrismaTourSubmissionRepository(prisma)
  const cache = new InMemoryCache()
  const contentService = createContentService(repositories, cache)
  const eventMediaService = createSupabaseSubmissionMediaService(logger, {
    supabaseUrl: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucketName: env.SUPABASE_STORAGE_BUCKET,
    folderPrefix: env.SUPABASE_EVENT_SUBMISSIONS_FOLDER,
  })
  const restaurantMediaService = createSupabaseSubmissionMediaService(logger, {
    supabaseUrl: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucketName: env.SUPABASE_STORAGE_BUCKET,
    folderPrefix: env.SUPABASE_RESTAURANT_IMAGES_FOLDER,
  })
  const tourMediaService = createSupabaseSubmissionMediaService(logger, {
    supabaseUrl: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucketName: env.SUPABASE_STORAGE_BUCKET,
    folderPrefix: env.SUPABASE_TOUR_IMAGES_FOLDER,
  })
  const adminNotifier = createSubmissionAdminNotifier(logger, {
    adminEmail: env.ADMIN_NOTIFICATION_EMAIL,
    fromEmail: env.NOTIFICATION_FROM_EMAIL,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER,
    smtpPassword: env.SMTP_PASSWORD,
  })
  const externalImageValidator = createExternalImageValidator(logger, {
    timeoutMs: env.EXTERNAL_IMAGE_VALIDATION_TIMEOUT_MS,
  })
  const eventSubmissionService = createEventSubmissionService({
    repository: eventSubmissionRepository,
    mediaService: eventMediaService,
    adminNotifier,
    externalImageValidator,
    logger,
  })
  const restaurantSubmissionService = createRestaurantSubmissionService({
    repository: restaurantSubmissionRepository,
    mediaService: restaurantMediaService,
    adminNotifier,
    externalImageValidator,
    logger,
  })
  const tourSubmissionService = createTourSubmissionService({
    repository: tourSubmissionRepository,
    mediaService: tourMediaService,
    adminNotifier,
    externalImageValidator,
    logger,
  })
  const app = createApp({
    contentService,
    eventSubmissionService,
    restaurantSubmissionService,
    tourSubmissionService,
    logger,
    defaultLanguage: env.DEFAULT_LOCALE,
    allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS),
    netlifySiteName: env.NETLIFY_SITE_NAME,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  })

  const server = app.listen(env.PORT, () => {
    logger.info('server-started', {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
    })
  })

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect()
      logger.info('server-stopped')
      process.exit(0)
    })
  }

  process.on('SIGINT', () => {
    void shutdown()
  })
  process.on('SIGTERM', () => {
    void shutdown()
  })
}

main().catch((error) => {
  console.error('server-startup-failed', error)
  process.exit(1)
})
