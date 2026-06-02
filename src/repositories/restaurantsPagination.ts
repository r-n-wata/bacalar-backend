import type { RestaurantItem, RestaurantMoment } from '../types/content'

export type RestaurantPaginationInput = {
  cursor?: string
  limit: number
  category?: RestaurantMoment
}

type RestaurantCursorPayload = {
  sortOrder: number
  slug: string
}

type RestaurantListItem = RestaurantItem & {
  sortOrder: number
  featuredOrder?: number | null
}

export function encodeRestaurantsCursor(payload: RestaurantCursorPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeRestaurantsCursor(
  cursor?: string,
): RestaurantCursorPayload | null {
  if (!cursor) {
    return null
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as RestaurantCursorPayload

    if (
      typeof decoded.sortOrder !== 'number' ||
      typeof decoded.slug !== 'string'
    ) {
      return null
    }

    return decoded
  } catch {
    return null
  }
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

export function compareRestaurantOrder(
  left: Pick<RestaurantListItem, 'sortOrder' | 'id'>,
  right: Pick<RestaurantListItem, 'sortOrder' | 'id'>,
) {
  const sortOrderComparison = left.sortOrder - right.sortOrder

  if (sortOrderComparison !== 0) {
    return sortOrderComparison
  }

  return left.id.localeCompare(right.id)
}

export function compareFeaturedRestaurantOrder(
  left: Pick<RestaurantListItem, 'featuredOrder' | 'sortOrder' | 'id'>,
  right: Pick<RestaurantListItem, 'featuredOrder' | 'sortOrder' | 'id'>,
) {
  const featuredOrderComparison = compareFeaturedOrder(
    left.featuredOrder,
    right.featuredOrder,
  )

  if (featuredOrderComparison !== 0) {
    return featuredOrderComparison
  }

  return compareRestaurantOrder(left, right)
}

function stripSortMetadata(item: RestaurantListItem): RestaurantItem {
  return {
    id: item.id,
    name: item.name,
    cuisine: item.cuisine,
    vibe: item.vibe,
    priceBand: item.priceBand,
    moment: item.moment,
    route: item.route,
  }
}

export function paginateRestaurants(
  items: RestaurantListItem[],
  { cursor, limit }: RestaurantPaginationInput,
) {
  const orderedItems = [...items].sort(compareRestaurantOrder)
  const cursorPayload = decodeRestaurantsCursor(cursor)
  const startIndex = cursorPayload
    ? orderedItems.findIndex(
        (item) =>
          item.id === cursorPayload.slug &&
          item.sortOrder === cursorPayload.sortOrder,
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
          ? encodeRestaurantsCursor({
              sortOrder: lastItem.sortOrder,
              slug: lastItem.id,
            })
          : null,
    },
  }
}

export function selectFeaturedRestaurants(items: RestaurantListItem[], limit = 5) {
  return [...items]
    .sort(compareFeaturedRestaurantOrder)
    .slice(0, limit)
    .map(stripSortMetadata)
}
