import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Logger } from '../config/logger'
import type { AdminAccountRepository } from '../repositories/adminAccountRepository'
import { HttpError } from '../utils/httpError'

export type AuthenticatedAdminUser = {
  userId: string
  email: string
}

export type AdminAuthService = {
  authenticateToken(token: string): Promise<AuthenticatedAdminUser>
}

type SupabaseAdminAuthServiceDependencies = {
  supabaseUrl?: string
  serviceRoleKey?: string
  adminAccountRepository: AdminAccountRepository
  logger: Logger
}

function createSupabaseClientForAdminAuth(
  supabaseUrl: string,
  serviceRoleKey: string,
) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createSupabaseAdminAuthService({
  supabaseUrl,
  serviceRoleKey,
  adminAccountRepository,
  logger,
}: SupabaseAdminAuthServiceDependencies): AdminAuthService {
  let supabase: SupabaseClient | null = null

  return {
    async authenticateToken(token) {
      if (!supabaseUrl || !serviceRoleKey) {
        throw new HttpError(
          503,
          'Admin authentication is not configured.',
          'ADMIN_AUTH_UNAVAILABLE',
        )
      }

      supabase ??= createSupabaseClientForAdminAuth(supabaseUrl, serviceRoleKey)

      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data.user?.email) {
        logger.info('admin-auth-invalid-token', {
          error,
        })
        throw new HttpError(401, 'Authentication required.', 'UNAUTHORIZED')
      }

      const normalizedEmail = data.user.email.trim().toLowerCase()
      const adminAccount = await adminAccountRepository.findActiveByEmail(
        normalizedEmail,
      )

      if (!adminAccount) {
        throw new HttpError(
          403,
          'You do not have admin access.',
          'ADMIN_ACCESS_REQUIRED',
        )
      }

      if (
        adminAccount.supabaseUserId &&
        adminAccount.supabaseUserId !== data.user.id
      ) {
        throw new HttpError(
          403,
          'You do not have admin access.',
          'ADMIN_ACCESS_REQUIRED',
        )
      }

      return {
        userId: data.user.id,
        email: normalizedEmail,
      }
    },
  }
}
