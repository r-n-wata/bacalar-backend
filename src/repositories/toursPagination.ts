import type { TourCategory, TourItem } from '../types/content'

export type TourPaginationInput = {
  cursor?: string
  limit: number
  category?: TourCategory
}

type TourCursorPayload = {
  sortOrder: number
  slug: string
}

type TourListItem = TourItem & {
  sortOrder: number
  featuredOrder?: number | null
}

export function encodeToursCursor(payload: TourCursorPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeToursCursor(cursor?: string): TourCursorPayload | null {
  if (!cursor) {
    return null
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as TourCursorPayload

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

export function compareTourOrder(
  left: Pick<TourListItem, 'sortOrder' | 'id'>,
  right: Pick<TourListItem, 'sortOrder' | 'id'>,
) {
  const sortOrderComparison = left.sortOrder - right.sortOrder

  if (sortOrderComparison !== 0) {
    return sortOrderComparison
  }

  return left.id.localeCompare(right.id)
}

export function compareFeaturedTourOrder(
  left: Pick<TourListItem, 'featuredOrder' | 'sortOrder' | 'id'>,
  right: Pick<TourListItem, 'featuredOrder' | 'sortOrder' | 'id'>,
) {
  const featuredOrderComparison = compareFeaturedOrder(
    left.featuredOrder,
    right.featuredOrder,
  )

  if (featuredOrderComparison !== 0) {
    return featuredOrderComparison
  }

  return compareTourOrder(left, right)
}

function stripSortMetadata(item: TourListItem): TourItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    duration: item.duration,
    priceFrom: item.priceFrom,
    bestFor: item.bestFor,
    operatorName: item.operatorName,
    route: item.route,
    image: item.image,
  }
}

export function paginateTours(
  items: TourListItem[],
  { cursor, limit }: TourPaginationInput,
) {
  const orderedItems = [...items].sort(compareTourOrder)
  const cursorPayload = decodeToursCursor(cursor)
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
          ? encodeToursCursor({
              sortOrder: lastItem.sortOrder,
              slug: lastItem.id,
            })
          : null,
    },
  }
}

export function selectFeaturedTours(items: TourListItem[], limit = 5) {
  return [...items]
    .sort(compareFeaturedTourOrder)
    .slice(0, limit)
    .map(stripSortMetadata)
}
