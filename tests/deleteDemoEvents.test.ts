import { ContentStatus } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'
import {
  assertDeletionAllowed,
  deletePublishedDemoEvents,
  isProductionLikeEnvironment,
  parseArgs,
} from '../scripts/deleteDemoEvents'

describe('deleteDemoEvents', () => {
  it('parses dry-run and production confirmation flags', () => {
    expect(parseArgs(['--dry-run', '--confirm-production'])).toEqual({
      dryRun: true,
      confirmProduction: true,
    })
  })

  it('treats non-local databases as production-like', () => {
    expect(
      isProductionLikeEnvironment({
        nodeEnv: 'development',
        databaseUrl: 'postgresql://user:pass@db.example.com:5432/bacalar',
      }),
    ).toBe(true)
  })

  it('allows local dry-run execution without extra confirmation', () => {
    expect(() =>
      assertDeletionAllowed({
        nodeEnv: 'development',
        databaseUrl: 'postgresql://postgres:postgres@localhost:5432/bacalar',
        dryRun: true,
        confirmProduction: false,
      }),
    ).not.toThrow()
  })

  it('allows dry-run execution in production-like environments', () => {
    expect(() =>
      assertDeletionAllowed({
        nodeEnv: 'production',
        databaseUrl: 'postgresql://user:pass@db.example.com:5432/bacalar',
        dryRun: true,
        confirmProduction: false,
      }),
    ).not.toThrow()
  })

  it('requires explicit confirmation in production-like environments', () => {
    expect(() =>
      assertDeletionAllowed({
        nodeEnv: 'production',
        databaseUrl: 'postgresql://user:pass@db.example.com:5432/bacalar',
        dryRun: false,
        confirmProduction: false,
      }),
    ).toThrowError(/Refusing to delete demo events/)
  })

  it('reports matches without deleting in dry-run mode', async () => {
    const prisma = {
      event: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: '1',
            slug: 'event-sunset-jazz',
            status: ContentStatus.PUBLISHED,
            translations: [{ title: 'Sunset Jazz by the Lagoon' }],
          },
        ]),
        count: vi.fn().mockResolvedValue(7),
      },
    } as never

    const result = await deletePublishedDemoEvents(prisma, { dryRun: true })

    expect(result).toEqual({
      dryRun: true,
      deletedCount: 0,
      matchedCount: 1,
      matchedRecords: [
        {
          id: '1',
          slug: 'event-sunset-jazz',
          title: 'Sunset Jazz by the Lagoon',
          status: ContentStatus.PUBLISHED,
        },
      ],
      matchedSlugs: ['event-sunset-jazz'],
      totalPublishedEvents: 7,
    })
  })

  it('deletes only the matched published demo events in delete mode', async () => {
    const prisma = {
      event: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: '1',
            slug: 'event-sunset-jazz',
            status: ContentStatus.PUBLISHED,
            translations: [{ title: 'Sunset Jazz by the Lagoon' }],
          },
          {
            id: '2',
            slug: 'event-market-brunch',
            status: ContentStatus.PUBLISHED,
            translations: [{ title: 'Local Market Brunch Crawl' }],
          },
        ]),
        count: vi.fn().mockResolvedValue(7),
      },
      $transaction: vi.fn(async (callback: (tx: unknown) => Promise<number>) =>
        callback({
          event: {
            deleteMany: vi.fn().mockResolvedValue({
              count: 2,
            }),
          },
        }),
      ),
    } as never

    const result = await deletePublishedDemoEvents(prisma, { dryRun: false })

    expect(result).toEqual({
      dryRun: false,
      deletedCount: 2,
      matchedCount: 2,
      matchedRecords: [
        {
          id: '1',
          slug: 'event-sunset-jazz',
          title: 'Sunset Jazz by the Lagoon',
          status: ContentStatus.PUBLISHED,
        },
        {
          id: '2',
          slug: 'event-market-brunch',
          title: 'Local Market Brunch Crawl',
          status: ContentStatus.PUBLISHED,
        },
      ],
      matchedSlugs: ['event-sunset-jazz', 'event-market-brunch'],
      totalPublishedEvents: 7,
    })
  })
})
