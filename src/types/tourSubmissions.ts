import { z } from 'zod'
import type { AppLanguage, TourCategory } from './content'
import {
  MAX_SUBMISSION_IMAGES,
  MAX_SUBMISSION_IMAGE_SIZE_BYTES,
  SUBMISSION_IMAGE_MIME_TYPES,
  type SubmissionImageMimeType,
  type SubmissionImageRecord,
} from './eventSubmissions'

export const SUBMISSION_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

export type TourSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type TourSubmissionUploadedImageInput = {
  kind: 'uploaded'
  url: string
  objectKey: string
  mimeType: SubmissionImageMimeType
  filename: string
}

export type TourSubmissionExternalImageInput = {
  kind: 'external'
  url: string
}

export type TourSubmissionMediaInput =
  | TourSubmissionUploadedImageInput
  | TourSubmissionExternalImageInput

export type CreateTourSubmissionInput = {
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  description: string
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  submittedLocale: AppLanguage
  media: TourSubmissionMediaInput[]
}

export type CreateTourSubmissionResult = {
  id: string
  status: TourSubmissionStatus
  createdAt: string
}

export type TourSubmissionRecord = {
  id: string
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  description: string
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  submittedLocale: AppLanguage
  status: TourSubmissionStatus
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  approvedTourId?: string
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

export const tourSubmissionMediaSchema = z.discriminatedUnion('kind', [
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

export const createTourSubmissionSchema = z
  .object({
    name: z.string().trim().min(2).max(140),
    category: z.string().trim().min(2).max(80),
    durationHours: z.number().int().positive().max(24),
    priceFrom: z.number().int().positive().max(100_000),
    description: z.string().trim().min(20).max(4000),
    contactName: z.string().trim().min(2).max(120),
    contactMethod: z.string().trim().min(3).max(220),
    instagram: z.string().trim().max(120).optional(),
    whatsapp: z.string().trim().max(120).optional(),
    submittedLocale: z.enum(['en', 'es']),
    media: z.array(tourSubmissionMediaSchema).max(MAX_SUBMISSION_IMAGES),
  })
  .transform((value) => ({
    ...value,
    instagram: value.instagram || undefined,
    whatsapp: value.whatsapp || undefined,
  })) satisfies z.ZodType<CreateTourSubmissionInput>

export const prepareSubmissionUploadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  mimeType: z.enum(SUBMISSION_IMAGE_MIME_TYPES),
  fileSize: z.number().int().positive().max(MAX_SUBMISSION_IMAGE_SIZE_BYTES),
})

export {
  MAX_SUBMISSION_IMAGES,
  MAX_SUBMISSION_IMAGE_SIZE_BYTES,
  SUBMISSION_IMAGE_MIME_TYPES,
} from './eventSubmissions'
