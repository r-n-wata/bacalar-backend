import { createApp } from './app'
import { createLogger } from './config/logger'
import { createPrismaClient } from './config/prisma'
import { loadEnv } from './config/env'
import { createPrismaRepositories } from './repositories/prismaRepositories'
import { createContentService } from './services/contentService'
import { InMemoryCache } from './utils/cache'

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
  })

  app.listen(env.PORT, () => {
    logger.info('server-started', {
      port: env.PORT,
    })
  })
}

void main()
