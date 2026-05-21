import type { NextFunction, Request, Response } from 'express'
import type { Logger } from '../config/logger'

export function createRequestLogger(logger: Logger) {
  return function requestLogger(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    logger.info('request', {
      method: request.method,
      path: request.path,
    })
    next()
  }
}
