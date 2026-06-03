import { describe, expect, it, vi } from 'vitest'
import { createAdminModerationController } from '../../src/controllers/adminModerationController'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('adminModerationController', () => {
  it('returns the authenticated admin session', async () => {
    const service = {
      listPendingSubmissions: vi.fn(),
      approveSubmission: vi.fn(),
      rejectSubmission: vi.fn(),
    }
    const controller = createAdminModerationController(service)
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

  it('passes the submissions filter through to the service', async () => {
    const service = {
      listPendingSubmissions: vi.fn().mockResolvedValue({ items: [] }),
      approveSubmission: vi.fn(),
      rejectSubmission: vi.fn(),
    }
    const controller = createAdminModerationController(service)
    const response = createResponse()

    await controller.listPendingSubmissions(
      {
        query: {
          type: 'restaurants',
        },
      } as never,
      response as never,
    )

    expect(service.listPendingSubmissions).toHaveBeenCalledWith('restaurants')
    expect(response.json).toHaveBeenCalledWith({ items: [] })
  })

  it('approves an event submission using the authenticated admin', async () => {
    const service = {
      listPendingSubmissions: vi.fn(),
      approveSubmission: vi.fn().mockResolvedValue({
        id: 'submission-1',
        type: 'events',
        status: 'APPROVED',
        reviewedAt: '2026-06-02T12:00:00.000Z',
        reviewedBy: 'admin@bacalar.test',
      }),
      rejectSubmission: vi.fn(),
    }
    const controller = createAdminModerationController(service)
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
