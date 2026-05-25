import { describe, expect, it, vi } from 'vitest'
import type { ContentRepositories } from '../../src/repositories/interfaces'
import { createContentService } from '../../src/services/contentService'
import { InMemoryCache } from '../../src/utils/cache'
import type { HomeContent } from '../../src/types/content'

describe('contentService', () => {
  it('reuses cached content for repeated reads', async () => {
    const homePayload: HomeContent = {
      hero: { eyebrow: 'a', title: 'b', description: 'c' },
      spotlight: {
        actions: [
          { key: 'events', label: 'Events' },
          { key: 'restaurants', label: 'Restaurants' },
          { key: 'tours', label: 'Tours' },
        ],
        entries: {
          events: { title: 'a', description: 'b', route: '/events', cta: 'c', metrics: [] },
          restaurants: { title: 'a', description: 'b', route: '/restaurants', cta: 'c', metrics: [] },
          tours: { title: 'a', description: 'b', route: '/tours', cta: 'c', metrics: [] },
        },
      },
      featuredExperiences: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
      diningMoments: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
      weeklyHappenings: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
    }
    const home = vi.fn(async () => homePayload)

    const repositories: ContentRepositories = {
      home: { getHomeContent: home },
      events: {
        getEventsContent: vi.fn() as never,
        getEventDetail: vi.fn() as never,
      },
      restaurants: {
        getRestaurantsContent: vi.fn() as never,
        getRestaurantDetail: vi.fn() as never,
      },
      tours: {
        getToursContent: vi.fn() as never,
        getTourDetail: vi.fn() as never,
      },
    }

    const service = createContentService(repositories, new InMemoryCache())

    await service.getHome('en')
    await service.getHome('en')

    expect(home).toHaveBeenCalledTimes(1)
  })

  it('caches repeated tour detail reads by id and language', async () => {
    const detailPayload = {
      id: 'tour-sailing',
      name: 'Private Sailing at Sunrise',
      category: 'Premium',
      durationHours: 4,
      priceFrom: 2100,
      description: 'A quiet sunrise departure.',
      route: '/tours/tour-sailing',
    }
    const getTourDetail = vi.fn(async () => detailPayload)

    const repositories: ContentRepositories = {
      home: { getHomeContent: vi.fn() as never },
      events: {
        getEventsContent: vi.fn() as never,
        getEventDetail: vi.fn() as never,
      },
      restaurants: {
        getRestaurantsContent: vi.fn() as never,
        getRestaurantDetail: vi.fn() as never,
      },
      tours: {
        getToursContent: vi.fn() as never,
        getTourDetail,
      },
    }

    const service = createContentService(repositories, new InMemoryCache())

    await service.getTourDetail('tour-sailing', 'en')
    await service.getTourDetail('tour-sailing', 'en')

    expect(getTourDetail).toHaveBeenCalledTimes(1)
    expect(getTourDetail).toHaveBeenCalledWith('tour-sailing', 'en')
  })
})
