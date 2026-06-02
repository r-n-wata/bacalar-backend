import { describe, expect, it, vi } from 'vitest'
import { createContentController } from '../../src/controllers/contentController'
import { getHealth } from '../../src/controllers/healthController'
import type { HomeContent } from '../../src/types/content'

function createResponse() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }

  return response
}

describe('contentController', () => {
  it('returns health status', () => {
    const response = createResponse()

    getHealth({} as never, response as never)

    expect(response.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'bacalar-backend',
    })
  })

  it('returns localized home content', async () => {
    const homeContent: HomeContent = {
      hero: {
        eyebrow: 'Planea Bacalar con intencion',
        title: 'Inicio',
        description: 'Descripcion',
      },
      spotlight: {
        actions: [
          { key: 'events', label: 'Eventos' },
          { key: 'restaurants', label: 'Restaurantes' },
          { key: 'tours', label: 'Tours' },
        ],
        entries: {
          events: { title: 'a', description: 'b', route: '/events', cta: 'c', metrics: [] },
          restaurants: { title: 'a', description: 'b', route: '/restaurants', cta: 'c', metrics: [] },
          tours: { title: 'a', description: 'b', route: '/tours', cta: 'c', metrics: [] },
        },
      },
      featuredExperiences: {
        intro: { eyebrow: 'x', title: 'y', description: 'z' },
        items: [],
      },
      diningMoments: {
        intro: { eyebrow: 'x', title: 'y', description: 'z' },
        items: [],
      },
      weeklyHappenings: {
        intro: { eyebrow: 'x', title: 'y', description: 'z' },
        items: [],
      },
    }

    const contentService = {
      getHome: vi.fn().mockResolvedValue(homeContent),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getHome(
      {
        query: { lang: 'es' },
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getHome).toHaveBeenCalledWith('es')
    expect(response.json).toHaveBeenCalledWith(homeContent)
  })

  it('falls back to english for events when no locale is provided', async () => {
    const payload = {
      eyebrow: 'Events feature',
      title: 'Recent and upcoming events',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: false,
        nextCursor: null,
      },
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn().mockResolvedValue(payload),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getEvents(
      {
        query: {},
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getEvents).toHaveBeenCalledWith('en', {
      limit: 10,
      cursor: undefined,
      category: undefined,
    })
    expect(response.json).toHaveBeenCalledWith(payload)
  })

  it('passes deterministic pagination inputs for events', async () => {
    const payload = {
      eyebrow: 'Events feature',
      title: 'Recent and upcoming events',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: true,
        nextCursor: 'next-cursor',
      },
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn().mockResolvedValue(payload),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getEvents(
      {
        query: {
          lang: 'es',
          limit: '9',
          cursor: 'cursor-token',
          category: 'music',
        },
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getEvents).toHaveBeenCalledWith('es', {
      limit: 9,
      cursor: 'cursor-token',
      category: 'music',
    })
    expect(response.json).toHaveBeenCalledWith(payload)
  })

  it('falls back to english and default pagination for restaurants when no locale is provided', async () => {
    const payload = {
      eyebrow: 'Restaurants feature',
      title: 'Dining moments',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: false,
        nextCursor: null,
      },
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn().mockResolvedValue(payload),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getRestaurants(
      {
        query: {},
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getRestaurants).toHaveBeenCalledWith('en', {
      limit: 2,
      cursor: undefined,
      category: undefined,
    })
    expect(response.json).toHaveBeenCalledWith(payload)
  })

  it('passes deterministic pagination inputs for restaurants', async () => {
    const payload = {
      eyebrow: 'Restaurants feature',
      title: 'Dining moments',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: true,
        nextCursor: 'next-cursor',
      },
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn().mockResolvedValue(payload),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getRestaurants(
      {
        query: {
          lang: 'es',
          limit: '3',
          cursor: 'cursor-token',
          category: 'breakfast',
        },
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getRestaurants).toHaveBeenCalledWith('es', {
      limit: 3,
      cursor: 'cursor-token',
      category: 'breakfast',
    })
    expect(response.json).toHaveBeenCalledWith(payload)
  })

  it('rejects unsupported restaurant category query parameters', async () => {
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await expect(
      controller.getRestaurants(
        {
          query: {
            category: 'brunch',
          },
          headers: {},
        } as never,
        response as never,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('returns a localized tour detail payload', async () => {
    const payload = {
      id: 'tour-sailing',
      name: 'Private Sailing at Sunrise',
      category: 'premium',
      categoryLabel: 'Premium',
      durationHours: 4,
      priceFrom: 2100,
      description: 'A quiet sunrise departure.',
      route: '/tours/tour-sailing',
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn().mockResolvedValue(payload),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getTourDetail(
      {
        params: { id: 'tour-sailing' },
        query: { lang: 'es' },
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getTourDetail).toHaveBeenCalledWith(
      'tour-sailing',
      'es',
    )
    expect(response.json).toHaveBeenCalledWith(payload)
  })

  it('passes deterministic pagination inputs for tours', async () => {
    const payload = {
      eyebrow: 'Tours feature',
      title: 'Lagoon plans',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: true,
        nextCursor: 'next-cursor',
      },
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn().mockResolvedValue(payload),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await controller.getTours(
      {
        query: {
          lang: 'es',
          limit: '3',
          cursor: 'cursor-token',
          category: 'premium',
        },
        headers: {},
      } as never,
      response as never,
    )

    expect(contentService.getTours).toHaveBeenCalledWith('es', {
      limit: 3,
      cursor: 'cursor-token',
      category: 'premium',
    })
    expect(response.json).toHaveBeenCalledWith(payload)
  })

  it('rejects unsupported tour category query parameters', async () => {
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn(),
      getEventDetail: vi.fn(),
      getRestaurants: vi.fn(),
      getRestaurantDetail: vi.fn(),
      getTours: vi.fn(),
      getTourDetail: vi.fn(),
    }
    const controller = createContentController({
      contentService,
      defaultLanguage: 'en',
    })
    const response = createResponse()

    await expect(
      controller.getTours(
        {
          query: {
            category: 'sailing',
          },
          headers: {},
        } as never,
        response as never,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
    })
  })
})
