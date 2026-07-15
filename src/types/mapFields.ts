import { z } from 'zod'

function emptyStringToUndefined(value: string | undefined) {
  const trimmed = value?.trim()

  return trimmed ? trimmed : undefined
}

export const optionalAddressSchema = z
  .string()
  .trim()
  .max(240)
  .optional()
  .transform(emptyStringToUndefined)

export const optionalMapUrlSchema = z
  .string()
  .trim()
  .url()
  .max(500)
  .optional()
  .transform(emptyStringToUndefined)

function isAllowedGoogleEmbedUrl(value: string) {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname.toLowerCase()
    const isGoogleHost =
      host === 'www.google.com' ||
      host === 'google.com' ||
      host === 'maps.google.com'
    const isEmbedPath = pathname.startsWith('/maps/embed')
    const hasEmbedOutput = parsed.searchParams.get('output') === 'embed'

    return isGoogleHost && (isEmbedPath || hasEmbedOutput)
  } catch {
    return false
  }
}

export const optionalMapEmbedUrlSchema = z
  .string()
  .trim()
  .url()
  .max(500)
  .refine(isAllowedGoogleEmbedUrl, {
    message: 'Use a valid Google Maps embed URL.',
  })
  .optional()
  .transform(emptyStringToUndefined)

export type OptionalMapFields = {
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
}
