import type { Request, Response } from 'express'
import type { AdminRequest } from '../middlewares/adminAuth'
import type { AdminModerationService } from '../services/adminModerationService'
import type {
  AdminSubmissionEntityType,
  AdminSubmissionListType,
  AdminSubmissionStatusFilter,
} from '../types/admin'
import { HttpError } from '../utils/httpError'

const submissionTypes = [
  'all',
  'events',
  'restaurants',
  'tours',
] satisfies AdminSubmissionListType[]

const entityTypes = ['events', 'restaurants', 'tours'] satisfies AdminSubmissionEntityType[]
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

function resolveId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export function createAdminModerationController(
  adminModerationService: AdminModerationService,
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
    getSubmissionDetail: async (request: Request, response: Response) => {
      const payload = await adminModerationService.getSubmissionDetail(
        resolveEntityType(request.params.type),
        resolveId(request.params.id),
      )

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
