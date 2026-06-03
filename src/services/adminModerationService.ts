import type { AdminModerationRepository } from '../repositories/adminModerationRepository'
import type {
  AdminSubmissionDetailResponse,
  AdminSubmissionEntityType,
  AdminSubmissionListResponse,
  AdminSubmissionListType,
  AdminSubmissionStatusFilter,
  SubmissionModerationResult,
} from '../types/admin'
import { HttpError } from '../utils/httpError'
import type { AuthenticatedAdminUser } from './adminAuthService'

export type AdminModerationService = {
  listSubmissions(filters: {
    type: AdminSubmissionListType
    status: AdminSubmissionStatusFilter
  }): Promise<AdminSubmissionListResponse>
  getSubmissionDetail(
    type: AdminSubmissionEntityType,
    submissionId: string,
  ): Promise<AdminSubmissionDetailResponse>
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
    async listSubmissions(filters) {
      return {
        items: await repository.listSubmissions(filters),
      }
    },
    async getSubmissionDetail(type, submissionId) {
      try {
        return {
          item: await repository.getSubmissionDetail(type, submissionId),
        }
      } catch (error) {
        throw toHttpError(error)
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
