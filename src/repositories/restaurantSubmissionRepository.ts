import type { PrismaClient } from '@prisma/client'
import type {
  CreateRestaurantSubmissionInput,
  RestaurantSubmissionRecord,
} from '../types/restaurantSubmissions'

export type RestaurantSubmissionRepository = {
  createSubmission(
    input: CreateRestaurantSubmissionInput,
  ): Promise<RestaurantSubmissionRecord>
}

function mapSubmission(record: {
  id: string
  name: string
  cuisine: string
  moment: string
  priceBand: string
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
  approvedRestaurantId: string | null
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
}): RestaurantSubmissionRecord {
  return {
    id: record.id,
    name: record.name,
    cuisine: record.cuisine,
    moment: record.moment as RestaurantSubmissionRecord['moment'],
    priceBand: record.priceBand as RestaurantSubmissionRecord['priceBand'],
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    submittedLocale:
      record.submittedLocale as RestaurantSubmissionRecord['submittedLocale'],
    status: record.status as RestaurantSubmissionRecord['status'],
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewedBy: record.reviewedBy ?? undefined,
    reviewNotes: record.reviewNotes ?? undefined,
    approvedRestaurantId: record.approvedRestaurantId ?? undefined,
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

export function createPrismaRestaurantSubmissionRepository(
  prisma: PrismaClient,
): RestaurantSubmissionRepository {
  return {
    async createSubmission(input) {
      const submission = await prisma.restaurantSubmission.create({
        data: {
          name: input.name,
          cuisine: input.cuisine,
          moment: input.moment,
          priceBand: input.priceBand,
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
