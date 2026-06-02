import { randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Logger } from '../config/logger'
import type {
  PrepareSubmissionUploadInput,
  PrepareSubmissionUploadResult,
} from '../types/eventSubmissions'
import { HttpError } from '../utils/httpError'

export type SubmissionMediaService = {
  prepareImageUpload(
    input: PrepareSubmissionUploadInput,
  ): Promise<PrepareSubmissionUploadResult>
}

type SupabaseMediaServiceConfig = {
  supabaseUrl?: string
  serviceRoleKey?: string
  bucketName?: string
  folderPrefix?: string
}

const DEFAULT_EVENT_SUBMISSIONS_FOLDER = 'event-submissions'

function sanitizeFilename(filename: string) {
  const [name = 'image'] = filename.split(/[/\\]/).slice(-1)

  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')
}

function normalizeFolderPrefix(folderPrefix?: string) {
  const trimmed = folderPrefix?.trim().replace(/^\/+|\/+$/g, '')

  return trimmed && trimmed.length > 0
    ? trimmed
    : DEFAULT_EVENT_SUBMISSIONS_FOLDER
}

export function createMediaObjectKey(
  folderPrefix: string | undefined,
  filename: string,
) {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const normalizedPrefix = normalizeFolderPrefix(folderPrefix)

  return `${normalizedPrefix}/${year}/${month}/${randomUUID()}-${sanitizeFilename(filename)}`
}

function createUnavailableMediaService(
  logger: Logger,
  config: SupabaseMediaServiceConfig,
): SubmissionMediaService {
  return {
    async prepareImageUpload() {
      logger.error('submission-media-config-missing', {
        supabaseUrlConfigured: Boolean(config.supabaseUrl),
        serviceRoleConfigured: Boolean(config.serviceRoleKey),
        bucketConfigured: Boolean(config.bucketName),
      })

      throw new HttpError(
        503,
        'Image uploads are not configured right now.',
        'UPLOADS_UNAVAILABLE',
      )
    },
  }
}

function createSupabaseClientForMedia(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function createSupabaseSubmissionMediaService(
  logger: Logger,
  config: SupabaseMediaServiceConfig,
): SubmissionMediaService {
  const { supabaseUrl, serviceRoleKey, bucketName, folderPrefix } = config

  if (!supabaseUrl || !serviceRoleKey || !bucketName) {
    return createUnavailableMediaService(logger, config)
  }

  const supabase = createSupabaseClientForMedia(supabaseUrl, serviceRoleKey)

  return {
    async prepareImageUpload(input) {
      const objectKey = createMediaObjectKey(folderPrefix, input.filename)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUploadUrl(objectKey)

      if (error || !data) {
        logger.error('submission-media-signing-failed', {
          error,
          bucketName,
          objectKey,
        })

        throw new HttpError(
          503,
          'Image uploads are not available right now.',
          'UPLOADS_UNAVAILABLE',
        )
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(objectKey)

      return {
        provider: 'supabase',
        bucketName,
        objectKey,
        assetUrl: publicUrlData.publicUrl,
        signedUploadUrl: data.signedUrl,
        uploadToken: data.token,
      }
    },
  }
}
