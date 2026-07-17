import { describe, expect, it, vi } from 'vitest'
import { createAdminModerationController } from '../../src/controllers/adminModerationController'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

const defaultLanguage = 'en' as const

function createService(overrides: Record<string, unknown> = {}) {
  return {
    listSubmissions: vi.fn(),
    listPublishedContent: vi.fn(),
    getPublishedContentDetail: vi.fn(),
    updatePublishedContent: vi.fn(),
    archivePublishedContent: vi.fn(),
    getSubmissionDetail: vi.fn(),
    updatePublishedContentFeatured: vi.fn(),
    approveSubmission: vi.fn(),
    rejectSubmission: vi.fn(),
    ...overrides,
  }
}

describe('adminModerationController', () => {
  it('returns the authenticated admin session', async () => {
    const service = createService()
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.getSession(
      {
        adminUser: {
          email: 'admin@bacalar.test',
          userId: 'supabase-user-1',
        },
      } as never,
      response as never,
    )

    expect(response.json).toHaveBeenCalledWith({
      email: 'admin@bacalar.test',
      userId: 'supabase-user-1',
    })
  })

  it('passes the type and status filters through to the service', async () => {
    const service = createService({
      listSubmissions: vi.fn().mockResolvedValue({ items: [] }),
    })
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.listSubmissions(
      {
        query: {
          type: 'restaurants',
          status: 'approved',
        },
      } as never,
      response as never,
    )

    expect(service.listSubmissions).toHaveBeenCalledWith({
      type: 'restaurants',
      status: 'approved',
    })
    expect(response.json).toHaveBeenCalledWith({ items: [] })
  })

  it('defaults the list status filter to pending', async () => {
    const service = createService({
      listSubmissions: vi.fn().mockResolvedValue({ items: [] }),
    })
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.listSubmissions(
      {
        query: {},
      } as never,
      response as never,
    )

    expect(service.listSubmissions).toHaveBeenCalledWith({
      type: 'all',
      status: 'pending',
    })
  })

  it('loads a single submission detail', async () => {
    const service = createService({
      getSubmissionDetail: vi.fn().mockResolvedValue({
        item: {
          id: 'submission-1',
          type: 'events',
          status: 'PENDING',
        },
      }),
    })
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.getSubmissionDetail(
      {
        params: { type: 'events', id: 'submission-1' },
      } as never,
      response as never,
    )

    expect(service.getSubmissionDetail).toHaveBeenCalledWith(
      'events',
      'submission-1',
    )
    expect(response.json).toHaveBeenCalledWith({
      item: {
        id: 'submission-1',
        type: 'events',
        status: 'PENDING',
      },
    })
  })

  it('loads a single published content detail payload', async () => {
    const service = createService({
      getPublishedContentDetail: vi.fn().mockResolvedValue({
        item: {
          id: 'event-sunset-jazz',
          type: 'events',
          status: 'PUBLISHED',
        },
      }),
    })
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.getPublishedContentDetail(
      {
        params: { type: 'events', id: 'event-sunset-jazz' },
      } as never,
      response as never,
    )

    expect(service.getPublishedContentDetail).toHaveBeenCalledWith(
      'events',
      'event-sunset-jazz',
    )
    expect(response.json).toHaveBeenCalledWith({
      item: {
        id: 'event-sunset-jazz',
        type: 'events',
        status: 'PUBLISHED',
      },
    })
  })

  it('archives published content by type and id', async () => {
    const service = createService({
      archivePublishedContent: vi.fn().mockResolvedValue({
        id: 'event-sunset-jazz',
        type: 'events',
        status: 'ARCHIVED',
      }),
    })
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.archivePublishedContent(
      {
        params: { type: 'events', id: 'event-sunset-jazz' },
      } as never,
      response as never,
    )

    expect(service.archivePublishedContent).toHaveBeenCalledWith({
      type: 'events',
      id: 'event-sunset-jazz',
    })
    expect(response.json).toHaveBeenCalledWith({
      id: 'event-sunset-jazz',
      type: 'events',
      status: 'ARCHIVED',
    })
  })

  it('approves an event submission using the authenticated admin', async () => {
    const service = createService({
      approveSubmission: vi.fn().mockResolvedValue({
        id: 'submission-1',
        type: 'events',
        status: 'APPROVED',
        reviewedAt: '2026-06-02T12:00:00.000Z',
        reviewedBy: 'admin@bacalar.test',
      }),
    })
    const controller = createAdminModerationController(service, defaultLanguage)
    const response = createResponse()

    await controller.approveEventSubmission(
      {
        params: { id: 'submission-1' },
        adminUser: {
          email: 'admin@bacalar.test',
          userId: 'supabase-user-1',
        },
      } as never,
      response as never,
    )

    expect(service.approveSubmission).toHaveBeenCalledWith(
      'events',
      'submission-1',
      {
        email: 'admin@bacalar.test',
        userId: 'supabase-user-1',
      },
    )
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'APPROVED',
      }),
    )
  })
})
