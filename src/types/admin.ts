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
  whatToBring?: string
  operatorDescription?: string
}>

export type AdminPublishedEventDetail = AdminPublishedContentDetailBase & {
  type: 'events'
  category: EventCategory
  startsAt: string
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

const eventTranslationSchema = z.object({
  title: requiredTrimmedString(3, 140),
  dateLabel: requiredTrimmedString(2, 160),
  venue: requiredTrimmedString(2, 160),
  description: requiredTrimmedString(20, 4000),
})

const restaurantTranslationSchema = z.object({
  name: requiredTrimmedString(2, 140),
  cuisine: requiredTrimmedString(2, 120),
  vibe: requiredTrimmedString(2, 160),
  description: requiredTrimmedString(20, 4000),
})

const tourTranslationSchema = z.object({
  name: requiredTrimmedString(2, 140),
  description: requiredTrimmedString(20, 4000),
  included: optionalTrimmedString(2000),
  whatToBring: optionalTrimmedString(2000),
  operatorDescription: optionalTrimmedString(4000),
})

const localizedSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  z.object({
    en: schema,
    es: schema,
  })

export const updateAdminPublishedEventSchema = z
  .object({
    category: z.enum(['music', 'wellness', 'food']),
    startsAt: z.iso.datetime({ offset: true }),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    media: z.array(eventSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
    translations: localizedSchema(eventTranslationSchema),
  })
  .transform((value) => ({
    ...value,
    type: 'events' as const,
  })) satisfies z.ZodType<Omit<UpdateAdminPublishedEventInput, 'id'>>

export const updateAdminPublishedRestaurantSchema = z
  .object({
    priceBand: z.enum(['$', '$$', '$$$']),
    moments: z.array(z.enum(['breakfast', 'lunch', 'dinner'])).min(1).max(3),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    media: z.array(restaurantSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
    translations: localizedSchema(restaurantTranslationSchema),
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
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    operatorName: requiredTrimmedString(2, 160),
    operatorWhatsapp: optionalTrimmedString(120),
    operatorInstagram: optionalTrimmedString(120),
    operatorWebsite: optionalTrimmedString(500),
    operatorPrimaryContactMethod: optionalTrimmedString(220),
    media: z.array(tourSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
    translations: localizedSchema(tourTranslationSchema),
  })
  .transform((value) => ({
    ...value,
    type: 'tours' as const,
  })) satisfies z.ZodType<Omit<UpdateAdminPublishedTourInput, 'id'>>
