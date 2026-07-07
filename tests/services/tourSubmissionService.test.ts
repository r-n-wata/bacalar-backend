import { describe, expect, it, vi } from 'vitest'
import { createTourSubmissionService } from '../../src/services/tourSubmissionService'
import type { TourSubmissionRecord } from '../../src/types/tourSubmissions'

function createSubmissionRecord(
  overrides: Partial<TourSubmissionRecord> = {},
): TourSubmissionRecord {
  return {
    id: 'tour-submission-1',
    name: 'Sunrise Sail',
    category: 'premium',
    durationHours: 4,
    priceFrom: 2100,
    description:
      'A private sunrise sailing tour with a calm route and a polished crew handoff.',
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

describe('tourSubmissionService', () => {
  it('persists valid submissions as pending and notifies admin', async () => {
    const dependencies = createDependencies()
    dependencies.repository.createSubmission.mockResolvedValue(
      createSubmissionRecord({
        images: [
          {
            id: 'image-1',
            source: 'UPLOADED',
            url: 'https://assets.example.com/a.jpg',
            objectKey: 'tour-images/a.jpg',
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

    const service = createTourSubmissionService(dependencies)
    const result = await service.createSubmission({
      name: 'Sunrise Sail',
      category: 'premium',
      durationHours: 4,
      priceFrom: 2100,
      description:
        'A private sunrise sailing tour with a calm route and a polished crew handoff.',
      contactName: 'Maya Cruz',
      contactMethod: 'maya@example.com',
      submittedLocale: 'en',
      media: [
        {
          kind: 'uploaded',
          url: 'https://assets.example.com/a.jpg',
          objectKey: 'tour-images/a.jpg',
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
        category: 'premium',
        durationHours: 4,
        priceFrom: 2100,
        media: [
          expect.objectContaining({ kind: 'uploaded' }),
          { kind: 'external', url: 'https://images.example.com/b.webp' },
        ],
      }),
    )
    expect(dependencies.externalImageValidator.validate).toHaveBeenCalledWith(
      'https://images.example.com/b.webp',
    )
    expect(dependencies.adminNotifier.notifyTourSubmission).toHaveBeenCalled()
    expect(result).toEqual({
      id: 'tour-submission-1',
      status: 'PENDING',
      createdAt: '2026-05-25T12:00:00.000Z',
    })
  })

  it('does not roll back the submission when email notification fails', async () => {
    const dependencies = createDependencies()
    dependencies.repository.createSubmission.mockResolvedValue(createSubmissionRecord())
    dependencies.adminNotifier.notifyTourSubmission.mockRejectedValue(
      new Error('smtp-down'),
    )

    const service = createTourSubmissionService(dependencies)
    const result = await service.createSubmission({
      name: 'Sunrise Sail',
      category: 'premium',
      durationHours: 4,
      priceFrom: 2100,
      description:
        'A private sunrise sailing tour with a calm route and a polished crew handoff.',
      contactName: 'Maya Cruz',
      contactMethod: 'maya@example.com',
      submittedLocale: 'en',
      media: [],
    })

    expect(result.status).toBe('PENDING')
    expect(dependencies.logger.error).toHaveBeenCalledWith(
      'submission-admin-notification-failed',
      expect.objectContaining({ submissionId: 'tour-submission-1' }),
    )
  })

  it('rejects invalid payloads with structured validation details', async () => {
    const service = createTourSubmissionService(createDependencies())

    await expect(
      service.createSubmission({
        name: '',
        category: 'premium',
        durationHours: 0,
        priceFrom: 0,
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

    const service = createTourSubmissionService(dependencies)

    await expect(
      service.createSubmission({
        name: 'Sunrise Sail',
        category: 'premium',
        durationHours: 4,
        priceFrom: 2100,
        description:
          'A private sunrise sailing tour with a calm route and a polished crew handoff.',
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
      objectKey: 'tour-images/mock.jpg',
      assetUrl:
        'https://project.supabase.co/storage/v1/object/public/event-submissions/tour-images/mock.jpg',
      signedUploadUrl:
        'https://project.supabase.co/storage/v1/object/upload/sign/event-submissions/tour-images/mock.jpg?token=mock-token',
      uploadToken: 'mock-token',
    })

    const service = createTourSubmissionService(dependencies)
    const result = await service.prepareUpload({
      filename: 'poster.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
    })

    expect(dependencies.mediaService.prepareImageUpload).toHaveBeenCalled()
    expect(result.objectKey).toContain('tour-images')

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
