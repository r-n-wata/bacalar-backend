import { describe, expect, it } from 'vitest'
import {
  paginateTours,
  selectFeaturedTours,
} from '../../src/repositories/toursPagination'

const tours = [
  {
    id: 'tour-sailing',
    name: 'Private Sailing at Sunrise',
    category: 'premium' as const,
    categoryLabel: 'Premium',
    durationHours: 4,
    priceFrom: 2100,
    route: '/tours/tour-sailing',
    sortOrder: 2,
    featuredOrder: 1,
  },
  {
    id: 'tour-pontoon',
    name: 'Family Pontoon Loop',
    category: 'group' as const,
    categoryLabel: 'Group',
    durationHours: 3,
    priceFrom: 1450,
    route: '/tours/tour-pontoon',
    sortOrder: 1,
    featuredOrder: 0,
  },
  {
    id: 'tour-kayak',
    name: 'Guided Mangrove Kayak',
    category: 'adventure' as const,
    categoryLabel: 'Adventure',
    durationHours: 2,
    priceFrom: 680,
    route: '/tours/tour-kayak',
    sortOrder: 3,
    featuredOrder: 2,
  },
]

describe('toursPagination', () => {
  it('selects featured tours by featured order', () => {
    expect(selectFeaturedTours(tours, 2).map((item) => item.id)).toEqual([
      'tour-pontoon',
      'tour-sailing',
    ])
  })

  it('paginates tours deterministically', () => {
    const firstPage = paginateTours(tours, { limit: 2 })

    expect(firstPage.items.map((item) => item.id)).toEqual([
      'tour-pontoon',
      'tour-sailing',
    ])
    expect(firstPage.pagination.hasMore).toBe(true)

    const secondPage = paginateTours(tours, {
      limit: 2,
      cursor: firstPage.pagination.nextCursor ?? undefined,
    })

    expect(secondPage.items.map((item) => item.id)).toEqual(['tour-kayak'])
    expect(secondPage.pagination.hasMore).toBe(false)
  })

  it('paginates a filtered tour subset', () => {
    const filteredTours = tours.filter((tour) => tour.category === 'group')

    const firstPage = paginateTours(filteredTours, {
      limit: 1,
      category: 'group',
    })

    expect(firstPage.items.map((item) => item.id)).toEqual(['tour-pontoon'])
    expect(firstPage.pagination.hasMore).toBe(false)
  })
})
