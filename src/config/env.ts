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
})

export type AppEnv = z.infer<typeof envSchema>

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source)
}
