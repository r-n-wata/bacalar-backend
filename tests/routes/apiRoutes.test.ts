import { describe, expect, it, vi } from 'vitest'
import { getHealth } from '../../src/controllers/healthController'
import { createInMemoryRepositories } from '../../src/repositories/inMemoryRepositories'
import { createCorsMiddleware } from '../../src/middlewares/cors'
import { resolveLanguage } from '../../src/utils/locale'

function createResponse() {
  return {
    header: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('mvp contract and runtime foundations', () => {
  it('keeps the in-memory home contract booking-free and focused on browse sections', async () => {
    const repositories = createInMemoryRepositories()
    const home = await repositories.home.getHomeContent('en')

    expect(home?.spotlight.actions).toHaveLength(3)
    expect(home?.spotlight.entries).not.toHaveProperty('booking')
    expect(home).not.toHaveProperty('planningCallout')
    expect(home?.featuredExperiences.items[0]?.route).toBe('/tours/tour-sailing')
  })

  it('allows configured Netlify preview origins through CORS', () => {
    const middleware = createCorsMiddleware({
      allowedOrigins: ['http://localhost:5173', 'https://bacalar.netlify.app'],
      netlifySiteName: 'bacalar',
    })
    const response = createResponse()
    const next = vi.fn()

    middleware(
      {
        method: 'GET',
        headers: {
          origin: 'https://deploy-preview-12--bacalar.netlify.app',
        },
      } as never,
      response as never,
      next,
    )

    expect(response.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'https://deploy-preview-12--bacalar.netlify.app',
    )
    expect(next).toHaveBeenCalled()
  })

  it('rejects unsupported language values', () => {
    expect(() =>
      resolveLanguage(
        {
          query: { lang: 'fr' },
          headers: {},
        } as never,
        'en',
      ),
    ).toThrowError('Unsupported language query parameter')
  })

  it('returns a render-safe health payload', () => {
    const response = createResponse()

    getHealth({} as never, response as never)

    expect(response.json).toHaveBeenCalledWith({
      status: 'ok',
      service: 'bacalar-backend',
    })
  })
})
