import type { NextFunction, Request, Response } from 'express'

type CorsOptions = {
  allowedOrigins: string[]
  netlifySiteName?: string
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, '')
}

const ALLOWED_HEADERS = [
  'Content-Type',
  'Accept',
  'Accept-Language',
  'Authorization',
].join(', ')

const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'].join(',')

function createNetlifyPreviewPattern(siteName: string) {
  return new RegExp(
    `^https://([a-z0-9-]+--)?${escapeRegex(siteName)}\\.netlify\\.app$`,
    'i',
  )
}

export function createCorsMiddleware({
  allowedOrigins,
  netlifySiteName,
}: CorsOptions) {
  const normalizedOrigins = allowedOrigins.map(normalizeOrigin)
  const netlifyPattern = netlifySiteName
    ? createNetlifyPreviewPattern(netlifySiteName)
    : null

  function isAllowed(origin: string) {
    const normalizedOrigin = normalizeOrigin(origin)

    return (
      normalizedOrigins.includes(normalizedOrigin) ||
      (netlifyPattern ? netlifyPattern.test(normalizedOrigin) : false)
    )
  }

  return function corsMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const origin = request.headers.origin

    if (typeof origin === 'string' && isAllowed(origin)) {
      response.header('Access-Control-Allow-Origin', origin)
      response.header('Vary', 'Origin')
      response.header('Access-Control-Allow-Headers', ALLOWED_HEADERS)
      response.header('Access-Control-Allow-Methods', ALLOWED_METHODS)
    }

    if (request.method === 'OPTIONS') {
      response.status(204).send()
      return
    }

    next()
  }
}
