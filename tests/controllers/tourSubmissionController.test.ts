import { describe, expect, it, vi } from 'vitest'
import { createTourSubmissionController } from '../../src/controllers/tourSubmissionController'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('tourSubmissionController', () => {
  it('returns a created submission response', async () => {
    const service = {
      createSubmission: vi.fn().mockResolvedValue({
        id: 'tour-submission-1',
        status: 'PENDING',
        createdAt: '2026-05-25T12:00:00.000Z',
      }),
      prepareUpload: vi.fn(),
    }
    const controller = createTourSubmissionController(service)
    const response = createResponse()

    await controller.createSubmission(
      {
        body: {
          name: 'Sunrise Sail',
        },
      } as never,
      response as never,
    )

    expect(service.createSubmission).toHaveBeenCalledWith({
      name: 'Sunrise Sail',
    })
    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.json).toHaveBeenCalledWith({
      id: 'tour-submission-1',
      status: 'PENDING',
      createdAt: '2026-05-25T12:00:00.000Z',
    })
  })

  it('returns upload preparation data', async () => {
    const service = {
      createSubmission: vi.fn(),
      prepareUpload: vi.fn().mockResolvedValue({
        provider: 'supabase',
        bucketName: 'event-submissions',
        objectKey: 'tour-images/mock.jpg',
        assetUrl:
          'https://project.supabase.co/storage/v1/object/public/event-submissions/tour-images/mock.jpg',
        signedUploadUrl:
          'https://project.supabase.co/storage/v1/object/upload/sign/event-submissions/tour-images/mock.jpg?token=mock-token',
        uploadToken: 'mock-token',
      }),
    }
    const controller = createTourSubmissionController(service)
    const response = createResponse()

    await controller.prepareUpload(
      {
        body: {
          filename: 'poster.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1200,
        },
      } as never,
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ objectKey: 'tour-images/mock.jpg' }),
    )
  })
})
