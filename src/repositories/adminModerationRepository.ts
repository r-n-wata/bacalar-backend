import {
  ContentStatus,
  type EventCategory,
  type LocaleCode,
  type Prisma,
  type PrismaClient,
  type TourCategory,
} from '@prisma/client'
import type {
  AdminEventSubmission,
  AdminRestaurantSubmission,
  AdminSubmissionEntityType,
  AdminSubmissionListItem,
  AdminSubmissionListType,
  AdminTourSubmission,
  SubmissionModerationResult,
} from '../types/admin'

type ReviewMetadata = {
  reviewedBy: string
}

export type AdminModerationRepository = {
  listPendingSubmissions(
    type: AdminSubmissionListType,
  ): Promise<AdminSubmissionListItem[]>
  approveSubmission(
    type: AdminSubmissionEntityType,
    submissionId: string,
    metadata: ReviewMetadata,
  ): Promise<SubmissionModerationResult>
  rejectSubmission(
    type: AdminSubmissionEntityType,
    submissionId: string,
    metadata: ReviewMetadata,
  ): Promise<SubmissionModerationResult>
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function buildSubmissionSlug(value: string, submissionId: string) {
  const base = slugify(value) || 'submission'

  return `${base}-${submissionId.slice(-6).toLowerCase()}`
}

function formatEventDateLabel(startsAt: Date, locale: LocaleCode) {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(startsAt)
}

function formatTourCategoryLabel(category: TourCategory, locale: LocaleCode) {
  if (locale === 'es') {
    switch (category) {
      case 'premium':
        return 'Premium'
      case 'group':
        return 'Grupo'
      case 'adventure':
        return 'Aventura'
    }
  }

  switch (category) {
    case 'premium':
      return 'Premium'
    case 'group':
      return 'Group'
    case 'adventure':
      return 'Adventure'
  }
}

function formatRestaurantVibe(
  moment: string,
  locale: LocaleCode,
) {
  if (locale === 'es') {
    switch (moment) {
      case 'breakfast':
        return 'Desayuno destacado'
      case 'lunch':
        return 'Comida destacada'
      case 'dinner':
        return 'Cena destacada'
    }
  }

  switch (moment) {
    case 'breakfast':
      return 'Breakfast favorite'
    case 'lunch':
      return 'Lunch favorite'
    case 'dinner':
      return 'Dinner pick'
    default:
      return locale === 'es' ? 'Lugar destacado' : 'Featured spot'
  }
}

async function resolveLocaleId(
  transaction: Prisma.TransactionClient,
  code: LocaleCode,
) {
  const locale = await transaction.locale.findUnique({
    where: {
      code,
    },
  })

  if (!locale) {
    throw new Error(`Locale ${code} is not available.`)
  }

  return locale.id
}

async function nextSortOrder(
  transaction: Prisma.TransactionClient,
  model: 'event' | 'restaurant' | 'tour',
) {
  const aggregates = {
    event: () => transaction.event.aggregate({ _max: { sortOrder: true } }),
    restaurant: () =>
      transaction.restaurant.aggregate({ _max: { sortOrder: true } }),
    tour: () => transaction.tour.aggregate({ _max: { sortOrder: true } }),
  }
  const result = await aggregates[model]()

  return (result._max.sortOrder ?? -1) + 1
}

function assertPendingStatus<T extends { status: string }>(
  record: T | null,
  missingMessage: string,
) {
  if (!record) {
    throw new Error(missingMessage)
  }

  if (record.status !== 'PENDING') {
    throw new Error('SUBMISSION_NOT_PENDING')
  }

  return record
}

function mapImages(
  images: Array<{
    id: string
    source: 'UPLOADED' | 'EXTERNAL_URL'
    url: string
    objectKey: string | null
    mimeType: string | null
    originalFilename: string | null
    sortOrder: number
  }>,
) {
  return images.map((image) => ({
    id: image.id,
    source: image.source,
    url: image.url,
    objectKey: image.objectKey ?? undefined,
    mimeType: image.mimeType ?? undefined,
    originalFilename: image.originalFilename ?? undefined,
    sortOrder: image.sortOrder,
  }))
}

function mapEventSubmission(record: {
  id: string
  title: string
  startsAt: Date
  location: string
  category: EventCategory
  description: string
  contactName: string
  contactMethod: string
  instagram: string | null
  whatsapp: string | null
  submittedLocale: LocaleCode
  status: string
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
}): AdminEventSubmission {
  return {
    id: record.id,
    type: 'events',
    title: record.title,
    startsAt: record.startsAt.toISOString(),
    location: record.location,
    category: record.category,
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    submittedLocale: record.submittedLocale,
    status: record.status as AdminEventSubmission['status'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    images: mapImages(record.images),
  }
}

function mapRestaurantSubmission(record: {
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
  submittedLocale: LocaleCode
  status: string
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
}): AdminRestaurantSubmission {
  return {
    id: record.id,
    type: 'restaurants',
    name: record.name,
    cuisine: record.cuisine,
    moment: record.moment as AdminRestaurantSubmission['moment'],
    priceBand: record.priceBand as AdminRestaurantSubmission['priceBand'],
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    submittedLocale: record.submittedLocale,
    status: record.status as AdminRestaurantSubmission['status'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    images: mapImages(record.images),
  }
}

function mapTourSubmission(record: {
  id: string
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  description: string
  contactName: string
  contactMethod: string
  instagram: string | null
  whatsapp: string | null
  submittedLocale: LocaleCode
  status: string
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
}): AdminTourSubmission {
  return {
    id: record.id,
    type: 'tours',
    name: record.name,
    category: record.category,
    durationHours: record.durationHours,
    priceFrom: record.priceFrom,
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    submittedLocale: record.submittedLocale,
    status: record.status as AdminTourSubmission['status'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    images: mapImages(record.images),
  }
}

export function createPrismaAdminModerationRepository(
  prisma: PrismaClient,
): AdminModerationRepository {
  return {
    async listPendingSubmissions(type) {
      const [events, restaurants, tours] = await Promise.all([
        type === 'all' || type === 'events'
          ? prisma.eventSubmission.findMany({
              where: { status: 'PENDING' },
              orderBy: { createdAt: 'desc' },
              include: {
                images: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            })
          : Promise.resolve([]),
        type === 'all' || type === 'restaurants'
          ? prisma.restaurantSubmission.findMany({
              where: { status: 'PENDING' },
              orderBy: { createdAt: 'desc' },
              include: {
                images: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            })
          : Promise.resolve([]),
        type === 'all' || type === 'tours'
          ? prisma.tourSubmission.findMany({
              where: { status: 'PENDING' },
              orderBy: { createdAt: 'desc' },
              include: {
                images: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            })
          : Promise.resolve([]),
      ])

      return [
        ...events.map(mapEventSubmission),
        ...restaurants.map(mapRestaurantSubmission),
        ...tours.map(mapTourSubmission),
      ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },
    async approveSubmission(type, submissionId, metadata) {
      const reviewedAt = new Date()

      switch (type) {
        case 'events':
          return prisma.$transaction(async (transaction) => {
            const submission = assertPendingStatus(
              await transaction.eventSubmission.findUnique({
                where: { id: submissionId },
              }),
              'EVENT_SUBMISSION_NOT_FOUND',
            )
            const localeId = await resolveLocaleId(
              transaction,
              submission.submittedLocale,
            )
            const published = await transaction.event.create({
              data: {
                slug: buildSubmissionSlug(submission.title, submission.id),
                status: ContentStatus.PUBLISHED,
                category: submission.category,
                sortOrder: await nextSortOrder(transaction, 'event'),
                startsAt: submission.startsAt,
                publishedAt: reviewedAt,
                createdBy: metadata.reviewedBy,
                updatedBy: metadata.reviewedBy,
                translations: {
                  create: {
                    localeId,
                    title: submission.title,
                    dateLabel: formatEventDateLabel(
                      submission.startsAt,
                      submission.submittedLocale,
                    ),
                    venue: submission.location,
                    description: submission.description,
                  },
                },
              },
            })

            await transaction.eventSubmission.update({
              where: { id: submission.id },
              data: {
                status: 'APPROVED',
                approvedEventId: published.id,
                reviewedAt,
                reviewedBy: metadata.reviewedBy,
              },
            })

            return {
              id: submission.id,
              type,
              status: 'APPROVED',
              reviewedAt: reviewedAt.toISOString(),
              reviewedBy: metadata.reviewedBy,
              publishedRecordId: published.id,
            } satisfies SubmissionModerationResult
          })
        case 'restaurants':
          return prisma.$transaction(async (transaction) => {
            const submission = assertPendingStatus(
              await transaction.restaurantSubmission.findUnique({
                where: { id: submissionId },
              }),
              'RESTAURANT_SUBMISSION_NOT_FOUND',
            )
            const localeId = await resolveLocaleId(
              transaction,
              submission.submittedLocale,
            )
            const published = await transaction.restaurant.create({
              data: {
                slug: buildSubmissionSlug(submission.name, submission.id),
                status: ContentStatus.PUBLISHED,
                priceBand: submission.priceBand,
                moment: submission.moment,
                sortOrder: await nextSortOrder(transaction, 'restaurant'),
                publishedAt: reviewedAt,
                createdBy: metadata.reviewedBy,
                updatedBy: metadata.reviewedBy,
                translations: {
                  create: {
                    localeId,
                    name: submission.name,
                    cuisine: submission.cuisine,
                    vibe: formatRestaurantVibe(
                      submission.moment,
                      submission.submittedLocale,
                    ),
                    description: submission.description,
                  },
                },
              },
            })

            await transaction.restaurantSubmission.update({
              where: { id: submission.id },
              data: {
                status: 'APPROVED',
                approvedRestaurantId: published.id,
                reviewedAt,
                reviewedBy: metadata.reviewedBy,
              },
            })

            return {
              id: submission.id,
              type,
              status: 'APPROVED',
              reviewedAt: reviewedAt.toISOString(),
              reviewedBy: metadata.reviewedBy,
              publishedRecordId: published.id,
            } satisfies SubmissionModerationResult
          })
        case 'tours':
          return prisma.$transaction(async (transaction) => {
            const submission = assertPendingStatus(
              await transaction.tourSubmission.findUnique({
                where: { id: submissionId },
              }),
              'TOUR_SUBMISSION_NOT_FOUND',
            )
            const localeId = await resolveLocaleId(
              transaction,
              submission.submittedLocale,
            )
            const published = await transaction.tour.create({
              data: {
                slug: buildSubmissionSlug(submission.name, submission.id),
                status: ContentStatus.PUBLISHED,
                category: submission.category,
                durationHours: submission.durationHours,
                priceFrom: submission.priceFrom,
                sortOrder: await nextSortOrder(transaction, 'tour'),
                isFeatured: false,
                publishedAt: reviewedAt,
                createdBy: metadata.reviewedBy,
                updatedBy: metadata.reviewedBy,
                translations: {
                  create: {
                    localeId,
                    name: submission.name,
                    category: formatTourCategoryLabel(
                      submission.category,
                      submission.submittedLocale,
                    ),
                    description: submission.description,
                  },
                },
              },
            })

            await transaction.tourSubmission.update({
              where: { id: submission.id },
              data: {
                status: 'APPROVED',
                approvedTourId: published.id,
                reviewedAt,
                reviewedBy: metadata.reviewedBy,
              },
            })

            return {
              id: submission.id,
              type,
              status: 'APPROVED',
              reviewedAt: reviewedAt.toISOString(),
              reviewedBy: metadata.reviewedBy,
              publishedRecordId: published.id,
            } satisfies SubmissionModerationResult
          })
      }
    },
    async rejectSubmission(type, submissionId, metadata) {
      const reviewedAt = new Date()

      const updateStatus = <TRecord extends { id: string; status: string }>(
        record: TRecord | null,
        missingMessage: string,
      ) => {
        const pending = assertPendingStatus(record, missingMessage)

        return {
          id: pending.id,
        }
      }

      switch (type) {
        case 'events': {
          const pending = updateStatus(
            await prisma.eventSubmission.findUnique({
              where: { id: submissionId },
            }),
            'EVENT_SUBMISSION_NOT_FOUND',
          )
          await prisma.eventSubmission.update({
            where: { id: pending.id },
            data: {
              status: 'REJECTED',
              reviewedAt,
              reviewedBy: metadata.reviewedBy,
            },
          })

          return {
            id: pending.id,
            type,
            status: 'REJECTED',
            reviewedAt: reviewedAt.toISOString(),
            reviewedBy: metadata.reviewedBy,
          }
        }
        case 'restaurants': {
          const pending = updateStatus(
            await prisma.restaurantSubmission.findUnique({
              where: { id: submissionId },
            }),
            'RESTAURANT_SUBMISSION_NOT_FOUND',
          )
          await prisma.restaurantSubmission.update({
            where: { id: pending.id },
            data: {
              status: 'REJECTED',
              reviewedAt,
              reviewedBy: metadata.reviewedBy,
            },
          })

          return {
            id: pending.id,
            type,
            status: 'REJECTED',
            reviewedAt: reviewedAt.toISOString(),
            reviewedBy: metadata.reviewedBy,
          }
        }
        case 'tours': {
          const pending = updateStatus(
            await prisma.tourSubmission.findUnique({
              where: { id: submissionId },
            }),
            'TOUR_SUBMISSION_NOT_FOUND',
          )
          await prisma.tourSubmission.update({
            where: { id: pending.id },
            data: {
              status: 'REJECTED',
              reviewedAt,
              reviewedBy: metadata.reviewedBy,
            },
          })

          return {
            id: pending.id,
            type,
            status: 'REJECTED',
            reviewedAt: reviewedAt.toISOString(),
            reviewedBy: metadata.reviewedBy,
          }
        }
      }
    },
  }
}
