import type { AdminModerationRepository } from '../repositories/adminModerationRepository'
import type {
  AdminSubmissionEntityType,
  AdminSubmissionListResponse,
  AdminSubmissionListType,
  SubmissionModerationResult,
} from '../types/admin'
import { HttpError } from '../utils/httpError'
import type { AuthenticatedAdminUser } from './adminAuthService'

export type AdminModerationService = {
  listPendingSubmissions(type: AdminSubmissionListType): Promise<AdminSubmissionListResponse>
  approveSubmission(
    type: AdminSubmissionEntityType,
    submissionId: string,
    adminUser: AuthenticatedAdminUser,
  ): Promise<SubmissionModerationResult>
  rejectSubmission(
    type: AdminSubmissionEntityType,
    submissionId: string,
    adminUser: AuthenticatedAdminUser,
  ): Promise<SubmissionModerationResult>
}

type AdminModerationServiceDependencies = {
  repository: AdminModerationRepository
}

function toHttpError(error: unknown) {
  if (error instanceof HttpError) {
    return error
  }

  if (error instanceof Error) {
    switch (error.message) {
      case 'EVENT_SUBMISSION_NOT_FOUND':
      case 'RESTAURANT_SUBMISSION_NOT_FOUND':
      case 'TOUR_SUBMISSION_NOT_FOUND':
        return new HttpError(404, 'Submission not found.', 'SUBMISSION_NOT_FOUND')
      case 'SUBMISSION_NOT_PENDING':
        return new HttpError(
          409,
          'Only pending submissions can be reviewed.',
          'SUBMISSION_NOT_PENDING',
        )
      default:
        return error
    }
  }

  return error
}

export function createAdminModerationService({
  repository,
}: AdminModerationServiceDependencies): AdminModerationService {
  return {
    async listPendingSubmissions(type) {
      return {
        items: await repository.listPendingSubmissions(type),
      }
    },
    async approveSubmission(type, submissionId, adminUser) {
      try {
        return await repository.approveSubmission(type, submissionId, {
          reviewedBy: adminUser.email,
        })
      } catch (error) {
        throw toHttpError(error)
      }
    },
    async rejectSubmission(type, submissionId, adminUser) {
      try {
        return await repository.rejectSubmission(type, submissionId, {
          reviewedBy: adminUser.email,
        })
      } catch (error) {
        throw toHttpError(error)
      }
    },
  }
}
