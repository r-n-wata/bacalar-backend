import type { Logger } from '../config/logger'
import {
  SUBMISSION_IMAGE_MIME_TYPES,
  type SubmissionImageMimeType,
} from '../types/eventSubmissions'

export type ExternalImageValidationResult = {
  url: string
  mimeType: SubmissionImageMimeType
}

export type ExternalImageValidator = {
  validate(url: string): Promise<ExternalImageValidationResult>
}

type ExternalImageValidatorConfig = {
  timeoutMs: number
}

const allowedMimeTypes = new Set<string>(SUBMISSION_IMAGE_MIME_TYPES)
const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
const invalidExtensions = [
  '.html',
  '.htm',
  '.php',
  '.asp',
  '.aspx',
  '.js',
  '.json',
  '.pdf',
  '.svg',
  '.txt',
]

function normalizeUrl(rawUrl: string) {
  const parsed = new URL(rawUrl)

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are supported.')
  }

  return parsed.toString()
}

function inferFromExtension(url: string) {
  const pathname = new URL(url).pathname.toLowerCase()

  if (invalidExtensions.some((extension) => pathname.endsWith(extension))) {
    return 'invalid'
  }

  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
    return 'image/jpeg'
  }

  if (pathname.endsWith('.png')) {
    return 'image/png'
  }

  if (pathname.endsWith('.webp')) {
    return 'image/webp'
  }

  if (validExtensions.some((extension) => pathname.endsWith(extension))) {
    return 'possible'
  }

  return 'unknown'
}

function isAllowedMimeType(value: string | null): value is SubmissionImageMimeType {
  return Boolean(value && allowedMimeTypes.has(value.toLowerCase()))
}

export function createExternalImageValidator(
  logger: Logger,
  config: ExternalImageValidatorConfig,
): ExternalImageValidator {
  return {
    async validate(rawUrl) {
      const normalizedUrl = normalizeUrl(rawUrl)
      const extensionHint = inferFromExtension(normalizedUrl)

      if (extensionHint === 'invalid') {
        throw new Error('The image URL must point to a JPG, PNG, or WEBP file.')
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

      try {
        const response = await fetch(normalizedUrl, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('The image URL could not be verified.')
        }

        const contentTypeHeader = response.headers.get('content-type')
        const mimeType = contentTypeHeader?.split(';')[0].trim().toLowerCase() ?? null

        if (!isAllowedMimeType(mimeType)) {
          throw new Error('The image URL must return a JPG, PNG, or WEBP file.')
        }

        return {
          url: normalizedUrl,
          mimeType,
        }
      } catch (error) {
        logger.info('external-image-validation-failed', {
          url: normalizedUrl,
          error: error instanceof Error ? error.message : 'unknown-error',
        })

        throw error instanceof Error
          ? error
          : new Error('The image URL could not be verified.')
      } finally {
        clearTimeout(timeout)
      }
    },
  }
}
