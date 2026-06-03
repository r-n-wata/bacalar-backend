import { describe, expect, it, vi } from 'vitest'
import { createAdminModerationService } from '../../src/services/adminModerationService'

describe('adminModerationService', () => {
  it('returns pending submissions from the repository', async () => {
    const repository = {
      listPendingSubmissions: vi.fn().mockResolvedValue([
        { id: 'submission-1', type: 'events', status: 'PENDING' },
      ]),
      approveSubmission: vi.fn(),
      rejectSubmission: vi.fn(),
    }
    const service = createAdminModerationService({
      repository,
    })

    const result = await service.listPendingSubmissions('all')

    expect(repository.listPendingSubmissions).toHaveBeenCalledWith('all')
    expect(result.items).toHaveLength(1)
  })

  it('passes the admin email into approval writes', async () => {
    const repository = {
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
    const service = createAdminModerationService({
      repository,
    })

    await service.approveSubmission('events', 'submission-1', {
      email: 'admin@bacalar.test',
      userId: 'supabase-1',
    })

    expect(repository.approveSubmission).toHaveBeenCalledWith(
      'events',
      'submission-1',
      {
        reviewedBy: 'admin@bacalar.test',
      },
    )
  })

  it('maps pending-state conflicts into a 409 HttpError', async () => {
    const repository = {
      listPendingSubmissions: vi.fn(),
      approveSubmission: vi.fn().mockRejectedValue(new Error('SUBMISSION_NOT_PENDING')),
      rejectSubmission: vi.fn(),
    }
    const service = createAdminModerationService({
      repository,
    })

    await expect(
      service.approveSubmission('events', 'submission-1', {
        email: 'admin@bacalar.test',
        userId: 'supabase-1',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'SUBMISSION_NOT_PENDING',
    })
  })
})
