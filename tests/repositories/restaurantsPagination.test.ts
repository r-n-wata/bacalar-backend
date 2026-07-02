import { describe, expect, it } from 'vitest'
import {
  compareFeaturedRestaurantOrder,
  compareRestaurantOrder,
  decodeRestaurantsCursor,
  paginateRestaurants,
  selectFeaturedRestaurants,
} from '../../src/repositories/restaurantsPagination'
import type { RestaurantMoment } from '../../src/types/content'

const restaurants = [
  {
    id: 'rest-b',
    name: 'Ixchel Cocina',
    cuisine: 'Regional Mexican',
    vibe: 'Lunch stop',
    priceBand: '$$' as const,
    moments: ['lunch'] as RestaurantMoment[],
    route: '/restaurants/rest-b',
    sortOrder: 2,
    featuredOrder: 1,
  },
  {
    id: 'rest-a',
    name: 'Cielo de Maiz',
    cuisine: 'Vegetarian',
    vibe: 'Breakfast stop',
    priceBand: '$$' as const,
    moments: ['breakfast'] as RestaurantMoment[],
    route: '/restaurants/rest-a',
    sortOrder: 0,
    featuredOrder: 0,
  },
  {
    id: 'rest-c',
    name: 'Nao',
    cuisine: 'Seafood',
    vibe: 'Dinner stop',
    priceBand: '$$$' as const,
    moments: ['breakfast', 'dinner'] as RestaurantMoment[],
    route: '/restaurants/rest-c',
    sortOrder: 4,
    featuredOrder: 2,
  },
]

describe('restaurantsPagination', () => {
  it('sorts deterministically with sortOrder and slug tie-breaks', () => {
    expect(compareRestaurantOrder(restaurants[0], restaurants[1])).toBeGreaterThan(0)
    expect(compareRestaurantOrder(restaurants[1], restaurants[2])).toBeLessThan(0)
  })

  it('sorts featured restaurants by featuredOrder before fallback ordering', () => {
    expect(
      compareFeaturedRestaurantOrder(restaurants[0], restaurants[1]),
    ).toBeGreaterThan(0)
    expect(selectFeaturedRestaurants(restaurants, 2).map((item) => item.id)).toEqual([
      'rest-a',
      'rest-b',
    ])
  })

  it('paginates without skipping or duplicating items', () => {
    const firstPage = paginateRestaurants(restaurants, { limit: 2 })

    expect(firstPage.items.map((item) => item.id)).toEqual(['rest-a', 'rest-b'])
    expect(firstPage.pagination.hasMore).toBe(true)

    const cursor = firstPage.pagination.nextCursor

    expect(cursor).toBeTruthy()
    expect(decodeRestaurantsCursor(cursor ?? undefined)).toMatchObject({
      slug: 'rest-b',
      sortOrder: 2,
    })

    const secondPage = paginateRestaurants(restaurants, {
      limit: 2,
      cursor: cursor ?? undefined,
    })

    expect(secondPage.items.map((item) => item.id)).toEqual(['rest-c'])
    expect(secondPage.pagination.hasMore).toBe(false)
    expect(secondPage.pagination.nextCursor).toBeNull()
  })

  it('supports category-filtered pagination inputs without changing ordering rules', () => {
    const filteredRestaurants = restaurants.filter(
      (restaurant) => restaurant.moments.includes('dinner'),
    )
    const firstPage = paginateRestaurants(filteredRestaurants, {
      limit: 1,
      category: 'dinner',
    })

    expect(firstPage.items.map((item) => item.id)).toEqual(['rest-c'])
    expect(firstPage.pagination.hasMore).toBe(false)
  })
})
