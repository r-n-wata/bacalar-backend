function normalizeItem(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 0 ? normalized : null
}

export function normalizeIncludedItems(
  values?: string[] | null,
) {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => normalizeItem(String(value)))
    .filter((value): value is string => value !== null)
}

export function parseLegacyIncludedText(value?: string | null) {
  if (!value) {
    return []
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => normalizeItem(item))
    .filter((item): item is string => item !== null)
}

export function resolveIncludedItems(
  values?: string[] | null,
  legacyValue?: string | null,
) {
  const normalizedItems = normalizeIncludedItems(values)

  if (normalizedItems.length > 0) {
    return normalizedItems
  }

  return parseLegacyIncludedText(legacyValue)
}

export function serializeIncludedItems(
  values?: string[] | null,
) {
  const normalizedItems = normalizeIncludedItems(values)
  return normalizedItems.length > 0 ? normalizedItems.join('\n') : undefined
}
