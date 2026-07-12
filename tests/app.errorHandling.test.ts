import { describe, expect, it, vi } from 'vitest'
import { createContentController } from '../src/controllers/contentController'
import { createErrorHandler } from '../src/middlewares/errorHandler'
import { notFoundHandler } from '../src/middlewares/notFound'
import { HttpError } from '../src/utils/httpError'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('app error handling', () => {
  it('throws a stable 400 HttpError for unsupported language values', async () => {
    const controller = createContentController({
      contentService: {
        getHome: vi.fn(),
        getEvents: vi.fn(),
        getEventDetail: vi.fn(),
        getRestaurants: vi.fn(),
        getRestaurantDetail: vi.fn(),
        getTours: vi.fn(),
        getTourDetail: vi.fn(),
      },
      defaultLanguage: 'en',
    })

    await expect(
      controller.getEvents(
        {
          query: { lang: 'fr' },
          headers: {},
        } as never,
        createResponse() as never,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_LANGUAGE',
      message: 'Unsupported language query parameter',
    })
  })

  it('throws a stable 400 HttpError for unsupported event categories', async () => {
    const controller = createContentController({
      contentService: {
        getHome: vi.fn(),
        getEvents: vi.fn(),
        getEventDetail: vi.fn(),
        getRestaurants: vi.fn(),
        getRestaurantDetail: vi.fn(),
        getTours: vi.fn(),
        getTourDetail: vi.fn(),
      },
      defaultLanguage: 'en',
    })

    await expect(
      controller.getEvents(
        {
          query: { category: 'party' },
          headers: {},
        } as never,
        createResponse() as never,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'HTTP_ERROR',
      message: 'Unsupported event category query parameter',
    })
  })

  it('serializes missing event detail as the current 404 error envelope', () => {
    const errorHandler = createErrorHandler({
      info: vi.fn(),
      error: vi.fn(),
    })
    const response = createResponse()

    errorHandler(
      new HttpError(404, 'Content not found'),
      { method: 'GET', path: '/api/events/missing-event' } as never,
      response as never,
      vi.fn() as never,
    )

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'HTTP_ERROR',
        message: 'Content not found',
        details: undefined,
      },
    })
  })

  it('serializes unknown api routes with the current 404 not-found envelope', () => {
    const response = createResponse()

    notFoundHandler({} as never, response as never)

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Not found',
      },
    })
  })
})
