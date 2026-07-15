import {
  ContentStatus,
  type EventCategory,
  type EventSubmissionStatus,
  type LocaleCode,
  type Prisma,
  type PrismaClient,
  type RestaurantSubmissionStatus,
  type TourSubmissionStatus,
} from '@prisma/client'
import type {
  AdminEventSubmissionDetail,
  AdminEventSubmissionListItem,
  AdminRestaurantSubmissionDetail,
  AdminRestaurantSubmissionListItem,
  AdminSubmissionDetail,
  AdminSubmissionEntityType,
  AdminSubmissionListItem,
  AdminSubmissionListType,
  AdminSubmissionStatusFilter,
  AdminTourSubmissionDetail,
  AdminTourSubmissionListItem,
  SubmissionModerationResult,
} from '../types/admin'

type ReviewMetadata = {
  reviewedBy: string
}

type SubmissionListFilters = {
  type: AdminSubmissionListType
  status: AdminSubmissionStatusFilter
}

type SubmissionImageRow = {
  id: string
  source: 'UPLOADED' | 'EXTERNAL_URL'
  url: string
  objectKey: string | null
  mimeType: string | null
  originalFilename: string | null
  sortOrder: number
}

export type AdminModerationRepository = {
  listSubmissions(filters: SubmissionListFilters): Promise<AdminSubmissionListItem[]>
  getSubmissionDetail(
    type: AdminSubmissionEntityType,
    submissionId: string,
  ): Promise<AdminSubmissionDetail>
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

function formatTourPriceLabel(priceFrom: number) {
  return `From ${priceFrom} MXN`
}

function formatTourDurationLabel(durationHours: number) {
  return `${durationHours} hours`
}

function formatRestaurantVibe(moment: string, locale: LocaleCode) {
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

function assertFound<T>(record: T | null, missingMessage: string) {
  if (!record) {
    throw new Error(missingMessage)
  }

  return record
}

function mapImages(images: SubmissionImageRow[]) {
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

function mapThumbnail(images: SubmissionImageRow[]) {
  const leadImage = images[0]

  if (!leadImage) {
    return undefined
  }

  return {
    id: leadImage.id,
    source: leadImage.source,
    url: leadImage.url,
    objectKey: leadImage.objectKey ?? undefined,
    mimeType: leadImage.mimeType ?? undefined,
    originalFilename: leadImage.originalFilename ?? undefined,
    sortOrder: leadImage.sortOrder,
  }
}

function mapEventListItem(record: {
  id: string
  title: string
  startsAt: Date
  location: string
  category: EventCategory
  submittedLocale: LocaleCode
  status: string
  createdAt: Date
  updatedAt: Date
  images: SubmissionImageRow[]
}): AdminEventSubmissionListItem {
  return {
    id: record.id,
    type: 'events',
    title: record.title,
    startsAt: record.startsAt.toISOString(),
    location: record.location,
    category: record.category,
    submittedLocale: record.submittedLocale,
    status: record.status as AdminEventSubmissionListItem['status'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    thumbnail: mapThumbnail(record.images),
  }
}

function mapRestaurantListItem(record: {
  id: string
  name: string
  cuisine: string
  moment: string
  priceBand: string
  submittedLocale: LocaleCode
  status: string
  createdAt: Date
  updatedAt: Date
  images: SubmissionImageRow[]
}): AdminRestaurantSubmissionListItem {
  return {
    id: record.id,
    type: 'restaurants',
    name: record.name,
    cuisine: record.cuisine,
    moment: record.moment as AdminRestaurantSubmissionListItem['moment'],
    priceBand: record.priceBand as AdminRestaurantSubmissionListItem['priceBand'],
    submittedLocale: record.submittedLocale,
    status: record.status as AdminRestaurantSubmissionListItem['status'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    thumbnail: mapThumbnail(record.images),
  }
}

function mapTourListItem(record: {
  id: string
  name: string
  category: string
  durationHours: number
  priceFrom: number
  submittedLocale: LocaleCode
  status: string
  createdAt: Date
  updatedAt: Date
  images: SubmissionImageRow[]
}): AdminTourSubmissionListItem {
  return {
    id: record.id,
    type: 'tours',
    name: record.name,
    category: record.category,
    durationHours: record.durationHours,
    priceFrom: record.priceFrom,
    submittedLocale: record.submittedLocale,
    status: record.status as AdminTourSubmissionListItem['status'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    thumbnail: mapThumbnail(record.images),
  }
}

function mapEventDetail(record: {
  id: string
  title: string
  startsAt: Date
  location: string
  address: string | null
  mapUrl: string | null
  mapEmbedUrl: string | null
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
  images: SubmissionImageRow[]
}): AdminEventSubmissionDetail {
  return {
    ...mapEventListItem(record),
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    address: record.address ?? undefined,
    mapUrl: record.mapUrl ?? undefined,
    mapEmbedUrl: record.mapEmbedUrl ?? undefined,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    images: mapImages(record.images),
  }
}

function mapRestaurantDetail(record: {
  id: string
  name: string
  cuisine: string
  moment: string
  priceBand: string
  address: string | null
  mapUrl: string | null
  mapEmbedUrl: string | null
  description: string
  contactName: string
  contactMethod: string
  instagram: string | null
  whatsapp: string | null
  submittedLocale: LocaleCode
  status: string
  createdAt: Date
  updatedAt: Date
  images: SubmissionImageRow[]
}): AdminRestaurantSubmissionDetail {
  return {
    ...mapRestaurantListItem(record),
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    address: record.address ?? undefined,
    mapUrl: record.mapUrl ?? undefined,
    mapEmbedUrl: record.mapEmbedUrl ?? undefined,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    images: mapImages(record.images),
  }
}

function mapTourDetail(record: {
  id: string
  name: string
  category: string
  durationHours: number
  priceFrom: number
  address: string | null
  mapUrl: string | null
  mapEmbedUrl: string | null
  description: string
  contactName: string
  contactMethod: string
  instagram: string | null
  whatsapp: string | null
  submittedLocale: LocaleCode
  status: string
  createdAt: Date
  updatedAt: Date
  images: SubmissionImageRow[]
}): AdminTourSubmissionDetail {
  return {
    ...mapTourListItem(record),
    description: record.description,
    contactName: record.contactName,
    contactMethod: record.contactMethod,
    address: record.address ?? undefined,
    mapUrl: record.mapUrl ?? undefined,
    mapEmbedUrl: record.mapEmbedUrl ?? undefined,
    instagram: record.instagram ?? undefined,
    whatsapp: record.whatsapp ?? undefined,
    images: mapImages(record.images),
  }
}

function resolveEventStatus(status: AdminSubmissionStatusFilter) {
  if (status === 'all') {
    return undefined
  }

  return status.toUpperCase() as EventSubmissionStatus
}

function resolveRestaurantStatus(status: AdminSubmissionStatusFilter) {
  if (status === 'all') {
    return undefined
  }

  return status.toUpperCase() as RestaurantSubmissionStatus
}

function resolveTourStatus(status: AdminSubmissionStatusFilter) {
  if (status === 'all') {
    return undefined
  }

  return status.toUpperCase() as TourSubmissionStatus
}

export function createPrismaAdminModerationRepository(
  prisma: PrismaClient,
): AdminModerationRepository {
  return {
    async listSubmissions(filters) {
      const [events, restaurants, tours] = await Promise.all([
        filters.type === 'all' || filters.type === 'events'
          ? prisma.eventSubmission.findMany({
              where: {
                ...(resolveEventStatus(filters.status)
                  ? { status: resolveEventStatus(filters.status) }
                  : {}),
              },
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
        filters.type === 'all' || filters.type === 'restaurants'
          ? prisma.restaurantSubmission.findMany({
              where: {
                ...(resolveRestaurantStatus(filters.status)
                  ? { status: resolveRestaurantStatus(filters.status) }
                  : {}),
              },
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
        filters.type === 'all' || filters.type === 'tours'
          ? prisma.tourSubmission.findMany({
              where: {
                ...(resolveTourStatus(filters.status)
                  ? { status: resolveTourStatus(filters.status) }
                  : {}),
              },
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
        ...events.map(mapEventListItem),
        ...restaurants.map(mapRestaurantListItem),
        ...tours.map(mapTourListItem),
      ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },
    async getSubmissionDetail(type, submissionId) {
      switch (type) {
        case 'events':
          return mapEventDetail(
            assertFound(
              await prisma.eventSubmission.findUnique({
                where: { id: submissionId },
                include: {
                  images: {
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              }),
              'EVENT_SUBMISSION_NOT_FOUND',
            ),
          )
        case 'restaurants':
          return mapRestaurantDetail(
            assertFound(
              await prisma.restaurantSubmission.findUnique({
                where: { id: submissionId },
                include: {
                  images: {
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              }),
              'RESTAURANT_SUBMISSION_NOT_FOUND',
            ),
          )
        case 'tours':
          return mapTourDetail(
            assertFound(
              await prisma.tourSubmission.findUnique({
                where: { id: submissionId },
                include: {
                  images: {
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              }),
              'TOUR_SUBMISSION_NOT_FOUND',
            ),
          )
      }
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
                address: submission.address,
                mapUrl: submission.mapUrl,
                mapEmbedUrl: submission.mapEmbedUrl,
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
                moments: [submission.moment as 'breakfast' | 'lunch' | 'dinner'],
                address: submission.address,
                mapUrl: submission.mapUrl,
                mapEmbedUrl: submission.mapEmbedUrl,
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
                include: {
                  images: {
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
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
                duration: formatTourDurationLabel(submission.durationHours),
                priceFrom: formatTourPriceLabel(submission.priceFrom),
                privateOrShared: 'Shared',
                bestFor: 'Flexible',
                difficulty: 'Easy',
                suitableForKids: 'Yes',
                address: submission.address,
                mapUrl: submission.mapUrl,
                mapEmbedUrl: submission.mapEmbedUrl,
                operatorName: submission.contactName,
                operatorPrimaryContactMethod: submission.contactMethod,
                operatorInstagram: submission.instagram,
                operatorWhatsapp: submission.whatsapp,
                imageUrls: submission.images.map((image) => image.url),
                sortOrder: await nextSortOrder(transaction, 'tour'),
                isFeatured: false,
                publishedAt: reviewedAt,
                createdBy: metadata.reviewedBy,
                updatedBy: metadata.reviewedBy,
                translations: {
                  create: {
                    localeId,
                    name: submission.name,
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
