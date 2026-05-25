import type { EventCategory, EventItem } from '../types/content'

export type EventPaginationInput = {
  cursor?: string
  limit: number
  category?: EventCategory
}

type EventCursorPayload = {
  startsAt: string | null
  sortOrder: number
  slug: string
}

type EventListItem = EventItem & {
  sortOrder: number
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

export function sortEventsDeterministically(items: EventListItem[]) {
  return [...items].sort(compareEventOrder)
}

function stripSortOrder(item: EventListItem): EventItem {
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
    items: pageItems.map(stripSortOrder),
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
