import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const DEFAULT_WORKBOOK_PATH = resolve(
  process.cwd(),
  'prisma/seed-data/Sueno_Bacalar_Tours_Seed_Data.xlsx',
)

const WORKBOOK_SCRIPT_PATH = resolve(
  process.cwd(),
  'scripts/read_tour_seed_xlsx.py',
)

type WorkbookRow = Record<string, string | number | null>

export type TourSeedTranslation = {
  name: string
  description: string
  included?: string
  whatToBring?: string
  operatorDescription?: string
}

export type TourSeedRecord = {
  slug: string
  category: string
  duration: string
  priceFrom: string
  privateOrShared: string
  bestFor: string
  difficulty: string
  suitableForKids: string
  operatorName: string
  operatorWhatsapp?: string
  operatorInstagram?: string
  operatorWebsite?: string
  operatorPrimaryContactMethod?: string
  meetingPoint?: string
  imageUrls: string[]
  isFeatured: boolean
  featuredOrder: number | null
  en: TourSeedTranslation
  es: TourSeedTranslation
}

export const requiredTourSeedHeaders = [
  'tourName',
  'category',
  'duration',
  'priceFrom',
  'privateOrShared',
  'bestFor',
  'difficulty',
  'suitableForKids',
  'description',
  'operatorName',
] as const

const optionalTourSeedHeaders = [
  'operatorDescription',
  'operatorWhatsapp',
  'operatorInstagram',
  'operatorWebsite',
  'operatorPrimaryContactMethod',
  'meetingPoint',
  'included',
  'whatToBring',
  'imageUrls',
  'featured',
  'featuredOrder',
] as const

const canonicalHeaderAliases = {
  tourName: ['tourName', 'Tour name', 'Experience name'],
  category: ['category', 'Category'],
  duration: ['duration', 'Duration'],
  priceFrom: ['priceFrom', 'Price From'],
  privateOrShared: ['privateOrShared', 'Private/Shared'],
  bestFor: ['bestFor', 'Best for'],
  difficulty: ['difficulty', 'Difficulty'],
  suitableForKids: ['suitableForKids', 'Suitable for Kids'],
  description: ['description', 'Description'],
  operatorName: ['operatorName', 'Operator name', 'Operator (example)'],
  operatorDescription: ['operatorDescription', 'Operator description'],
  operatorWhatsapp: ['operatorWhatsapp', 'WhatsApp'],
  operatorInstagram: ['operatorInstagram', 'Instagram'],
  operatorWebsite: ['operatorWebsite', 'Website'],
  operatorPrimaryContactMethod: [
    'operatorPrimaryContactMethod',
    'Primary contact method',
  ],
  meetingPoint: ['meetingPoint', 'Meeting point'],
  included: ['included', 'Included', 'What is included'],
  whatToBring: ['whatToBring', 'What to bring'],
  imageUrls: ['imageUrls', 'Image URLs', 'Image URL', 'Images'],
  featured: ['featured', 'Featured'],
  featuredOrder: ['featuredOrder', 'Featured order'],
} satisfies Record<string, string[]>

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

function getHeaderAlias(header: string) {
  return Object.entries(canonicalHeaderAliases).find(([, aliases]) =>
    aliases.includes(header),
  )?.[0]
}

function assertExpectedHeaders(headers: string[]) {
  const headerSet = new Set(headers)
  const missingHeaders = requiredTourSeedHeaders.filter((header) =>
    canonicalHeaderAliases[header].every((alias) => !headerSet.has(alias)),
  )

  if (missingHeaders.length > 0) {
    throw new Error(
      `Tour seed workbook is missing required columns: ${missingHeaders.join(', ')}.`,
    )
  }

  const unsupportedHeaders = headers.filter((header) => !getHeaderAlias(header))
  if (unsupportedHeaders.length > 0) {
    throw new Error(
      `Tour seed workbook contains unsupported columns: ${unsupportedHeaders.join(', ')}.`,
    )
  }
}

function getRowValue(row: WorkbookRow, header: keyof typeof canonicalHeaderAliases) {
  const aliases = canonicalHeaderAliases[header]

  for (const alias of aliases) {
    if (alias in row) {
      return toTrimmedString(row[alias])
    }
  }

  return ''
}

function buildUniqueSlug(name: string, seenCounts: Map<string, number>) {
  const baseSlug = slugify(name)

  if (!baseSlug) {
    throw new Error(`Unable to generate a slug for tour "${name}".`)
  }

  const count = seenCounts.get(baseSlug) ?? 0
  seenCounts.set(baseSlug, count + 1)

  return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`
}

function parseImageUrls(value: string) {
  if (!value) {
    return []
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseFeaturedValue(value: string, rowNumber: number) {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()

  if (['true', 'yes', 'y', '1'].includes(normalized)) {
    return true
  }

  if (['false', 'no', 'n', '0'].includes(normalized)) {
    return false
  }

  throw new Error(
    `Invalid featured value "${value}" on row ${rowNumber}. Use yes/no or true/false.`,
  )
}

function parseFeaturedOrder(value: string, rowNumber: number) {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid featuredOrder "${value}" on row ${rowNumber}. Use a positive number.`,
    )
  }

  return parsed - 1
}

export function normalizeTourSeedRows(rows: WorkbookRow[]) {
  if (rows.length === 0) {
    return [] satisfies TourSeedRecord[]
  }

  const headers = Object.keys(rows[0] ?? {})
  assertExpectedHeaders(headers)
  const hasFeaturedHeader = canonicalHeaderAliases.featured.some((header) =>
    headers.includes(header),
  )
  const hasFeaturedOrderHeader = canonicalHeaderAliases.featuredOrder.some(
    (header) => headers.includes(header),
  )
  const seenSlugs = new Map<string, number>()

  return rows.flatMap((row, index) => {
    const rowNumber = index + 2
    const name = getRowValue(row, 'tourName')
    const category = getRowValue(row, 'category')
    const duration = getRowValue(row, 'duration')
    const priceFrom = getRowValue(row, 'priceFrom')
    const privateOrShared = getRowValue(row, 'privateOrShared')
    const bestFor = getRowValue(row, 'bestFor')
    const difficulty = getRowValue(row, 'difficulty')
    const suitableForKids = getRowValue(row, 'suitableForKids')
    const description = getRowValue(row, 'description')
    const operatorName = getRowValue(row, 'operatorName')
    const operatorDescription =
      getRowValue(row, 'operatorDescription') || undefined
    const operatorWhatsapp = getRowValue(row, 'operatorWhatsapp') || undefined
    const operatorInstagram = getRowValue(row, 'operatorInstagram') || undefined
    const operatorWebsite = getRowValue(row, 'operatorWebsite') || undefined
    const operatorPrimaryContactMethod =
      getRowValue(row, 'operatorPrimaryContactMethod') || undefined
    const meetingPoint = getRowValue(row, 'meetingPoint') || undefined
    const included = getRowValue(row, 'included') || undefined
    const whatToBring = getRowValue(row, 'whatToBring') || undefined
    const imageUrls = parseImageUrls(getRowValue(row, 'imageUrls'))
    const featuredValue = getRowValue(row, 'featured')
    const featuredOrderValue = getRowValue(row, 'featuredOrder')

    const hasVisibleData = [
      name,
      category,
      duration,
      priceFrom,
      privateOrShared,
      bestFor,
      difficulty,
      suitableForKids,
      description,
      operatorName,
      operatorDescription,
      operatorWhatsapp,
      operatorInstagram,
      operatorWebsite,
      operatorPrimaryContactMethod,
      meetingPoint,
      included,
      whatToBring,
      imageUrls.join(''),
      featuredValue,
      featuredOrderValue,
    ].some(Boolean)

    if (!hasVisibleData) {
      return []
    }

    for (const [label, value] of [
      ['tourName', name],
      ['category', category],
      ['duration', duration],
      ['priceFrom', priceFrom],
      ['privateOrShared', privateOrShared],
      ['bestFor', bestFor],
      ['difficulty', difficulty],
      ['suitableForKids', suitableForKids],
      ['description', description],
      ['operatorName', operatorName],
    ] as const) {
      if (!value) {
        throw new Error(`Missing ${label} on row ${rowNumber}.`)
      }
    }

    const isFeatured = hasFeaturedHeader
      ? parseFeaturedValue(featuredValue, rowNumber)
      : !hasFeaturedOrderHeader && index < 3
    const featuredOrder =
      parseFeaturedOrder(featuredOrderValue, rowNumber) ??
      (isFeatured ? index : null)

    return [
      {
        slug: buildUniqueSlug(name, seenSlugs),
        category,
        duration,
        priceFrom,
        privateOrShared,
        bestFor,
        difficulty,
        suitableForKids,
        operatorName,
        operatorWhatsapp,
        operatorInstagram,
        operatorWebsite,
        operatorPrimaryContactMethod,
        meetingPoint,
        imageUrls,
        isFeatured,
        featuredOrder,
        en: {
          name,
          description,
          included,
          whatToBring,
          operatorDescription,
        },
        es: {
          name,
          description,
          included,
          whatToBring,
          operatorDescription,
        },
      },
    ] satisfies TourSeedRecord[]
  })
}

export function readTourSeedWorkbook(
  workbookPath = DEFAULT_WORKBOOK_PATH,
): WorkbookRow[] {
  const stdout = execFileSync('python3', [WORKBOOK_SCRIPT_PATH, workbookPath], {
    encoding: 'utf8',
  })

  return JSON.parse(stdout) as WorkbookRow[]
}

export function loadTourSeedWorkbook(workbookPath = DEFAULT_WORKBOOK_PATH) {
  return normalizeTourSeedRows(readTourSeedWorkbook(workbookPath))
}
