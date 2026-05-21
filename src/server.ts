import { createApp } from './app'
import { createLogger } from './config/logger'
import { createPrismaClient } from './config/prisma'
import { loadEnv } from './config/env'
import { createPrismaRepositories } from './repositories/prismaRepositories'
import { createContentService } from './services/contentService'
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
  const cache = new InMemoryCache()
  const contentService = createContentService(repositories, cache)
  const app = createApp({
    contentService,
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
