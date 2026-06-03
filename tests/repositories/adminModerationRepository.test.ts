import { describe, expect, it, vi } from 'vitest'
import { createPrismaAdminModerationRepository } from '../../src/repositories/adminModerationRepository'

describe('adminModerationRepository', () => {
  it('lists submissions for the requested type and status filters', async () => {
    const prisma = {
      eventSubmission: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'event-submission-1',
            title: 'Lagoon Music Night',
            startsAt: new Date('2026-06-03T18:30:00.000Z'),
            location: 'Casa del Muelle',
            category: 'music',
            submittedLocale: 'en',
            status: 'APPROVED',
            createdAt: new Date('2026-06-02T10:00:00.000Z'),
            updatedAt: new Date('2026-06-02T10:00:00.000Z'),
            images: [
              {
                id: 'event-image-1',
                source: 'EXTERNAL_URL',
                url: 'https://images.example.com/event.jpg',
                objectKey: null,
                mimeType: null,
                originalFilename: null,
                sortOrder: 0,
              },
            ],
          },
        ]),
      },
      restaurantSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      tourSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    }
    const repository = createPrismaAdminModerationRepository(prisma as never)

    const items = await repository.listSubmissions({
      type: 'events',
      status: 'approved',
    })

    expect(prisma.eventSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'APPROVED',
        },
      }),
    )
    expect(prisma.restaurantSubmission.findMany).not.toHaveBeenCalled()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      type: 'events',
      status: 'APPROVED',
      thumbnail: {
        url: 'https://images.example.com/event.jpg',
      },
    })
  })

  it('returns a single submission detail with ordered images', async () => {
    const prisma = {
      eventSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn().mockResolvedValue({
          id: 'event-submission-1',
          title: 'Lagoon Music Night',
          startsAt: new Date('2026-06-03T18:30:00.000Z'),
          location: 'Casa del Muelle',
          category: 'music',
          description: 'A sunset set with local musicians.',
          contactName: 'Ana',
          contactMethod: 'ana@example.com',
          instagram: null,
          whatsapp: null,
          submittedLocale: 'en',
          status: 'PENDING',
          createdAt: new Date('2026-06-02T10:00:00.000Z'),
          updatedAt: new Date('2026-06-02T10:00:00.000Z'),
          images: [
            {
              id: 'event-image-1',
              source: 'EXTERNAL_URL',
              url: 'https://images.example.com/event-1.jpg',
              objectKey: null,
              mimeType: null,
              originalFilename: null,
              sortOrder: 0,
            },
            {
              id: 'event-image-2',
              source: 'EXTERNAL_URL',
              url: 'https://images.example.com/event-2.jpg',
              objectKey: null,
              mimeType: null,
              originalFilename: null,
              sortOrder: 1,
            },
          ],
        }),
      },
      restaurantSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      tourSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    }
    const repository = createPrismaAdminModerationRepository(prisma as never)

    const item = await repository.getSubmissionDetail('events', 'event-submission-1')

    expect(prisma.eventSubmission.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'event-submission-1' },
      }),
    )
    expect(item).toMatchObject({
      id: 'event-submission-1',
      type: 'events',
      description: 'A sunset set with local musicians.',
      thumbnail: {
        url: 'https://images.example.com/event-1.jpg',
      },
    })
    expect(item.images).toHaveLength(2)
    expect(item.images[0]?.url).toBe('https://images.example.com/event-1.jpg')
  })

  it('publishes approved event submissions transactionally', async () => {
    const update = vi.fn()
    const create = vi.fn().mockResolvedValue({ id: 'event-1' })
    const transaction = {
      locale: {
        findUnique: vi.fn().mockResolvedValue({ id: 1 }),
      },
      eventSubmission: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'submission-1',
          title: 'Lagoon Music Night',
          startsAt: new Date('2026-06-03T18:30:00.000Z'),
          location: 'Casa del Muelle',
          category: 'music',
          description: 'Desc',
          submittedLocale: 'en',
          status: 'PENDING',
        }),
        update,
      },
      event: {
        aggregate: vi.fn().mockResolvedValue({
          _max: {
            sortOrder: 4,
          },
        }),
        create,
      },
    }
    const prisma = {
      $transaction: vi.fn(async (callback: (value: typeof transaction) => unknown) =>
        callback(transaction),
      ),
    }
    const repository = createPrismaAdminModerationRepository(prisma as never)

    const result = await repository.approveSubmission('events', 'submission-1', {
      reviewedBy: 'admin@bacalar.test',
    })

    expect(create).toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'APPROVED',
          approvedEventId: 'event-1',
        }),
      }),
    )
    expect(result).toMatchObject({
      id: 'submission-1',
      status: 'APPROVED',
      publishedRecordId: 'event-1',
    })
  })
})
