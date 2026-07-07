import { describe, expect, it } from 'vitest'
import {
  loadTourSeedWorkbook,
  normalizeTourSeedRows,
} from '../../src/data/tourSeedWorkbook'

describe('tourSeedWorkbook', () => {
  it('loads the repo-owned workbook and normalizes tour rows with operator fields', () => {
    const rows = loadTourSeedWorkbook()

    expect(rows).toHaveLength(20)
    expect(rows[0]).toMatchObject({
      slug: 'sunrise-paddle-board',
      category: 'Paddle Boarding',
      duration: '2 hours',
      priceFrom: '$$',
      privateOrShared: 'Shared',
      operatorName: 'Bacalar Sunrise',
      imageUrls: [],
      en: {
        name: 'Sunrise Paddle Board',
      },
    })
  })

  it('parses imageUrls and preserves optional operator fields', () => {
    const rows = normalizeTourSeedRows([
      {
        tourName: 'Lagoon Sail',
        category: 'Sailing',
        duration: '4 hours',
        priceFrom: 'From MXN 2,800',
        privateOrShared: 'Private',
        bestFor: 'Couples',
        difficulty: 'Easy',
        suitableForKids: 'Yes',
        description: 'A calm sail.',
        operatorName: 'Laguna Vela',
        operatorDescription: 'Small sailing crew.',
        operatorWhatsapp: '+52 983 123 4567',
        operatorInstagram: '@lagunavela',
        operatorWebsite: 'https://lagunavela.example.com',
        operatorPrimaryContactMethod: 'WhatsApp',
        meetingPoint: 'Main dock',
        included: 'Captain and water',
        whatToBring: 'Towel',
        imageUrls: 'https://a.test/1.jpg,\nhttps://a.test/2.jpg',
        featured: 'yes',
        featuredOrder: '2',
      },
    ])

    expect(rows[0]?.imageUrls).toEqual([
      'https://a.test/1.jpg',
      'https://a.test/2.jpg',
    ])
    expect(rows[0]?.operatorWhatsapp).toBe('+52 983 123 4567')
    expect(rows[0]?.en.operatorDescription).toBe('Small sailing crew.')
    expect(rows[0]?.featuredOrder).toBe(1)
  })

  it('accepts missing optional contact fields and missing images', () => {
    const rows = normalizeTourSeedRows([
      {
        tourName: 'Lagoon Kayak',
        category: 'Kayak Tour',
        duration: '2 hours',
        priceFrom: 'From MXN 900',
        privateOrShared: 'Shared',
        bestFor: 'Nature',
        difficulty: 'Moderate',
        suitableForKids: 'Older kids',
        description: 'A short paddle.',
        operatorName: 'Manglar Guides',
      },
    ])

    expect(rows[0]?.imageUrls).toEqual([])
    expect(rows[0]?.operatorWhatsapp).toBeUndefined()
    expect(rows[0]?.en.included).toBeUndefined()
  })

  it('rejects missing required headers', () => {
    expect(() =>
      normalizeTourSeedRows([
        {
          tourName: 'Lagoon Kayak',
          category: 'Kayak Tour',
          duration: '2 hours',
        },
      ] as never),
    ).toThrow(/missing required columns: priceFrom, privateOrShared, bestFor, difficulty, suitableForKids, description, operatorName/i)
  })

  it('rejects missing required row values with row numbers', () => {
    expect(() =>
      normalizeTourSeedRows([
        {
          tourName: 'Lagoon Kayak',
          category: 'Kayak Tour',
          duration: '2 hours',
          priceFrom: 'From MXN 900',
          privateOrShared: 'Shared',
          bestFor: 'Nature',
          difficulty: 'Moderate',
          suitableForKids: 'Older kids',
          description: '',
          operatorName: 'Manglar Guides',
        },
      ]),
    ).toThrow(/Missing description on row 2/i)
  })
})
