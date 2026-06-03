import { describe, expect, it, vi } from 'vitest'
import { createAdminAuthMiddleware } from '../../src/middlewares/adminAuth'

describe('adminAuthMiddleware', () => {
  it('returns a 401-style error when the bearer token is missing', async () => {
    const next = vi.fn()
    const middleware = createAdminAuthMiddleware({
      authenticateToken: vi.fn(),
    })

    await middleware(
      {
        header: vi.fn().mockReturnValue(undefined),
      } as never,
      {} as never,
      next,
    )

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      }),
    )
  })

  it('attaches the authenticated admin user to the request', async () => {
    const next = vi.fn()
    const request = {
      header: vi.fn().mockReturnValue('Bearer token-123'),
    }
    const middleware = createAdminAuthMiddleware({
      authenticateToken: vi.fn().mockResolvedValue({
        email: 'admin@bacalar.test',
        userId: 'supabase-user-1',
      }),
    })

    await middleware(request as never, {} as never, next)

    expect(request).toMatchObject({
      adminUser: {
        email: 'admin@bacalar.test',
        userId: 'supabase-user-1',
      },
    })
    expect(next).toHaveBeenCalledWith()
  })
})
