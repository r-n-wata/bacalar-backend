import type { NextFunction, Request, Response } from 'express'
import type { Logger } from '../config/logger'
import { HttpError } from '../utils/httpError'

export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction,
  ) {
    if (error instanceof HttpError) {
      response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      })
      return
    }

    logger.error('unexpected-error', {
      error,
      method: request.method,
      path: request.path,
    })

    response.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    })
  }
}
