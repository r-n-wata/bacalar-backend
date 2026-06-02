import { describe, expect, it, vi } from 'vitest'
import {
  createMediaObjectKey,
  createSupabaseSubmissionMediaService,
} from '../../src/services/mediaService'

describe('mediaService', () => {
  it('creates object keys under the configured folder prefix', () => {
    const objectKey = createMediaObjectKey('restaurant-images', 'hero shot.jpg')

    expect(objectKey).toMatch(
      /^restaurant-images\/\d{4}\/\d{2}\/.+-hero-shot.jpg$/,
    )
  })

  it('falls back to the event submissions folder when the prefix is missing', () => {
    const objectKey = createMediaObjectKey(undefined, 'poster.jpg')

    expect(objectKey).toMatch(/^event-submissions\/\d{4}\/\d{2}\/.+-poster.jpg$/)
  })

  it('trims slashes from configured prefixes', () => {
    const objectKey = createMediaObjectKey('/restaurant-images/', 'cover.png')

    expect(objectKey).toMatch(
      /^restaurant-images\/\d{4}\/\d{2}\/.+-cover.png$/,
    )
  })

  it('returns an unavailable service when required supabase config is missing', async () => {
    const service = createSupabaseSubmissionMediaService(
      {
        error: vi.fn(),
        info: vi.fn(),
      },
      {
        supabaseUrl: undefined,
        serviceRoleKey: undefined,
        bucketName: undefined,
        folderPrefix: 'restaurant-images',
      },
    )

    await expect(
      service.prepareImageUpload({
        filename: 'cover.png',
        mimeType: 'image/png',
        fileSize: 512,
      }),
    ).rejects.toMatchObject({
      statusCode: 503,
      code: 'UPLOADS_UNAVAILABLE',
    })
  })
})
