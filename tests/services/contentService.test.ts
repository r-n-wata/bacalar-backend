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
      featuredTours: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
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
      category: 'Sailing',
      duration: '4 hours',
      priceFrom: 'From MXN 2,800',
      privateOrShared: 'Private',
      bestFor: 'Sunrise',
      difficulty: 'Easy',
      suitableForKids: 'Yes',
      description: 'A quiet sunrise departure.',
      imageUrls: [],
      operatorName: 'Laguna Vela',
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

  it('caches paginated tour reads by language, category, and cursor', async () => {
    const listPayload = {
      eyebrow: 'Tours',
      title: 'Lagoon plans',
      description: 'Desc',
      categories: ['Sailing', 'Kayaking'],
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: false,
        nextCursor: null,
      },
    }
    const getToursContent = vi.fn(async () => listPayload)

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
        getToursContent,
        getTourDetail: vi.fn() as never,
      },
    }

    const service = createContentService(repositories, new InMemoryCache())

    await service.getTours('en', { limit: 2, category: 'Sailing' })
    await service.getTours('en', { limit: 2, category: 'Sailing' })
    await service.getTours('en', {
      limit: 2,
      cursor: 'next-page',
      category: 'Sailing',
    })
    await service.getTours('en', { limit: 2, category: 'Kayak Tour' })

    expect(getToursContent).toHaveBeenCalledTimes(3)
    expect(getToursContent).toHaveBeenNthCalledWith(1, 'en', {
      limit: 2,
      category: 'Sailing',
    })
    expect(getToursContent).toHaveBeenNthCalledWith(2, 'en', {
      limit: 2,
      cursor: 'next-page',
      category: 'Sailing',
    })
    expect(getToursContent).toHaveBeenNthCalledWith(3, 'en', {
      limit: 2,
      category: 'Kayak Tour',
    })
  })

  it('caches paginated event reads by language, category, and cursor', async () => {
    const listPayload = {
      eyebrow: 'Events',
      title: 'This week in Bacalar',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: false,
        nextCursor: null,
      },
    }
    const getEventsContent = vi.fn(async () => listPayload)

    const repositories: ContentRepositories = {
      home: { getHomeContent: vi.fn() as never },
      events: {
        getEventsContent,
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

    await service.getEvents('en', { limit: 6, category: 'music' })
    await service.getEvents('en', { limit: 6, category: 'music' })
    await service.getEvents('en', {
      limit: 6,
      cursor: 'next-page',
      category: 'music',
    })
    await service.getEvents('en', { limit: 6, category: 'food' })

    expect(getEventsContent).toHaveBeenCalledTimes(3)
    expect(getEventsContent).toHaveBeenNthCalledWith(1, 'en', {
      limit: 6,
      category: 'music',
    })
    expect(getEventsContent).toHaveBeenNthCalledWith(2, 'en', {
      limit: 6,
      cursor: 'next-page',
      category: 'music',
    })
    expect(getEventsContent).toHaveBeenNthCalledWith(3, 'en', {
      limit: 6,
      category: 'food',
    })
  })

  it('caches paginated restaurant reads by language, category, and cursor', async () => {
    const listPayload = {
      eyebrow: 'Restaurants',
      title: 'Dining moments',
      description: 'Desc',
      featuredItems: [],
      items: [],
      pagination: {
        hasMore: false,
        nextCursor: null,
      },
    }
    const getRestaurantsContent = vi.fn(async () => listPayload)

    const repositories: ContentRepositories = {
      home: { getHomeContent: vi.fn() as never },
      events: {
        getEventsContent: vi.fn() as never,
        getEventDetail: vi.fn() as never,
      },
      restaurants: {
        getRestaurantsContent,
        getRestaurantDetail: vi.fn() as never,
      },
      tours: {
        getToursContent: vi.fn() as never,
        getTourDetail: vi.fn() as never,
      },
    }

    const service = createContentService(repositories, new InMemoryCache())

    await service.getRestaurants('en', { limit: 2, category: 'breakfast' })
    await service.getRestaurants('en', { limit: 2, category: 'breakfast' })
    await service.getRestaurants('en', {
      limit: 2,
      cursor: 'next-page',
      category: 'breakfast',
    })
    await service.getRestaurants('en', { limit: 2, category: 'dinner' })

    expect(getRestaurantsContent).toHaveBeenCalledTimes(3)
    expect(getRestaurantsContent).toHaveBeenNthCalledWith(1, 'en', {
      limit: 2,
      category: 'breakfast',
    })
    expect(getRestaurantsContent).toHaveBeenNthCalledWith(2, 'en', {
      limit: 2,
      cursor: 'next-page',
      category: 'breakfast',
    })
    expect(getRestaurantsContent).toHaveBeenNthCalledWith(3, 'en', {
      limit: 2,
      category: 'dinner',
    })
  })
})
