import { describe, expect, it, vi } from 'vitest'
import { createPrismaAdminModerationRepository } from '../../src/repositories/adminModerationRepository'

describe('adminModerationRepository', () => {
  it('lists pending submissions for the requested filter', async () => {
    const prisma = {
      eventSubmission: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'event-submission-1',
            title: 'Lagoon Music Night',
            startsAt: new Date('2026-06-03T18:30:00.000Z'),
            location: 'Casa del Muelle',
            category: 'music',
            description: 'Desc',
            contactName: 'Ana',
            contactMethod: 'ana@example.com',
            instagram: null,
            whatsapp: null,
            submittedLocale: 'en',
            status: 'PENDING',
            createdAt: new Date('2026-06-02T10:00:00.000Z'),
            updatedAt: new Date('2026-06-02T10:00:00.000Z'),
            images: [],
          },
        ]),
      },
      restaurantSubmission: {
        findMany: vi.fn(),
      },
      tourSubmission: {
        findMany: vi.fn(),
      },
    }
    const repository = createPrismaAdminModerationRepository(prisma as never)

    const items = await repository.listPendingSubmissions('events')

    expect(prisma.eventSubmission.findMany).toHaveBeenCalled()
    expect(prisma.restaurantSubmission.findMany).not.toHaveBeenCalled()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      type: 'events',
      status: 'PENDING',
    })
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
