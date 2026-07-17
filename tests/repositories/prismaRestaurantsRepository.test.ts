import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrismaRepositories } from '../../src/repositories/prismaRepositories'

describe('prisma restaurant repositories', () => {
  const findUnique = vi.fn()
  const findMany = vi.fn()
  const findFirst = vi.fn()

  beforeEach(() => {
    findUnique.mockReset()
    findMany.mockReset()
    findFirst.mockReset()
  })

  it('filters restaurants by array membership for the category query', async () => {
    findUnique.mockResolvedValue({
      translations: [{ eyebrow: 'Restaurants', title: 'Where to eat', description: 'Desc' }],
    })
    findMany
      .mockResolvedValueOnce([
        {
          slug: 'la-playita',
          priceBand: '$$',
          moments: ['lunch', 'dinner'],
          sortOrder: 0,
          featuredOrder: 0,
          translations: [
            {
              locale: { code: 'en' },
              name: 'La Playita',
              cuisine: 'Seafood',
              vibe: 'Lagoon-front seafood classics',
              description: 'Desc',
            },
          ],
          approvedSubmissions: [],
        },
      ])
      .mockResolvedValueOnce([])

    const repositories = createPrismaRepositories({
      featurePage: { findUnique },
      restaurant: { findMany, findFirst },
    } as never)

    const result = await repositories.restaurants.getRestaurantsContent('en', {
      limit: 10,
      category: 'lunch',
    })

    expect(findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PUBLISHED',
          isFeatured: false,
          moments: { has: 'lunch' },
        }),
      }),
    )
    expect(result?.items[0]?.moments).toEqual(['lunch', 'dinner'])
  })

  it('falls back to english restaurant translations when spanish is missing', async () => {
    findFirst.mockResolvedValue({
      slug: 'la-playita',
      priceBand: '$$',
      moments: ['lunch', 'dinner'],
      translations: [
        {
          locale: { code: 'en' },
          name: 'La Playita',
          cuisine: 'Seafood',
          vibe: 'Lagoon-front seafood classics',
          description: 'Lagoon-side seafood and cocktails.',
        },
      ],
      approvedSubmissions: [],
    })

    const repositories = createPrismaRepositories({
      featurePage: { findUnique },
      restaurant: { findMany, findFirst },
    } as never)

    const result = await repositories.restaurants.getRestaurantDetail(
      'la-playita',
      'es',
    )

    expect(result).toMatchObject({
      name: 'La Playita',
      cuisine: 'Seafood',
      moments: ['lunch', 'dinner'],
      description: 'Lagoon-side seafood and cocktails.',
    })
  })
})
