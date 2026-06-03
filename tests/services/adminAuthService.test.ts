import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseAdminAuthService } from '../../src/services/adminAuthService'

const getUser = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser,
    },
  })),
}))

describe('adminAuthService', () => {
  beforeEach(() => {
    getUser.mockReset()
  })

  it('authenticates an allow-listed admin from Supabase token data', async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-user-1',
          email: 'Admin@Bacalar.test',
        },
      },
      error: null,
    })
    const adminAccountRepository = {
      findActiveByEmail: vi.fn().mockResolvedValue({
        id: 'admin-1',
        email: 'admin@bacalar.test',
        isActive: true,
      }),
    }
    const service = createSupabaseAdminAuthService({
      supabaseUrl: 'https://project.supabase.co',
      serviceRoleKey: 'service-role-key',
      adminAccountRepository,
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    })

    const result = await service.authenticateToken('token-123')

    expect(adminAccountRepository.findActiveByEmail).toHaveBeenCalledWith(
      'admin@bacalar.test',
    )
    expect(result).toEqual({
      userId: 'supabase-user-1',
      email: 'admin@bacalar.test',
    })
  })

  it('rejects authenticated users who are not admin allow-listed', async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-user-1',
          email: 'person@example.com',
        },
      },
      error: null,
    })
    const service = createSupabaseAdminAuthService({
      supabaseUrl: 'https://project.supabase.co',
      serviceRoleKey: 'service-role-key',
      adminAccountRepository: {
        findActiveByEmail: vi.fn().mockResolvedValue(null),
      },
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    })

    await expect(service.authenticateToken('token-123')).rejects.toMatchObject({
      statusCode: 403,
      code: 'ADMIN_ACCESS_REQUIRED',
    })
  })
})
