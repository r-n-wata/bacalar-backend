import type { EventCategory, EventItem } from '../types/content'

export type EventPaginationInput = {
  cursor?: string
  limit: number
  category?: EventCategory
  search?: string
}

type EventCursorPayload = {
  startsAt: string | null
  sortOrder: number
  slug: string
}

type EventListItem = EventItem & {
  sortOrder: number
  featuredOrder?: number | null
}

export function encodeEventsCursor(payload: EventCursorPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeEventsCursor(cursor?: string): EventCursorPayload | null {
  if (!cursor) {
    return null
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as EventCursorPayload

    if (
      typeof decoded.sortOrder !== 'number' ||
      typeof decoded.slug !== 'string' ||
      (decoded.startsAt !== null && typeof decoded.startsAt !== 'string')
    ) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

function compareStartsAt(left?: string, right?: string) {
  if (!left && !right) {
    return 0
  }

  if (!left) {
    return 1
  }

  if (!right) {
    return -1
  }

  return left.localeCompare(right)
}

function compareFeaturedOrder(left?: number | null, right?: number | null) {
  if (typeof left !== 'number' && typeof right !== 'number') {
    return 0
  }

  if (typeof left !== 'number') {
    return 1
  }

  if (typeof right !== 'number') {
    return -1
  }

  return left - right
}

export function compareEventOrder(
  left: Pick<EventListItem, 'startsAt' | 'sortOrder' | 'id'>,
  right: Pick<EventListItem, 'startsAt' | 'sortOrder' | 'id'>,
) {
  const startsAtComparison = compareStartsAt(left.startsAt, right.startsAt)

  if (startsAtComparison !== 0) {
    return startsAtComparison
  }

  const sortOrderComparison = left.sortOrder - right.sortOrder

  if (sortOrderComparison !== 0) {
    return sortOrderComparison
  }

  return left.id.localeCompare(right.id)
}

export function compareFeaturedEventOrder(
  left: Pick<EventListItem, 'featuredOrder' | 'startsAt' | 'sortOrder' | 'id'>,
  right: Pick<EventListItem, 'featuredOrder' | 'startsAt' | 'sortOrder' | 'id'>,
) {
  const featuredOrderComparison = compareFeaturedOrder(
    left.featuredOrder,
    right.featuredOrder,
  )

  if (featuredOrderComparison !== 0) {
    return featuredOrderComparison
  }

  return compareEventOrder(left, right)
}

export function sortEventsDeterministically(items: EventListItem[]) {
  return [...items].sort(compareEventOrder)
}

export function sortFeaturedEventsDeterministically(items: EventListItem[]) {
  return [...items].sort(compareFeaturedEventOrder)
}

function stripSortMetadata(item: EventListItem): EventItem {
  return {
    id: item.id,
    title: item.title,
    dateLabel: item.dateLabel,
    venue: item.venue,
    category: item.category,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    route: item.route,
  }
}

export function paginateEvents(
  items: EventListItem[],
  { cursor, limit }: EventPaginationInput,
) {
  const orderedItems = sortEventsDeterministically(items)
  const cursorPayload = decodeEventsCursor(cursor)
  const startIndex = cursorPayload
    ? orderedItems.findIndex(
        (item) =>
          item.id === cursorPayload.slug &&
          item.sortOrder === cursorPayload.sortOrder &&
          (item.startsAt ?? null) === cursorPayload.startsAt,
      ) + 1
    : 0

  const safeStartIndex = startIndex > 0 ? startIndex : 0
  const pageItems = orderedItems.slice(safeStartIndex, safeStartIndex + limit)
  const lastItem = pageItems.at(-1)
  const hasMore = safeStartIndex + pageItems.length < orderedItems.length

  return {
    items: pageItems.map(stripSortMetadata),
    pagination: {
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? encodeEventsCursor({
              startsAt: lastItem.startsAt ?? null,
              sortOrder: lastItem.sortOrder,
              slug: lastItem.id,
            })
          : null,
    },
  }
}

export function selectFeaturedEvents(items: EventListItem[], limit = 5) {
  return sortFeaturedEventsDeterministically(items).slice(0, limit).map(stripSortMetadata)
}
