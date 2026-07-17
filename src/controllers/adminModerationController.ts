import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import type { AdminRequest } from '../middlewares/adminAuth'
import type { AdminModerationService } from '../services/adminModerationService'
import type {
  AppLanguage,
} from '../types/content'
import type {
  AdminPublishedContentType,
  AdminSubmissionEntityType,
  AdminSubmissionListType,
  AdminSubmissionStatusFilter,
} from '../types/admin'
import {
  updateAdminPublishedEventSchema,
  updateAdminPublishedRestaurantSchema,
  updateAdminPublishedTourSchema,
} from '../types/admin'
import { HttpError } from '../utils/httpError'
import { resolveLanguage } from '../utils/locale'

const submissionTypes = [
  'all',
  'events',
  'restaurants',
  'tours',
] satisfies AdminSubmissionListType[]

const entityTypes = ['events', 'restaurants', 'tours'] satisfies AdminSubmissionEntityType[]
const publishedContentTypes = ['events', 'restaurants', 'tours'] satisfies AdminPublishedContentType[]
const submissionStatuses = [
  'all',
  'pending',
  'approved',
  'rejected',
] satisfies AdminSubmissionStatusFilter[]

function resolveSubmissionType(value: Request['query'][string]) {
  const normalized =
    typeof value === 'string'
      ? value
      : Array.isArray(value) && typeof value[0] === 'string'
        ? value[0]
        : undefined
  const type = normalized ?? 'all'

  if (submissionTypes.includes(type as AdminSubmissionListType)) {
    return type as AdminSubmissionListType
  }

  throw new HttpError(
    400,
    'Unsupported admin submission type.',
    'VALIDATION_ERROR',
  )
}

function resolveSubmissionStatus(value: Request['query'][string]) {
  const normalized =
    typeof value === 'string'
      ? value
      : Array.isArray(value) && typeof value[0] === 'string'
        ? value[0]
        : undefined
  const status = normalized ?? 'pending'

  if (submissionStatuses.includes(status as AdminSubmissionStatusFilter)) {
    return status as AdminSubmissionStatusFilter
  }

  throw new HttpError(
    400,
    'Unsupported admin submission status.',
    'VALIDATION_ERROR',
  )
}

function resolveEntityType(value: string | string[] | undefined) {
  const type = Array.isArray(value) ? value[0] ?? '' : value ?? ''

  if (entityTypes.includes(type as AdminSubmissionEntityType)) {
    return type as AdminSubmissionEntityType
  }

  throw new HttpError(
    400,
    'Unsupported admin submission type.',
    'VALIDATION_ERROR',
  )
}

function resolvePublishedContentType(value: unknown) {
  const type =
    typeof value === 'string'
      ? value
      : Array.isArray(value) && typeof value[0] === 'string'
        ? value[0]
        : ''

  if (publishedContentTypes.includes(type as AdminPublishedContentType)) {
    return type as AdminPublishedContentType
  }

  throw new HttpError(
    400,
    'Unsupported admin content type.',
    'VALIDATION_ERROR',
  )
}

function parseAdminPublishedContentInput(
  type: AdminPublishedContentType,
  payload: unknown,
) {
  switch (type) {
    case 'events':
      return updateAdminPublishedEventSchema.parse(payload)
    case 'restaurants':
      return updateAdminPublishedRestaurantSchema.parse(payload)
    case 'tours':
      return updateAdminPublishedTourSchema.parse(payload)
  }
}

function resolveId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export function createAdminModerationController(
  adminModerationService: AdminModerationService,
  defaultLanguage: AppLanguage,
) {
  return {
    getSession: async (request: Request, response: Response) => {
      const adminUser = (request as AdminRequest).adminUser

      response.json({
        email: adminUser.email,
        userId: adminUser.userId,
      })
    },
    listSubmissions: async (request: Request, response: Response) => {
      const payload = await adminModerationService.listSubmissions({
        type: resolveSubmissionType(request.query.type),
        status: resolveSubmissionStatus(request.query.status),
      })

      response.json(payload)
    },
    listPublishedContent: async (request: Request, response: Response) => {
      const payload = await adminModerationService.listPublishedContent(
        resolvePublishedContentType(request.query.type),
        resolveLanguage(request, defaultLanguage),
      )

      response.json(payload)
    },
    getPublishedContentDetail: async (request: Request, response: Response) => {
      const payload = await adminModerationService.getPublishedContentDetail(
        resolvePublishedContentType(request.params.type),
        resolveId(request.params.id),
      )

      response.json(payload)
    },
    updatePublishedContent: async (request: Request, response: Response) => {
      const type = resolvePublishedContentType(request.params.type)

      try {
        const payload = await adminModerationService.updatePublishedContent({
          ...parseAdminPublishedContentInput(type, request.body),
          id: resolveId(request.params.id),
          updatedBy: (request as AdminRequest).adminUser.email,
        })

        response.json(payload)
      } catch (error) {
        if (error instanceof ZodError) {
          throw new HttpError(
            400,
            'Invalid published content payload.',
            'VALIDATION_ERROR',
            error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          )
        }

        throw error
      }
    },
    archivePublishedContent: async (request: Request, response: Response) => {
      const payload = await adminModerationService.archivePublishedContent({
        type: resolvePublishedContentType(request.params.type),
        id: resolveId(request.params.id),
      })

      response.json(payload)
    },
    getSubmissionDetail: async (request: Request, response: Response) => {
      const payload = await adminModerationService.getSubmissionDetail(
        resolveEntityType(request.params.type),
        resolveId(request.params.id),
      )

      response.json(payload)
    },
    updatePublishedContentFeatured: async (
      request: Request,
      response: Response,
    ) => {
      const payload = await adminModerationService.updatePublishedContentFeatured({
        type: resolvePublishedContentType(request.params.type),
        id: resolveId(request.params.id),
        isFeatured: request.method === 'POST',
        language: resolveLanguage(request, defaultLanguage),
      })

      response.json(payload)
    },
    approveEventSubmission: async (request: Request, response: Response) => {
      const payload = await adminModerationService.approveSubmission(
        'events',
        resolveId(request.params.id),
        (request as AdminRequest).adminUser,
      )

      response.json(payload)
    },
    rejectEventSubmission: async (request: Request, response: Response) => {
      const payload = await adminModerationService.rejectSubmission(
        'events',
        resolveId(request.params.id),
        (request as AdminRequest).adminUser,
      )

      response.json(payload)
    },
    approveRestaurantSubmission: async (
      request: Request,
      response: Response,
    ) => {
      const payload = await adminModerationService.approveSubmission(
        'restaurants',
        resolveId(request.params.id),
        (request as AdminRequest).adminUser,
      )

      response.json(payload)
    },
    rejectRestaurantSubmission: async (
      request: Request,
      response: Response,
    ) => {
      const payload = await adminModerationService.rejectSubmission(
        'restaurants',
        resolveId(request.params.id),
        (request as AdminRequest).adminUser,
      )

      response.json(payload)
    },
    approveTourSubmission: async (request: Request, response: Response) => {
      const payload = await adminModerationService.approveSubmission(
        'tours',
        resolveId(request.params.id),
        (request as AdminRequest).adminUser,
      )

      response.json(payload)
    },
    rejectTourSubmission: async (request: Request, response: Response) => {
      const payload = await adminModerationService.rejectSubmission(
        'tours',
        resolveId(request.params.id),
        (request as AdminRequest).adminUser,
      )

      response.json(payload)
    },
  }
}
