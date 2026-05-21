import type { NextFunction, Request, Response } from 'express'
import type { Logger } from '../config/logger'
import { HttpError } from '../utils/httpError'

export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) {
    if (error instanceof HttpError) {
      response.status(error.statusCode).json({
        error: {
          message: error.message,
        },
      })
      return
    }

    logger.error('unexpected-error', {
      error,
    })

    response.status(500).json({
      error: {
        message: 'Internal server error',
      },
    })
  }
}
