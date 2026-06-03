import { describe, expect, it, vi } from 'vitest'
import { createAdminModerationService } from '../../src/services/adminModerationService'

describe('adminModerationService', () => {
  it('returns filtered submissions from the repository', async () => {
    const repository = {
      listSubmissions: vi.fn().mockResolvedValue([
        { id: 'submission-1', type: 'events', status: 'PENDING' },
      ]),
      getSubmissionDetail: vi.fn(),
      approveSubmission: vi.fn(),
      rejectSubmission: vi.fn(),
    }
    const service = createAdminModerationService({
      repository,
    })

    const result = await service.listSubmissions({
      type: 'all',
      status: 'pending',
    })

    expect(repository.listSubmissions).toHaveBeenCalledWith({
      type: 'all',
      status: 'pending',
    })
    expect(result.items).toHaveLength(1)
  })

  it('returns a single submission detail payload from the repository', async () => {
    const repository = {
      listSubmissions: vi.fn(),
      getSubmissionDetail: vi.fn().mockResolvedValue({
        id: 'submission-1',
        type: 'events',
        status: 'APPROVED',
      }),
      approveSubmission: vi.fn(),
      rejectSubmission: vi.fn(),
    }
    const service = createAdminModerationService({
      repository,
    })

    const result = await service.getSubmissionDetail('events', 'submission-1')

    expect(repository.getSubmissionDetail).toHaveBeenCalledWith(
      'events',
      'submission-1',
    )
    expect(result).toEqual({
      item: {
        id: 'submission-1',
        type: 'events',
        status: 'APPROVED',
      },
    })
  })

  it('passes the admin email into approval writes', async () => {
    const repository = {
      listSubmissions: vi.fn(),
      getSubmissionDetail: vi.fn(),
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

  it('maps missing detail records into a 404 HttpError', async () => {
    const repository = {
      listSubmissions: vi.fn(),
      getSubmissionDetail: vi
        .fn()
        .mockRejectedValue(new Error('EVENT_SUBMISSION_NOT_FOUND')),
      approveSubmission: vi.fn(),
      rejectSubmission: vi.fn(),
    }
    const service = createAdminModerationService({
      repository,
    })

    await expect(
      service.getSubmissionDetail('events', 'submission-1'),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'SUBMISSION_NOT_FOUND',
    })
  })

  it('maps pending-state conflicts into a 409 HttpError', async () => {
    const repository = {
      listSubmissions: vi.fn(),
      getSubmissionDetail: vi.fn(),
      approveSubmission: vi
        .fn()
        .mockRejectedValue(new Error('SUBMISSION_NOT_PENDING')),
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
