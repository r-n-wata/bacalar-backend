import type { NextFunction, Request, Response } from 'express'
import type {
  AdminAuthService,
  AuthenticatedAdminUser,
} from '../services/adminAuthService'
import { HttpError } from '../utils/httpError'

export type AdminRequest = Request & {
  adminUser: AuthenticatedAdminUser
}

function resolveBearerToken(request: Request) {
  const authorization = request.header('authorization')

  if (!authorization) {
    throw new HttpError(401, 'Authentication required.', 'UNAUTHORIZED')
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authentication required.', 'UNAUTHORIZED')
  }

  return token
}

export function createAdminAuthMiddleware(adminAuthService: AdminAuthService) {
  return async function adminAuthMiddleware(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    try {
      const token = resolveBearerToken(request)
      const adminUser = await adminAuthService.authenticateToken(token)

      ;(request as AdminRequest).adminUser = adminUser
      next()
    } catch (error) {
      next(error)
    }
  }
}
