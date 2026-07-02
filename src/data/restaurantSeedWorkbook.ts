import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import type { RestaurantMoment } from '../types/content'

const DEFAULT_WORKBOOK_PATH = resolve(
  process.cwd(),
  'prisma/seed-data/Sueno_Bacalar_Restaurant_Seed_Data.xlsx',
)

const WORKBOOK_SCRIPT_PATH = resolve(
  process.cwd(),
  'scripts/read_restaurant_seed_xlsx.py',
)

type WorkbookRow = Record<string, string | number | null>

export type RestaurantSeedTranslation = {
  name: string
  cuisine: string
  vibe: string
  description: string
}

export type RestaurantSeedRecord = {
  slug: string
  priceBand: '$' | '$$' | '$$$'
  moments: RestaurantMoment[]
  isFeatured: boolean
  featuredOrder: number | null
  en: RestaurantSeedTranslation
}

export const requiredRestaurantSeedHeaders = [
  'Restaurant name',
  'Cuisine',
  'Dining moment',
  'Price band',
  'Description',
  'Vibe',
  'Featured order',
] as const

const contactOnlyHeaders = [
  'Contact name',
  'Primary contact method',
  'Instagram',
  'WhatsApp',
] as const

const allExpectedHeaders = [
  ...requiredRestaurantSeedHeaders,
  ...contactOnlyHeaders,
] as const

function toTrimmedString(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function parsePriceBand(value: string, rowNumber: number): '$' | '$$' | '$$$' {
  if (value === '$' || value === '$$' || value === '$$$') {
    return value
  }

  throw new Error(
    `Invalid price band "${value}" on row ${rowNumber}. Expected $, $$, or $$$.`,
  )
}

function parseDiningMoments(
  value: string,
  rowNumber: number,
): RestaurantMoment[] {
  const normalized = value
    .toLowerCase()
    .replace(/\band\b/g, '&')
    .split(/[,&/]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const mapped = normalized.map((token) => {
    switch (token) {
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        return token
      default:
        throw new Error(
          `Invalid dining moment "${value}" on row ${rowNumber}.`,
        )
    }
  }) as RestaurantMoment[]

  return [...new Set(mapped)]
}

function parseFeaturedOrder(
  value: string,
  rowNumber: number,
): number | null {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid featured order "${value}" on row ${rowNumber}. Expected a positive integer.`,
    )
  }

  return parsed - 1
}

function assertExpectedHeaders(headers: string[]) {
  const missingHeaders = requiredRestaurantSeedHeaders.filter(
    (header) => !headers.includes(header),
  )

  if (missingHeaders.length > 0) {
    throw new Error(
      `Restaurant seed workbook is missing required columns: ${missingHeaders.join(', ')}.`,
    )
  }

  const unexpectedHeaders = headers.filter(
    (header) => !allExpectedHeaders.includes(header as (typeof allExpectedHeaders)[number]),
  )

  if (unexpectedHeaders.length > 0) {
    throw new Error(
      `Restaurant seed workbook contains unsupported columns: ${unexpectedHeaders.join(', ')}.`,
    )
  }
}

function buildUniqueSlug(name: string, seenCounts: Map<string, number>) {
  const baseSlug = slugify(name)

  if (!baseSlug) {
    throw new Error(`Unable to generate a slug for restaurant "${name}".`)
  }

  const count = seenCounts.get(baseSlug) ?? 0
  seenCounts.set(baseSlug, count + 1)

  return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`
}

export function normalizeRestaurantSeedRows(rows: WorkbookRow[]) {
  if (rows.length === 0) {
    return [] satisfies RestaurantSeedRecord[]
  }

  const headers = Object.keys(rows[0] ?? {})
  assertExpectedHeaders(headers)

  const seenSlugs = new Map<string, number>()

  return rows.flatMap((row, index) => {
    const rowNumber = index + 2
    const name = toTrimmedString(row['Restaurant name'])
    const cuisine = toTrimmedString(row['Cuisine'])
    const diningMoment = toTrimmedString(row['Dining moment'])
    const priceBand = toTrimmedString(row['Price band'])
    const description = toTrimmedString(row['Description'])
    const vibe = toTrimmedString(row['Vibe'])
    const featuredOrderValue = toTrimmedString(row['Featured order'])

    const hasVisibleData = [
      name,
      cuisine,
      diningMoment,
      priceBand,
      description,
      vibe,
      featuredOrderValue,
      ...contactOnlyHeaders.map((header) => toTrimmedString(row[header])),
    ].some(Boolean)

    if (!hasVisibleData) {
      return []
    }

    for (const [label, value] of [
      ['Restaurant name', name],
      ['Cuisine', cuisine],
      ['Dining moment', diningMoment],
      ['Price band', priceBand],
      ['Description', description],
      ['Vibe', vibe],
    ] as const) {
      if (!value) {
        throw new Error(`Missing ${label} on row ${rowNumber}.`)
      }
    }

    const populatedContactHeaders = contactOnlyHeaders.filter((header) =>
      Boolean(toTrimmedString(row[header])),
    )

    if (populatedContactHeaders.length > 0) {
      throw new Error(
        `Published restaurant seed row ${rowNumber} contains submission-only data in: ${populatedContactHeaders.join(', ')}.`,
      )
    }

    const featuredOrder = parseFeaturedOrder(featuredOrderValue, rowNumber)

    return [
      {
        slug: buildUniqueSlug(name, seenSlugs),
        priceBand: parsePriceBand(priceBand, rowNumber),
        moments: parseDiningMoments(diningMoment, rowNumber),
        isFeatured: featuredOrder !== null,
        featuredOrder,
        en: {
          name,
          cuisine,
          vibe,
          description,
        },
      },
    ] satisfies RestaurantSeedRecord[]
  })
}

export function readRestaurantSeedWorkbook(
  workbookPath = DEFAULT_WORKBOOK_PATH,
): WorkbookRow[] {
  const stdout = execFileSync('python3', [WORKBOOK_SCRIPT_PATH, workbookPath], {
    encoding: 'utf8',
  })

  return JSON.parse(stdout) as WorkbookRow[]
}

export function loadRestaurantSeedWorkbook(
  workbookPath = DEFAULT_WORKBOOK_PATH,
) {
  return normalizeRestaurantSeedRows(readRestaurantSeedWorkbook(workbookPath))
}
