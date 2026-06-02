import { describe, expect, it, vi } from 'vitest'
import { createEventSubmissionService } from '../../src/services/eventSubmissionService'
import type { EventSubmissionRecord } from '../../src/types/eventSubmissions'

function createSubmissionRecord(overrides: Partial<EventSubmissionRecord> = {}): EventSubmissionRecord {
  return {
    id: 'submission-1',
    title: 'Lagoon Story Night',
    startsAt: '2026-06-12T00:30:00.000Z',
    location: 'Casa del Agua',
    category: 'music',
    description: 'A small storytelling night with music and local hosts for visitors.',
    contactName: 'Maya Cruz',
    contactMethod: 'maya@example.com',
    submittedLocale: 'en',
    status: 'PENDING',
    createdAt: '2026-05-25T12:00:00.000Z',
    updatedAt: '2026-05-25T12:00:00.000Z',
    images: [],
    ...overrides,
  }
}

function createDependencies() {
  return {
    repository: {
      createSubmission: vi.fn(),
    },
    mediaService: {
      prepareImageUpload: vi.fn(),
    },
    adminNotifier: {
      notifyEventSubmission: vi.fn(),
      notifyRestaurantSubmission: vi.fn(),
      notifyTourSubmission: vi.fn(),
    },
    externalImageValidator: {
      validate: vi.fn(async (url: string) => ({
        url,
        mimeType: 'image/webp' as const,
      })),
    },
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  }
}

describe('eventSubmissionService', () => {
  it('persists valid submissions as pending and notifies admin', async () => {
    const dependencies = createDependencies()
    dependencies.repository.createSubmission.mockResolvedValue(
      createSubmissionRecord({
        images: [
          {
            id: 'image-1',
            source: 'UPLOADED',
            url: 'https://assets.example.com/a.jpg',
            objectKey: 'event-submissions/a.jpg',
            mimeType: 'image/jpeg',
            originalFilename: 'a.jpg',
            sortOrder: 0,
          },
          {
            id: 'image-2',
            source: 'EXTERNAL_URL',
            url: 'https://images.example.com/b.webp',
            sortOrder: 1,
          },
        ],
      }),
    )

    const service = createEventSubmissionService(dependencies)
    const result = await service.createSubmission({
      title: 'Lagoon Story Night',
      startsAt: '2026-06-12T00:30:00.000Z',
      location: 'Casa del Agua',
      category: 'music',
      description: 'A small storytelling night with music and local hosts for visitors.',
      contactName: 'Maya Cruz',
      contactMethod: 'maya@example.com',
      submittedLocale: 'en',
      media: [
        {
          kind: 'uploaded',
          url: 'https://assets.example.com/a.jpg',
          objectKey: 'event-submissions/a.jpg',
          mimeType: 'image/jpeg',
          filename: 'a.jpg',
        },
        {
          kind: 'external',
          url: 'https://images.example.com/b.webp',
        },
      ],
    })

    expect(dependencies.repository.createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'music',
        media: [
          expect.objectContaining({ kind: 'uploaded' }),
          { kind: 'external', url: 'https://images.example.com/b.webp' },
        ],
      }),
    )
    expect(dependencies.externalImageValidator.validate).toHaveBeenCalledWith(
      'https://images.example.com/b.webp',
    )
    expect(dependencies.adminNotifier.notifyEventSubmission).toHaveBeenCalled()
    expect(result).toEqual({
      id: 'submission-1',
      status: 'PENDING',
      createdAt: '2026-05-25T12:00:00.000Z',
    })
  })

  it('does not roll back the submission when email notification fails', async () => {
    const dependencies = createDependencies()
    dependencies.repository.createSubmission.mockResolvedValue(createSubmissionRecord())
    dependencies.adminNotifier.notifyEventSubmission.mockRejectedValue(
      new Error('smtp-down'),
    )

    const service = createEventSubmissionService(dependencies)
    const result = await service.createSubmission({
      title: 'Lagoon Story Night',
      startsAt: '2026-06-12T00:30:00.000Z',
      location: 'Casa del Agua',
      category: 'music',
      description: 'A small storytelling night with music and local hosts for visitors.',
      contactName: 'Maya Cruz',
      contactMethod: 'maya@example.com',
      submittedLocale: 'en',
      media: [],
    })

    expect(result.status).toBe('PENDING')
    expect(dependencies.logger.error).toHaveBeenCalledWith(
      'submission-admin-notification-failed',
      expect.objectContaining({ submissionId: 'submission-1' }),
    )
  })

  it('rejects invalid payloads with structured validation details', async () => {
    const service = createEventSubmissionService(createDependencies())

    await expect(
      service.createSubmission({
        title: '',
        startsAt: 'not-a-date',
        location: '',
        category: 'music',
        description: '',
        contactName: '',
        contactMethod: '',
        submittedLocale: 'en',
        media: [],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('rejects suspicious external image URLs', async () => {
    const dependencies = createDependencies()
    dependencies.externalImageValidator.validate.mockRejectedValue(
      new Error('The image URL must return a JPG, PNG, or WEBP file.'),
    )

    const service = createEventSubmissionService(dependencies)

    await expect(
      service.createSubmission({
        title: 'Lagoon Story Night',
        startsAt: '2026-06-12T00:30:00.000Z',
        location: 'Casa del Agua',
        category: 'music',
        description: 'A small storytelling night with music and local hosts for visitors.',
        contactName: 'Maya Cruz',
        contactMethod: 'maya@example.com',
        submittedLocale: 'en',
        media: [
          {
            kind: 'external',
            url: 'https://images.example.com/not-an-image.html',
          },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_EXTERNAL_IMAGE_URL',
    })
  })

  it('validates upload preparation metadata', async () => {
    const dependencies = createDependencies()
    dependencies.mediaService.prepareImageUpload.mockResolvedValue({
      provider: 'supabase',
      bucketName: 'event-submissions',
      objectKey: 'event-submissions/mock.jpg',
      assetUrl: 'https://project.supabase.co/storage/v1/object/public/event-submissions/event-submissions/mock.jpg',
      signedUploadUrl:
        'https://project.supabase.co/storage/v1/object/upload/sign/event-submissions/event-submissions/mock.jpg?token=mock-token',
      uploadToken: 'mock-token',
    })

    const service = createEventSubmissionService(dependencies)
    const result = await service.prepareUpload({
      filename: 'poster.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
    })

    expect(dependencies.mediaService.prepareImageUpload).toHaveBeenCalled()
    expect(result.objectKey).toContain('event-submissions')

    await expect(
      service.prepareUpload({
        filename: 'poster.gif',
        mimeType: 'image/gif',
        fileSize: 1024,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })
})
