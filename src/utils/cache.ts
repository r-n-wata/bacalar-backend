type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export type CacheProvider = {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs: number): void
  clear(): void
}

export class InMemoryCache implements CacheProvider {
  #entries = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.#entries.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.#entries.delete(key)
      return null
    }

    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.#entries.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  clear() {
    this.#entries.clear()
  }
}
