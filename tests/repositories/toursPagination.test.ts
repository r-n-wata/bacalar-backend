import { describe, expect, it } from 'vitest'
import {
  paginateTours,
  selectFeaturedTours,
} from '../../src/repositories/toursPagination'

const tours = [
  {
    id: 'tour-sailing',
    name: 'Private Sailing at Sunrise',
    category: 'Sailing',
    duration: '4 hours',
    priceFrom: 'From MXN 2,800',
    bestFor: 'Sunrise',
    operatorName: 'Laguna Vela',
    route: '/tours/tour-sailing',
    sortOrder: 2,
    featuredOrder: 1,
  },
  {
    id: 'tour-pontoon',
    name: 'Family Pontoon Loop',
    category: 'Boat Tour',
    duration: '3 hours',
    priceFrom: 'From MXN 1,600',
    bestFor: 'Families',
    operatorName: 'Casa Ponton',
    route: '/tours/tour-pontoon',
    sortOrder: 1,
    featuredOrder: 0,
  },
  {
    id: 'tour-kayak',
    name: 'Guided Mangrove Kayak',
    category: 'Kayak Tour',
    duration: '2 hours',
    priceFrom: 'From MXN 900',
    bestFor: 'Nature',
    operatorName: 'Manglar Guides',
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
    const filteredTours = tours.filter(
      (tour) => tour.category === 'Boat Tour',
    )

    const firstPage = paginateTours(filteredTours, {
      limit: 1,
      category: 'Boat Tour',
    })

    expect(firstPage.items.map((item) => item.id)).toEqual(['tour-pontoon'])
    expect(firstPage.pagination.hasMore).toBe(false)
  })
})
