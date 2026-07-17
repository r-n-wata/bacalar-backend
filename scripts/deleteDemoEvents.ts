import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { ContentStatus, Prisma, PrismaClient } from '@prisma/client'
import { demoEventSlugs } from '../src/data/demoEventIds'

type DeleteDemoEventsOptions = {
  dryRun: boolean
}

type DemoEventSummary = {
  id: string
  slug: string
  title: string | null
  status: ContentStatus
}

const PRODUCTION_CONFIRMATION_VALUE = 'delete-demo-events'

function loadLocalEnvFile() {
  const envPath = resolve(process.cwd(), '.env')

  if (!existsSync(envPath) || typeof process.loadEnvFile !== 'function') {
    return
  }

  process.loadEnvFile(envPath)
}

function summarizeDatabaseTarget(databaseUrl?: string) {
  if (!databaseUrl) {
    return {
      source: 'missing',
    }
  }

  try {
    const parsed = new URL(databaseUrl)

    return {
      source: 'env',
      host: parsed.hostname,
      port: parsed.port || null,
      database: parsed.pathname.replace(/^\//, '') || null,
      hasPgbouncer: parsed.searchParams.get('pgbouncer') === 'true',
    }
  } catch {
    return {
      source: 'env',
      unparsable: true,
    }
  }
}

export function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes('--dry-run'),
    confirmProduction: argv.includes('--confirm-production'),
  }
}

export function isProductionLikeEnvironment(input: {
  nodeEnv?: string
  databaseUrl?: string
}) {
  if (input.nodeEnv === 'production') {
    return true
  }

  if (!input.databaseUrl) {
    return false
  }

  return !/(localhost|127\.0\.0\.1)/i.test(input.databaseUrl)
}

export function assertDeletionAllowed(input: {
  nodeEnv?: string
  databaseUrl?: string
  dryRun: boolean
  confirmProduction: boolean
  confirmationValue?: string
}) {
  const requiresConfirmation = isProductionLikeEnvironment(input)

  if (!requiresConfirmation || input.dryRun) {
    return
  }

  if (
    input.confirmProduction ||
    input.confirmationValue === PRODUCTION_CONFIRMATION_VALUE
  ) {
    return
  }

  throw new Error(
    'Refusing to delete demo events in a production-like environment without explicit confirmation. Pass --confirm-production or set CONFIRM_DEMO_EVENT_DELETE=delete-demo-events.',
  )
}

export async function listPublishedDemoEvents(prisma: PrismaClient) {
  const events = await prisma.event.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      slug: {
        in: [...demoEventSlugs],
      },
    },
    select: {
      id: true,
      slug: true,
      status: true,
      translations: {
        where: {
          locale: {
            code: 'en',
          },
        },
        select: {
          title: true,
        },
        take: 1,
      },
    },
    orderBy: {
      slug: 'asc',
    },
  })

  return events.map((event: Prisma.EventGetPayload<{
    select: {
      id: true
      slug: true
      status: true
      translations: {
        select: {
          title: true
        }
      }
    }
  }>) => ({
    id: event.id,
    slug: event.slug,
    title: event.translations[0]?.title ?? null,
    status: event.status,
  })) satisfies DemoEventSummary[]
}

export async function deletePublishedDemoEvents(
  prisma: PrismaClient,
  options: DeleteDemoEventsOptions,
) {
  const [matches, totalPublishedEvents] = await Promise.all([
    listPublishedDemoEvents(prisma),
    prisma.event.count({
      where: {
        status: ContentStatus.PUBLISHED,
      },
    }),
  ])

  if (options.dryRun || matches.length === 0) {
    return {
      dryRun: options.dryRun,
      deletedCount: 0,
      matchedCount: matches.length,
      matchedRecords: matches,
      matchedSlugs: matches.map((event) => event.slug),
      totalPublishedEvents,
    }
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const result = await tx.event.deleteMany({
      where: {
        id: {
          in: matches.map((event) => event.id),
        },
      },
    })

    return result.count
  })

  return {
    dryRun: false,
    deletedCount: deleted,
    matchedCount: matches.length,
    matchedRecords: matches,
    matchedSlugs: matches.map((event) => event.slug),
    totalPublishedEvents,
  }
}

export async function main() {
  loadLocalEnvFile()

  const prisma = new PrismaClient()
  const args = parseArgs(process.argv.slice(2))

  try {
    assertDeletionAllowed({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL,
      dryRun: args.dryRun,
      confirmProduction: args.confirmProduction,
      confirmationValue: process.env.CONFIRM_DEMO_EVENT_DELETE,
    })

    const result = await deletePublishedDemoEvents(prisma, {
      dryRun: args.dryRun,
    })

    console.log(
      JSON.stringify(
        {
          ...result,
          targetedDemoEventSlugs: demoEventSlugs,
          databaseTarget: summarizeDatabaseTarget(process.env.DATABASE_URL),
        },
        null,
        2,
      ),
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main().catch((error) => {
    console.error('delete-demo-events-failed', error)
    process.exit(1)
  })
}
