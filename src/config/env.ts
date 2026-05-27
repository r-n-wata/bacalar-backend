import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  DEFAULT_LOCALE: z.enum(['en', 'es']).default('en'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  NETLIFY_SITE_NAME: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
  ADMIN_NOTIFICATION_EMAIL: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  NOTIFICATION_FROM_EMAIL: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  SMTP_HOST: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  SMTP_PASSWORD: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  SUPABASE_URL: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  SUPABASE_STORAGE_BUCKET: z.string().trim().optional().transform((value) =>
    value && value.length > 0 ? value : undefined,
  ),
  EXTERNAL_IMAGE_VALIDATION_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
})

export type AppEnv = z.infer<typeof envSchema>

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source)
}
