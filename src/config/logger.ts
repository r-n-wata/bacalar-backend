export type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
}

export function createLogger(): Logger {
  return {
    info(message, meta) {
      console.info(message, meta ?? {})
    },
    error(message, meta) {
      console.error(message, meta ?? {})
    },
  }
}
