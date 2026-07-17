import type { AdminModerationRepository } from '../repositories/adminModerationRepository'
import type { PublishedContentRepository } from '../repositories/interfaces'
import type {
  AdminPublishedContentDetailResponse,
  AdminPublishedContentListResponse,
  AdminPublishedContentType,
  ArchiveAdminPublishedContentResult,
  AdminSubmissionDetailResponse,
  AdminSubmissionEntityType,
  AdminSubmissionListResponse,
  AdminSubmissionListType,
  AdminSubmissionStatusFilter,
  SubmissionModerationResult,
  UpdateAdminPublishedContentInput,
  UpdateAdminPublishedContentResult,
} from '../types/admin'
import { HttpError } from '../utils/httpError'
import type { AuthenticatedAdminUser } from './adminAuthService'

export type AdminModerationService = {
  listSubmissions(filters: {
    type: AdminSubmissionListType
    status: AdminSubmissionStatusFilter
  }): Promise<AdminSubmissionListResponse>
  listPublishedContent(
    type: AdminPublishedContentType,
    language: 'en' | 'es',
  ): Promise<AdminPublishedContentListResponse>
  getPublishedContentDetail(
    type: AdminPublishedContentType,
    id: string,
  ): Promise<AdminPublishedContentDetailResponse>
  updatePublishedContent(
    input: UpdateAdminPublishedContentInput & { updatedBy: string },
  ): Promise<UpdateAdminPublishedContentResult>
  archivePublishedContent(input: {
    type: AdminPublishedContentType
    id: string
  }): Promise<ArchiveAdminPublishedContentResult>
  getSubmissionDetail(
    type: AdminSubmissionEntityType,
    submissionId: string,
  ): Promise<AdminSubmissionDetailResponse>
  updatePublishedContentFeatured(input: {
    type: AdminPublishedContentType
    id: string
    isFeatured: boolean
    language: 'en' | 'es'
  }): Promise<AdminPublishedContentListResponse>
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
  publishedContentRepository: PublishedContentRepository
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
      case 'PUBLISHED_CONTENT_NOT_FOUND':
        return new HttpError(404, 'Published content not found.', 'CONTENT_NOT_FOUND')
      default:
        return error
    }
  }

  return error
}

export function createAdminModerationService({
  repository,
  publishedContentRepository,
}: AdminModerationServiceDependencies): AdminModerationService {
  return {
    async listSubmissions(filters) {
      return {
        items: await repository.listSubmissions(filters),
      }
    },
    async listPublishedContent(type, language) {
      const [items, featuredCount] = await Promise.all([
        publishedContentRepository.listPublishedContent(type, language),
        publishedContentRepository.countFeaturedItems(type),
      ])

      return {
        items,
        featuredCount,
        featuredCap: 5,
      }
    },
    async getPublishedContentDetail(type, id) {
      const item = await publishedContentRepository.getPublishedContentDetail(type, id)

      if (!item) {
        throw new HttpError(404, 'Published content not found.', 'CONTENT_NOT_FOUND')
      }

      return { item }
    },
    async updatePublishedContent(input) {
      try {
        const item = await publishedContentRepository.updatePublishedContent(input)

        if (!item) {
          throw new Error('PUBLISHED_CONTENT_NOT_FOUND')
        }

        return { item }
      } catch (error) {
        throw toHttpError(error)
      }
    },
    async archivePublishedContent(input) {
      try {
        const result = await publishedContentRepository.archivePublishedContent(input)

        if (!result) {
          throw new Error('PUBLISHED_CONTENT_NOT_FOUND')
        }

        return result
      } catch (error) {
        throw toHttpError(error)
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
    async updatePublishedContentFeatured(input) {
      const updated = await publishedContentRepository.updateFeaturedState(input)

      if (!updated) {
        throw new HttpError(
          409,
          'Unable to update featured state.',
          'FEATURED_UPDATE_FAILED',
        )
      }

      const [items, featuredCount] = await Promise.all([
        publishedContentRepository.listPublishedContent(input.type, input.language),
        publishedContentRepository.countFeaturedItems(input.type),
      ])

      return {
        items,
        featuredCount,
        featuredCap: 5,
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
