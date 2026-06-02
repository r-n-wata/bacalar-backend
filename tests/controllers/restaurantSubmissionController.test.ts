import { describe, expect, it, vi } from 'vitest'
import { createRestaurantSubmissionController } from '../../src/controllers/restaurantSubmissionController'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('restaurantSubmissionController', () => {
  it('returns a created submission response', async () => {
    const service = {
      createSubmission: vi.fn().mockResolvedValue({
        id: 'submission-1',
        status: 'PENDING',
        createdAt: '2026-05-25T12:00:00.000Z',
      }),
      prepareUpload: vi.fn(),
    }
    const controller = createRestaurantSubmissionController(service)
    const response = createResponse()

    await controller.createSubmission(
      {
        body: {
          name: 'Bruma Azul',
        },
      } as never,
      response as never,
    )

    expect(service.createSubmission).toHaveBeenCalledWith({
      name: 'Bruma Azul',
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
        objectKey: 'restaurant-images/mock.jpg',
        assetUrl:
          'https://project.supabase.co/storage/v1/object/public/event-submissions/restaurant-images/mock.jpg',
        signedUploadUrl:
          'https://project.supabase.co/storage/v1/object/upload/sign/event-submissions/restaurant-images/mock.jpg?token=mock-token',
        uploadToken: 'mock-token',
      }),
    }
    const controller = createRestaurantSubmissionController(service)
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
      expect.objectContaining({ objectKey: 'restaurant-images/mock.jpg' }),
    )
  })
})
