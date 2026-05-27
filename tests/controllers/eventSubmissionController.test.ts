import { describe, expect, it, vi } from 'vitest'
import { createEventSubmissionController } from '../../src/controllers/eventSubmissionController'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('eventSubmissionController', () => {
  it('returns a created submission response', async () => {
    const service = {
      createSubmission: vi.fn().mockResolvedValue({
        id: 'submission-1',
        status: 'PENDING',
        createdAt: '2026-05-25T12:00:00.000Z',
      }),
      prepareUpload: vi.fn(),
    }
    const controller = createEventSubmissionController(service)
    const response = createResponse()

    await controller.createSubmission(
      {
        body: {
          title: 'Lagoon Story Night',
        },
      } as never,
      response as never,
    )

    expect(service.createSubmission).toHaveBeenCalledWith({
      title: 'Lagoon Story Night',
    })
    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.json).toHaveBeenCalledWith({
      id: 'submission-1',
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
        objectKey: 'event-submissions/mock.jpg',
        assetUrl:
          'https://project.supabase.co/storage/v1/object/public/event-submissions/event-submissions/mock.jpg',
        signedUploadUrl:
          'https://project.supabase.co/storage/v1/object/upload/sign/event-submissions/event-submissions/mock.jpg?token=mock-token',
        uploadToken: 'mock-token',
      }),
    }
    const controller = createEventSubmissionController(service)
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
      expect.objectContaining({ objectKey: 'event-submissions/mock.jpg' }),
    )
  })
})
