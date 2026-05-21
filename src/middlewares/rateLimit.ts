import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/httpError'

type RateLimitOptions = {
  windowMs: number
  maxRequests: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

export function createRateLimitMiddleware({
  windowMs,
  maxRequests,
}: RateLimitOptions) {
  const entries = new Map<string, RateLimitEntry>()

  return function rateLimitMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    if (request.method === 'OPTIONS') {
      next()
      return
    }

    const now = Date.now()
    const key = request.ip || request.headers['x-forwarded-for']?.toString() || 'unknown'
    const current = entries.get(key)

    if (!current || current.resetAt <= now) {
      entries.set(key, {
        count: 1,
        resetAt: now + windowMs,
      })
      response.header('X-RateLimit-Limit', String(maxRequests))
      response.header('X-RateLimit-Remaining', String(maxRequests - 1))
      next()
      return
    }

    if (current.count >= maxRequests) {
      response.header('X-RateLimit-Limit', String(maxRequests))
      response.header('X-RateLimit-Remaining', '0')
      throw new HttpError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED')
    }

    current.count += 1
    entries.set(key, current)
    response.header('X-RateLimit-Limit', String(maxRequests))
    response.header('X-RateLimit-Remaining', String(maxRequests - current.count))
    next()
  }
}
