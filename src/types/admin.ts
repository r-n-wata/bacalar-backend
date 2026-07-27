import { z } from 'zod'
import type {
  AppLanguage,
  EventCategory,
  HomeImage,
  RestaurantMoment,
  TourCategory,
} from './content'
import {
  eventSubmissionMediaSchema,
  type EventSubmissionMediaInput,
  type SubmissionImageRecord,
} from './eventSubmissions'
import { optionalAddressSchema, optionalMapEmbedUrlSchema, optionalMapUrlSchema } from './mapFields'
import {
  restaurantSubmissionMediaSchema,
  type RestaurantSubmissionMediaInput,
} from './restaurantSubmissions'
import {
  MAX_SUBMISSION_IMAGES,
  tourSubmissionMediaSchema,
  type TourSubmissionMediaInput,
} from './tourSubmissions'

export type AdminSubmissionListType = 'all' | 'events' | 'restaurants' | 'tours'
export type AdminSubmissionEntityType = Exclude<AdminSubmissionListType, 'all'>
export type AdminSubmissionStatusFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
export type ReviewableSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AdminSession = {
  email: string
  userId: string
}

export type AdminSubmissionThumbnail = SubmissionImageRecord

type AdminSubmissionListBase = {
  id: string
  type: AdminSubmissionEntityType
  status: ReviewableSubmissionStatus
  submittedLocale: AppLanguage
  createdAt: string
  updatedAt: string
  thumbnail?: AdminSubmissionThumbnail
}

type AdminSubmissionDetailBase = AdminSubmissionListBase & {
  contactName: string
  contactMethod: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  instagram?: string
  whatsapp?: string
  images: SubmissionImageRecord[]
}

export type AdminEventSubmissionListItem = AdminSubmissionListBase & {
  type: 'events'
  title: string
  startsAt: string
  location: string
  category: EventCategory
}

export type AdminRestaurantSubmissionListItem = AdminSubmissionListBase & {
  type: 'restaurants'
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
}

export type AdminTourSubmissionListItem = AdminSubmissionListBase & {
  type: 'tours'
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
}

export type AdminSubmissionListItem =
  | AdminEventSubmissionListItem
  | AdminRestaurantSubmissionListItem
  | AdminTourSubmissionListItem

export type AdminEventSubmissionDetail = AdminSubmissionDetailBase & {
  type: 'events'
  title: string
  startsAt: string
  location: string
  category: EventCategory
  description: string
}

export type AdminRestaurantSubmissionDetail = AdminSubmissionDetailBase & {
  type: 'restaurants'
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
  description: string
}

export type AdminTourSubmissionDetail = AdminSubmissionDetailBase & {
  type: 'tours'
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  description: string
  includedItems?: string[]
}

export type AdminSubmissionDetail =
  | AdminEventSubmissionDetail
  | AdminRestaurantSubmissionDetail
  | AdminTourSubmissionDetail

export type AdminSubmissionListResponse = {
  items: AdminSubmissionListItem[]
}

export type AdminSubmissionDetailResponse = {
  item: AdminSubmissionDetail
}

export type SubmissionModerationResult = {
  id: string
  type: AdminSubmissionEntityType
  status: 'APPROVED' | 'REJECTED'
  reviewedAt: string
  reviewedBy: string
  publishedRecordId?: string
}

export type AdminPublishedContentType = 'events' | 'restaurants' | 'tours'

type AdminPublishedContentBase = {
  id: string
  type: AdminPublishedContentType
  title: string
  route: string
  isFeatured: boolean
  featuredOrder?: number
  image?: HomeImage
}

export type AdminPublishedEventItem = AdminPublishedContentBase & {
  type: 'events'
  category: EventCategory
  subtitle: string
}

export type AdminPublishedRestaurantItem = AdminPublishedContentBase & {
  type: 'restaurants'
  moments: RestaurantMoment[]
  subtitle: string
}

export type AdminPublishedTourItem = AdminPublishedContentBase & {
  type: 'tours'
  category: TourCategory
  subtitle: string
}

export type AdminPublishedContentItem =
  | AdminPublishedEventItem
  | AdminPublishedRestaurantItem
  | AdminPublishedTourItem

export type AdminPublishedContentListResponse = {
  items: AdminPublishedContentItem[]
  featuredCount: number
  featuredCap: number
}

export type UpdateAdminPublishedContentFeaturedInput = {
  type: AdminPublishedContentType
  id: string
  isFeatured: boolean
  language: AppLanguage
}

export type AdminLocalizedValue<TFields> = {
  en: TFields
  es: TFields
}

type AdminPublishedContentDetailBase = {
  id: string
  type: AdminPublishedContentType
  route: string
  isFeatured: boolean
  featuredOrder?: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

type AdminPublishedEventTranslations = AdminLocalizedValue<{
  title: string
  dateLabel: string
  venue: string
  description: string
}>

type AdminPublishedRestaurantTranslations = AdminLocalizedValue<{
  name: string
  cuisine: string
  vibe: string
  description: string
}>

type AdminPublishedTourTranslations = AdminLocalizedValue<{
  name: string
  description: string
  included?: string
  includedItems?: string[]
  whatToBring?: string
  operatorDescription?: string
}>

export type AdminPublishedEventDetail = AdminPublishedContentDetailBase & {
  type: 'events'
  category: EventCategory
  startsAt: string
  organizerName?: string
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  media: SubmissionImageRecord[]
  translations: AdminPublishedEventTranslations
}

export type AdminPublishedRestaurantDetail = AdminPublishedContentDetailBase & {
  type: 'restaurants'
  priceBand: '$' | '$$' | '$$$'
  moments: RestaurantMoment[]
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  media: SubmissionImageRecord[]
  translations: AdminPublishedRestaurantTranslations
}

export type AdminPublishedTourDetail = AdminPublishedContentDetailBase & {
  type: 'tours'
  category: TourCategory
  durationHours: number
  priceFrom: number
  privateOrShared: string
  bestFor: string
  difficulty: string
  suitableForKids: string
  meetingPoint?: string
  providerName?: string
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  operatorName: string
  operatorWhatsapp?: string
  operatorInstagram?: string
  operatorWebsite?: string
  operatorPrimaryContactMethod?: string
  media: SubmissionImageRecord[]
  translations: AdminPublishedTourTranslations
}

export type AdminPublishedContentDetail =
  | AdminPublishedEventDetail
  | AdminPublishedRestaurantDetail
  | AdminPublishedTourDetail

export type AdminPublishedContentDetailResponse = {
  item: AdminPublishedContentDetail
}

export type UpdateAdminPublishedEventInput = {
  type: 'events'
  id: string
  category: EventCategory
  startsAt: string
  organizerName?: string
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  media: EventSubmissionMediaInput[]
  translations: AdminPublishedEventTranslations
}

export type UpdateAdminPublishedRestaurantInput = {
  type: 'restaurants'
  id: string
  priceBand: '$' | '$$' | '$$$'
  moments: RestaurantMoment[]
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  media: RestaurantSubmissionMediaInput[]
  translations: AdminPublishedRestaurantTranslations
}

export type UpdateAdminPublishedTourInput = {
  type: 'tours'
  id: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  privateOrShared: string
  bestFor: string
  difficulty: string
  suitableForKids: string
  meetingPoint?: string
  providerName?: string
  whatsapp?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  email?: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  operatorName: string
  operatorWhatsapp?: string
  operatorInstagram?: string
  operatorWebsite?: string
  operatorPrimaryContactMethod?: string
  media: TourSubmissionMediaInput[]
  translations: AdminPublishedTourTranslations
}

export type UpdateAdminPublishedContentInput =
  | UpdateAdminPublishedEventInput
  | UpdateAdminPublishedRestaurantInput
  | UpdateAdminPublishedTourInput

export type UpdateAdminPublishedContentResult = {
  item: AdminPublishedContentDetail
}

export type ArchiveAdminPublishedContentResult = {
  id: string
  type: AdminPublishedContentType
  status: 'ARCHIVED'
}

const requiredTrimmedString = (min: number, max: number) =>
  z.string().trim().min(min).max(max)

const optionalTrimmedString = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => value?.trim() || undefined)

const editableTrimmedString = (max: number) => z.string().trim().max(max)

const eventTranslationSchema = z.object({
  title: editableTrimmedString(140),
  dateLabel: editableTrimmedString(160),
  venue: editableTrimmedString(160),
  description: editableTrimmedString(4000),
})

const restaurantTranslationSchema = z.object({
  name: editableTrimmedString(140),
  cuisine: editableTrimmedString(120),
  vibe: editableTrimmedString(160),
  description: editableTrimmedString(4000),
})

const tourTranslationSchema = z.object({
  name: editableTrimmedString(140),
  description: editableTrimmedString(4000),
  included: optionalTrimmedString(2000),
  includedItems: z.array(z.string().trim().min(1).max(160)).max(20).optional(),
  whatToBring: optionalTrimmedString(2000),
  operatorDescription: optionalTrimmedString(4000),
})

function localizedSchemaWithFallback<TSchema extends z.ZodRawShape>(
  schemaShape: TSchema,
  requiredLengths: Partial<Record<Extract<keyof TSchema, string>, number>>,
) {
  const localizedSchema = z.object({
    en: z.object(schemaShape),
    es: z.object(schemaShape),
  })

  return localizedSchema.superRefine((value, context) => {
    const requiredEntries = Object.entries(requiredLengths) as Array<[string, number]>

    const isLocaleComplete = (localeValue: Record<string, unknown>) =>
      requiredEntries.every(([field, min]) => {
        const fieldValue = localeValue[field]
        return typeof fieldValue === 'string' && fieldValue.trim().length >= min
      })

    if (isLocaleComplete(value.en as Record<string, unknown>) || isLocaleComplete(value.es as Record<string, unknown>)) {
      return
    }

    let hasLengthIssues = false

    for (const [field, min] of requiredEntries) {
      const enValue = value.en[field as keyof typeof value.en]
      const esValue = value.es[field as keyof typeof value.es]

      if (typeof enValue === 'string' && enValue.trim().length > 0) {
        if (enValue.trim().length < min) {
          hasLengthIssues = true
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['en', field],
            message: `Must be at least ${min} characters.`,
          })
        }
      }

      if (typeof esValue === 'string' && esValue.trim().length > 0) {
        if (esValue.trim().length < min) {
          hasLengthIssues = true
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['es', field],
            message: `Must be at least ${min} characters.`,
          })
        }
      }
    }

    if (hasLengthIssues) {
      return
    }

    for (const [field] of requiredEntries) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['en', field],
        message: 'Required',
      })
    }
  })
}

export const updateAdminPublishedEventSchema = z
  .object({
    category: z.enum(['music', 'wellness', 'food']),
    startsAt: z.iso.datetime({ offset: true }),
    organizerName: optionalTrimmedString(160),
    whatsapp: optionalTrimmedString(120),
    phone: optionalTrimmedString(120),
    website: optionalTrimmedString(500),
    instagram: optionalTrimmedString(120),
    facebook: optionalTrimmedString(120),
    email: optionalTrimmedString(220),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    media: z.array(eventSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
    translations: localizedSchemaWithFallback(
      eventTranslationSchema.shape,
      {
        title: 3,
        dateLabel: 2,
        venue: 2,
        description: 20,
      },
    ),
  })
  .transform((value) => ({
    ...value,
    type: 'events' as const,
  })) satisfies z.ZodType<Omit<UpdateAdminPublishedEventInput, 'id'>>

export const updateAdminPublishedRestaurantSchema = z
  .object({
    priceBand: z.enum(['$', '$$', '$$$']),
    moments: z.array(z.enum(['breakfast', 'lunch', 'dinner'])).min(1).max(3),
    whatsapp: optionalTrimmedString(120),
    phone: optionalTrimmedString(120),
    website: optionalTrimmedString(500),
    instagram: optionalTrimmedString(120),
    facebook: optionalTrimmedString(120),
    email: optionalTrimmedString(220),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    media: z.array(restaurantSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
    translations: localizedSchemaWithFallback(
      restaurantTranslationSchema.shape,
      {
        name: 2,
        cuisine: 2,
        vibe: 2,
        description: 20,
      },
    ),
  })
  .transform((value) => ({
    ...value,
    type: 'restaurants' as const,
    moments: [...new Set(value.moments)] as RestaurantMoment[],
  })) satisfies z.ZodType<Omit<UpdateAdminPublishedRestaurantInput, 'id'>>

export const updateAdminPublishedTourSchema = z
  .object({
    category: requiredTrimmedString(2, 80),
    durationHours: z.number().int().positive().max(24),
    priceFrom: z.number().int().positive().max(100_000),
    privateOrShared: requiredTrimmedString(2, 80),
    bestFor: requiredTrimmedString(2, 120),
    difficulty: requiredTrimmedString(2, 80),
    suitableForKids: requiredTrimmedString(2, 80),
    meetingPoint: optionalTrimmedString(240),
    providerName: optionalTrimmedString(160),
    whatsapp: optionalTrimmedString(120),
    phone: optionalTrimmedString(120),
    website: optionalTrimmedString(500),
    instagram: optionalTrimmedString(120),
    facebook: optionalTrimmedString(120),
    email: optionalTrimmedString(220),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    operatorName: requiredTrimmedString(2, 160),
    operatorWhatsapp: optionalTrimmedString(120),
    operatorInstagram: optionalTrimmedString(120),
    operatorWebsite: optionalTrimmedString(500),
    operatorPrimaryContactMethod: optionalTrimmedString(220),
    media: z.array(tourSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
    translations: localizedSchemaWithFallback(
      tourTranslationSchema.shape,
      {
        name: 2,
        description: 20,
      },
    ),
  })
  .transform((value) => ({
    ...value,
    type: 'tours' as const,
  })) satisfies z.ZodType<Omit<UpdateAdminPublishedTourInput, 'id'>>
