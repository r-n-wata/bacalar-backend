import { z } from 'zod'
import type { AppLanguage, RestaurantMoment } from './content'
import {
  optionalAddressSchema,
  optionalMapEmbedUrlSchema,
  optionalMapUrlSchema,
} from './mapFields'

export const SUBMISSION_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const MAX_SUBMISSION_IMAGES = 6
export const MAX_SUBMISSION_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export type SubmissionImageMimeType =
  (typeof SUBMISSION_IMAGE_MIME_TYPES)[number]

export type RestaurantSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type RestaurantSubmissionUploadedImageInput = {
  kind: 'uploaded'
  url: string
  objectKey: string
  mimeType: SubmissionImageMimeType
  filename: string
}

export type RestaurantSubmissionExternalImageInput = {
  kind: 'external'
  url: string
}

export type RestaurantSubmissionMediaInput =
  | RestaurantSubmissionUploadedImageInput
  | RestaurantSubmissionExternalImageInput

export type CreateRestaurantSubmissionInput = {
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  description: string
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  submittedLocale: AppLanguage
  media: RestaurantSubmissionMediaInput[]
}

export type CreateRestaurantSubmissionResult = {
  id: string
  status: RestaurantSubmissionStatus
  createdAt: string
}

export type SubmissionImageRecord = {
  id: string
  source: 'UPLOADED' | 'EXTERNAL_URL'
  url: string
  objectKey?: string
  mimeType?: string
  originalFilename?: string
  sortOrder: number
}

export type RestaurantSubmissionRecord = {
  id: string
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  description: string
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  submittedLocale: AppLanguage
  status: RestaurantSubmissionStatus
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  approvedRestaurantId?: string
  createdAt: string
  updatedAt: string
  images: SubmissionImageRecord[]
}

export type PrepareSubmissionUploadInput = {
  filename: string
  mimeType: string
  fileSize: number
}

export type PrepareSubmissionUploadResult = {
  provider: 'supabase'
  bucketName: string
  objectKey: string
  assetUrl: string
  signedUploadUrl: string
  uploadToken: string
}

export const restaurantSubmissionMediaSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('uploaded'),
    url: z.url(),
    objectKey: z.string().min(1).max(512),
    mimeType: z.enum(SUBMISSION_IMAGE_MIME_TYPES),
    filename: z.string().trim().min(1).max(200),
  }),
  z.object({
    kind: z.literal('external'),
    url: z.url(),
  }),
])

export const createRestaurantSubmissionSchema = z
  .object({
    name: z.string().trim().min(2).max(140),
    cuisine: z.string().trim().min(2).max(120),
    moment: z.enum(['breakfast', 'lunch', 'dinner']),
    priceBand: z.enum(['$', '$$', '$$$']),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    description: z.string().trim().min(20).max(4000),
    contactName: z.string().trim().min(2).max(120),
    contactMethod: z.string().trim().min(3).max(220),
    instagram: z.string().trim().max(120).optional(),
    whatsapp: z.string().trim().max(120).optional(),
    submittedLocale: z.enum(['en', 'es']),
    media: z.array(restaurantSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
  })
  .transform((value) => ({
    ...value,
    address: value.address || undefined,
    mapUrl: value.mapUrl || undefined,
    mapEmbedUrl: value.mapEmbedUrl || undefined,
    instagram: value.instagram || undefined,
    whatsapp: value.whatsapp || undefined,
  })) satisfies z.ZodType<CreateRestaurantSubmissionInput>

export const prepareSubmissionUploadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  mimeType: z.enum(SUBMISSION_IMAGE_MIME_TYPES),
  fileSize: z.number().int().positive().max(MAX_SUBMISSION_IMAGE_SIZE_BYTES),
})
