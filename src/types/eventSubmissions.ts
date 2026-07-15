import { z } from 'zod'
import type { EventCategory, AppLanguage } from './content'
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

export type EventSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type EventSubmissionUploadedImageInput = {
  kind: 'uploaded'
  url: string
  objectKey: string
  mimeType: SubmissionImageMimeType
  filename: string
}

export type EventSubmissionExternalImageInput = {
  kind: 'external'
  url: string
}

export type EventSubmissionMediaInput =
  | EventSubmissionUploadedImageInput
  | EventSubmissionExternalImageInput

export type CreateEventSubmissionInput = {
  title: string
  startsAt: string
  location: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  category: EventCategory
  description: string
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  submittedLocale: AppLanguage
  media: EventSubmissionMediaInput[]
}

export type CreateEventSubmissionResult = {
  id: string
  status: EventSubmissionStatus
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

export type EventSubmissionRecord = {
  id: string
  title: string
  startsAt: string
  location: string
  address?: string
  mapUrl?: string
  mapEmbedUrl?: string
  category: EventCategory
  description: string
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  submittedLocale: AppLanguage
  status: EventSubmissionStatus
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  approvedEventId?: string
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

export const eventSubmissionMediaSchema = z.discriminatedUnion('kind', [
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

export const createEventSubmissionSchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    startsAt: z.iso.datetime({ offset: true }),
    location: z.string().trim().min(2).max(160),
    address: optionalAddressSchema,
    mapUrl: optionalMapUrlSchema,
    mapEmbedUrl: optionalMapEmbedUrlSchema,
    category: z.enum(['music', 'wellness', 'food']),
    description: z.string().trim().min(20).max(4000),
    contactName: z.string().trim().min(2).max(120),
    contactMethod: z.string().trim().min(3).max(220),
    instagram: z.string().trim().max(120).optional(),
    whatsapp: z.string().trim().max(120).optional(),
    submittedLocale: z.enum(['en', 'es']),
    media: z.array(eventSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
  })
  .transform((value) => ({
    ...value,
    address: value.address || undefined,
    mapUrl: value.mapUrl || undefined,
    mapEmbedUrl: value.mapEmbedUrl || undefined,
    instagram: value.instagram || undefined,
    whatsapp: value.whatsapp || undefined,
  })) satisfies z.ZodType<CreateEventSubmissionInput>

export const prepareSubmissionUploadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  mimeType: z.enum(SUBMISSION_IMAGE_MIME_TYPES),
  fileSize: z.number().int().positive().max(MAX_SUBMISSION_IMAGE_SIZE_BYTES),
})
