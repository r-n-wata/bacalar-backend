import { eventsContentByLanguage } from './seedContent'

export const demoEventSlugs = Array.from(
  new Set(eventsContentByLanguage.en.items.map((item) => item.id)),
)
