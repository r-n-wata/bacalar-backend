import type { PrismaClient } from '@prisma/client'
import type {
  CreateEventSubmissionInput,
  EventSubmissionRecord,
} from '../types/eventSubmissions'

export type EventSubmissionRepository = {
  createSubmission(input: CreateEventSubmissionInput): Promise<EventSubmissionRecord>
}

function mapSubmission(record: {
  id: string
  title: string
  startsAt: Date
  location: string
  category: string
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
  approvedEventId: string | null
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
}): EventSubmissionRecord {
  return {
    id: record.id,
    title: record.title,
    startsAt: record.startsAt.toISOString(),
    location: record.location,
    category: record.category as EventSubmissionRecord['category'],
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    submittedLocale: record.submittedLocale as EventSubmissionRecord['submittedLocale'],
    status: record.status as EventSubmissionRecord['status'],
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewedBy: record.reviewedBy ?? undefined,
    reviewNotes: record.reviewNotes ?? undefined,
    approvedEventId: record.approvedEventId ?? undefined,
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

export function createPrismaEventSubmissionRepository(
  prisma: PrismaClient,
): EventSubmissionRepository {
  return {
    async createSubmission(input) {
      const submission = await prisma.eventSubmission.create({
        data: {
          title: input.title,
          startsAt: new Date(input.startsAt),
          location: input.location,
          category: input.category,
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
