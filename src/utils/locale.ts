import type { Request } from 'express'
import type { AppLanguage } from '../types/content'

export const supportedLanguages: AppLanguage[] = ['en', 'es']

export function parseLanguage(value: string | undefined): AppLanguage | null {
  if (value === 'en' || value === 'es') {
    return value
  }

  return null
}

export function resolveLanguage(
  request: Request,
  defaultLanguage: AppLanguage,
): AppLanguage {
  const fromQuery = parseLanguage(
    typeof request.query.lang === 'string' ? request.query.lang : undefined,
  )

  if (fromQuery) {
    return fromQuery
  }

  const acceptLanguage = request.headers['accept-language']
  const headerValue =
    typeof acceptLanguage === 'string' ? acceptLanguage.split(',')[0] : undefined
  const fromHeader = parseLanguage(headerValue?.trim().slice(0, 2))

  return fromHeader ?? defaultLanguage
}
