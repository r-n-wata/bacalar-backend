import type { Request, Response } from 'express'
import type { AdminRequest } from '../middlewares/adminAuth'
import type { AdminModerationService } from '../services/adminModerationService'
import type { AdminSubmissionListType } from '../types/admin'
import { HttpError } from '../utils/httpError'

const submissionTypes = [
  'all',
  'events',
  'restaurants',
  'tours',
] satisfies AdminSubmissionListType[]

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
    listPendingSubmissions: async (request: Request, response: Response) => {
      const payload = await adminModerationService.listPendingSubmissions(
        resolveSubmissionType(request.query.type),
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
