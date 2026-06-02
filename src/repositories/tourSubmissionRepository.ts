import type { PrismaClient } from '@prisma/client'
import type {
  CreateTourSubmissionInput,
  TourSubmissionRecord,
} from '../types/tourSubmissions'

export type TourSubmissionRepository = {
  createSubmission(
    input: CreateTourSubmissionInput,
  ): Promise<TourSubmissionRecord>
}

function mapSubmission(record: {
  id: string
  name: string
  category: string
  durationHours: number
  priceFrom: number
  description: string
  contactName: string
  contactMethod: string
  instagram: string | null
  whatsapp: string | null
  submittedLocale: string
  status: string
  reviewedAt: Date | null
  reviewedBy: string | null
  reviewNotes: string | null
  approvedTourId: string | null
  createdAt: Date
  updatedAt: Date
  images: Array<{
    id: string
    source: 'UPLOADED' | 'EXTERNAL_URL'
    url: string
    objectKey: string | null
    mimeType: string | null
    originalFilename: string | null
    sortOrder: number
  }>
}): TourSubmissionRecord {
  return {
    id: record.id,
    name: record.name,
    category: record.category as TourSubmissionRecord['category'],
    durationHours: record.durationHours,
    priceFrom: record.priceFrom,
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    submittedLocale:
      record.submittedLocale as TourSubmissionRecord['submittedLocale'],
    status: record.status as TourSubmissionRecord['status'],
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewedBy: record.reviewedBy ?? undefined,
    reviewNotes: record.reviewNotes ?? undefined,
    approvedTourId: record.approvedTourId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    images: record.images.map((image) => ({
      id: image.id,
      source: image.source,
      url: image.url,
      objectKey: image.objectKey ?? undefined,
      mimeType: image.mimeType ?? undefined,
      originalFilename: image.originalFilename ?? undefined,
      sortOrder: image.sortOrder,
    })),
  }
}

export function createPrismaTourSubmissionRepository(
  prisma: PrismaClient,
): TourSubmissionRepository {
  return {
    async createSubmission(input) {
      const submission = await prisma.tourSubmission.create({
        data: {
          name: input.name,
          category: input.category,
          durationHours: input.durationHours,
          priceFrom: input.priceFrom,
          description: input.description,
          contactName: input.contactName,
          contactMethod: input.contactMethod,
          instagram: input.instagram,
          whatsapp: input.whatsapp,
          submittedLocale: input.submittedLocale,
          images: {
            create: input.media.map((media, index) => ({
              source: media.kind === 'uploaded' ? 'UPLOADED' : 'EXTERNAL_URL',
              url: media.url,
              objectKey: media.kind === 'uploaded' ? media.objectKey : null,
              mimeType: media.kind === 'uploaded' ? media.mimeType : null,
              originalFilename:
                media.kind === 'uploaded' ? media.filename : null,
              sortOrder: index,
            })),
          },
        },
        include: {
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      })

      return mapSubmission(submission)
    },
  }
}
