import type { Request } from 'express'
import type { AppLanguage } from '../types/content'
import { HttpError } from './httpError'

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
  const rawQueryLanguage =
    typeof request.query.lang === 'string' ? request.query.lang : undefined

  if (rawQueryLanguage) {
    const fromQuery = parseLanguage(rawQueryLanguage)

    if (!fromQuery) {
      throw new HttpError(
        400,
        'Unsupported language query parameter',
        'INVALID_LANGUAGE',
      )
    }

    return fromQuery
  }

  const acceptLanguage = request.headers['accept-language']
  const headerValue =
    typeof acceptLanguage === 'string' ? acceptLanguage.split(',')[0] : undefined
  const fromHeader = parseLanguage(headerValue?.trim().slice(0, 2))

  return fromHeader ?? defaultLanguage
}
