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
      planningCallout: {
        eyebrow: 'x',
        title: 'y',
        description: 'z',
        items: [],
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
      getRestaurants: vi.fn(),
      getTours: vi.fn(),
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
      items: [],
    }
    const contentService = {
      getHome: vi.fn(),
      getEvents: vi.fn().mockResolvedValue(payload),
      getRestaurants: vi.fn(),
      getTours: vi.fn(),
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

    expect(contentService.getEvents).toHaveBeenCalledWith('en')
    expect(response.json).toHaveBeenCalledWith(payload)
  })
})
