import { describe, expect, it } from 'vitest'
import {
  compareEventOrder,
  decodeEventsCursor,
  paginateEvents,
} from '../../src/repositories/eventsPagination'

const events = [
  {
    id: 'event-c',
    title: 'Untimed gathering',
    dateLabel: 'Soon',
    venue: 'Plaza',
    category: 'food' as const,
    route: '/events/event-c',
    sortOrder: 0,
  },
  {
    id: 'event-b',
    title: 'Second timed',
    dateLabel: 'Saturday',
    venue: 'Deck',
    category: 'music' as const,
    startsAt: '2026-05-30T10:30:00-05:00',
    route: '/events/event-b',
    sortOrder: 4,
  },
  {
    id: 'event-a',
    title: 'First timed',
    dateLabel: 'Friday',
    venue: 'Garden',
    category: 'wellness' as const,
    startsAt: '2026-05-30T10:30:00-05:00',
    route: '/events/event-a',
    sortOrder: 2,
  },
]

describe('eventsPagination', () => {
  it('sorts deterministically with startsAt, sortOrder, and slug tie-breaks', () => {
    expect(compareEventOrder(events[0], events[1])).toBeGreaterThan(0)
    expect(compareEventOrder(events[1], events[2])).toBeGreaterThan(0)
  })

  it('paginates without skipping or duplicating items', () => {
    const firstPage = paginateEvents(events, { limit: 2 })

    expect(firstPage.items.map((item) => item.id)).toEqual([
      'event-a',
      'event-b',
    ])
    expect(firstPage.pagination.hasMore).toBe(true)

    const cursor = firstPage.pagination.nextCursor

    expect(cursor).toBeTruthy()
    expect(decodeEventsCursor(cursor ?? undefined)).toMatchObject({
      slug: 'event-b',
      sortOrder: 4,
    })

    const secondPage = paginateEvents(events, {
      limit: 2,
      cursor: cursor ?? undefined,
    })

    expect(secondPage.items.map((item) => item.id)).toEqual(['event-c'])
    expect(secondPage.pagination.hasMore).toBe(false)
    expect(secondPage.pagination.nextCursor).toBeNull()
  })

  it('supports category-filtered pagination inputs without changing ordering rules', () => {
    const filteredEvents = events.filter((event) => event.category === 'music')
    const firstPage = paginateEvents(filteredEvents, {
      limit: 1,
      category: 'music',
    })

    expect(firstPage.items.map((item) => item.id)).toEqual(['event-b'])
    expect(firstPage.pagination.hasMore).toBe(false)
  })
})
