import type { Logger } from '../config/logger'
import type { EventSubmissionRepository } from '../repositories/eventSubmissionRepository'
import type {
  CreateEventSubmissionInput,
  CreateEventSubmissionResult,
  EventSubmissionMediaInput,
  PrepareSubmissionUploadInput,
  PrepareSubmissionUploadResult,
} from '../types/eventSubmissions'
import {
  MAX_SUBMISSION_IMAGES,
  createEventSubmissionSchema,
  prepareSubmissionUploadSchema,
} from '../types/eventSubmissions'
import { HttpError } from '../utils/httpError'
import type { SubmissionAdminNotifier } from './adminNotifications'
import type { ExternalImageValidator } from './externalImageValidation'
import type { SubmissionMediaService } from './mediaService'

export type EventSubmissionService = {
  createSubmission(
    input: CreateEventSubmissionInput,
  ): Promise<CreateEventSubmissionResult>
  prepareUpload(
    input: PrepareSubmissionUploadInput,
  ): Promise<PrepareSubmissionUploadResult>
}

type EventSubmissionServiceDependencies = {
  repository: EventSubmissionRepository
  mediaService: SubmissionMediaService
  adminNotifier: SubmissionAdminNotifier
  externalImageValidator: ExternalImageValidator
  logger: Logger
}

function toValidationDetails(error: {
  issues?: Array<{ path: PropertyKey[]; message: string }>
}) {
  return error.issues?.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))
}

async function validateExternalImages(
  images: EventSubmissionMediaInput[],
  externalImageValidator: ExternalImageValidator,
) {
  const validated: EventSubmissionMediaInput[] = []

  for (const image of images) {
    if (image.kind === 'uploaded') {
      validated.push(image)
      continue
    }

    const result = await externalImageValidator.validate(image.url)
    validated.push({
      kind: 'external',
      url: result.url,
    })
  }

  return validated
}

export function createEventSubmissionService({
  repository,
  mediaService,
  adminNotifier,
  externalImageValidator,
  logger,
}: EventSubmissionServiceDependencies): EventSubmissionService {
  return {
    async createSubmission(input) {
      const parsed = createEventSubmissionSchema.safeParse(input)

      if (!parsed.success) {
        throw new HttpError(
          400,
          'Invalid event submission payload.',
          'VALIDATION_ERROR',
          toValidationDetails(parsed.error),
        )
      }

      if (parsed.data.media.length > MAX_SUBMISSION_IMAGES) {
        throw new HttpError(
          400,
          `You can attach up to ${MAX_SUBMISSION_IMAGES} images per submission.`,
          'VALIDATION_ERROR',
          [{ field: 'media', message: `Maximum ${MAX_SUBMISSION_IMAGES} images.` }],
        )
      }

      let validatedMedia: EventSubmissionMediaInput[]

      try {
        validatedMedia = await validateExternalImages(
          parsed.data.media,
          externalImageValidator,
        )
      } catch (error) {
        throw new HttpError(
          400,
          error instanceof Error
            ? error.message
            : 'One of the image URLs could not be verified.',
          'INVALID_EXTERNAL_IMAGE_URL',
          [{ field: 'media', message: 'One or more external image URLs are invalid.' }],
        )
      }

      const submission = await repository.createSubmission({
        ...parsed.data,
        media: validatedMedia,
      })

      try {
        await adminNotifier.notifyEventSubmission(submission)
      } catch (error) {
        logger.error('submission-admin-notification-failed', {
          submissionId: submission.id,
          error,
        })
      }

      return {
        id: submission.id,
        status: submission.status,
        createdAt: submission.createdAt,
      }
    },
    async prepareUpload(input) {
      const parsed = prepareSubmissionUploadSchema.safeParse(input)

      if (!parsed.success) {
        throw new HttpError(
          400,
          'Invalid upload payload.',
          'VALIDATION_ERROR',
          toValidationDetails(parsed.error),
        )
      }

      return mediaService.prepareImageUpload(parsed.data)
    },
  }
}
