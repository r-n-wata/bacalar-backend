import { describe, expect, it } from 'vitest'
import {
  loadRestaurantSeedWorkbook,
  normalizeRestaurantSeedRows,
} from '../../src/data/restaurantSeedWorkbook'

describe('restaurantSeedWorkbook', () => {
  it('loads the repo-owned workbook and normalizes restaurant rows', () => {
    const rows = loadRestaurantSeedWorkbook()

    expect(rows).toHaveLength(20)
    expect(rows[0]).toMatchObject({
      slug: 'la-playita',
      priceBand: '$$',
      moments: ['lunch', 'dinner'],
      isFeatured: true,
      featuredOrder: 0,
      en: {
        name: 'La Playita',
        vibe: 'Lagoon-front seafood classics',
      },
    })
  })

  it('parses combined dining moments into distinct enum values', () => {
    const rows = normalizeRestaurantSeedRows([
      {
        'Restaurant name': 'Laguna Table',
        Cuisine: 'Mexican',
        'Dining moment': 'Breakfast & Dinner',
        'Price band': '$$',
        Description: 'Description',
        Vibe: 'Vibe',
        'Featured order': '2',
        'Contact name': null,
        'Primary contact method': null,
        Instagram: null,
        WhatsApp: null,
      },
    ])

    expect(rows[0]?.moments).toEqual(['breakfast', 'dinner'])
    expect(rows[0]?.featuredOrder).toBe(1)
  })

  it('rejects rows that are missing required columns', () => {
    expect(() =>
      normalizeRestaurantSeedRows([
        {
          'Restaurant name': 'Laguna Table',
          Cuisine: 'Mexican',
          'Dining moment': 'Dinner',
          'Price band': '$$',
          Description: 'Description',
        },
      ] as never),
    ).toThrow(/missing required columns: Vibe, Featured order/i)
  })

  it('rejects submission-only contact fields in the published seed path', () => {
    expect(() =>
      normalizeRestaurantSeedRows([
        {
          'Restaurant name': 'Laguna Table',
          Cuisine: 'Mexican',
          'Dining moment': 'Dinner',
          'Price band': '$$',
          Description: 'Description',
          Vibe: 'Vibe',
          'Featured order': '',
          'Contact name': 'Ana',
          'Primary contact method': null,
          Instagram: null,
          WhatsApp: null,
        },
      ]),
    ).toThrow(/submission-only data/i)
  })
})
