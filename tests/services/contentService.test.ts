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
          { key: 'booking', label: 'Booking' },
        ],
        entries: {
          events: { title: 'a', description: 'b', route: '/events', cta: 'c', metrics: [] },
          restaurants: { title: 'a', description: 'b', route: '/restaurants', cta: 'c', metrics: [] },
          tours: { title: 'a', description: 'b', route: '/tours', cta: 'c', metrics: [] },
          booking: { title: 'a', description: 'b', route: '/booking', cta: 'c', metrics: [] },
        },
      },
      planningCallout: { eyebrow: 'a', title: 'b', description: 'c', items: [] },
      featuredExperiences: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
      diningMoments: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
      weeklyHappenings: { intro: { eyebrow: 'a', title: 'b', description: 'c' }, items: [] },
      bookingCta: {
        eyebrow: 'a',
        title: 'b',
        description: 'c',
        primaryAction: { label: 'one', route: '/a' },
        secondaryAction: { label: 'two', route: '/b' },
      },
    }
    const home = vi.fn(async () => homePayload)

    const repositories: ContentRepositories = {
      home: { getHomeContent: home },
      events: { getEventsContent: vi.fn() as never },
      restaurants: { getRestaurantsContent: vi.fn() as never },
      tours: { getToursContent: vi.fn() as never },
    }

    const service = createContentService(repositories, new InMemoryCache())

    await service.getHome('en')
    await service.getHome('en')

    expect(home).toHaveBeenCalledTimes(1)
  })
})
