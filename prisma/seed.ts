import {
  ContentStatus,
  EventCategory,
  FeatureType,
  HomeSectionKind,
  LocaleCode,
  PrismaClient,
  SpotlightKey,
} from '@prisma/client'
import {
  eventDetailsByLanguage,
  eventsContentByLanguage,
  featuredEventOrderById,
  homeContentByLanguage,
  restaurantsContentByLanguage,
  toursContentByLanguage,
} from '../src/data/seedContent'
import { loadRestaurantSeedWorkbook } from '../src/data/restaurantSeedWorkbook'

const prisma = new PrismaClient()

async function main() {
  const restaurantSeeds = loadRestaurantSeedWorkbook()

  await prisma.homeSpotlightMetric.deleteMany()
  await prisma.homeSpotlightEntryTranslation.deleteMany()
  await prisma.homeSpotlightEntry.deleteMany()
  await prisma.homeSectionCardTranslation.deleteMany()
  await prisma.homeSectionCard.deleteMany()
  await prisma.homeSectionTranslation.deleteMany()
  await prisma.homeSection.deleteMany()
  await prisma.homePageTranslation.deleteMany()
  await prisma.homePage.deleteMany()
  await prisma.eventSubmissionImage.deleteMany()
  await prisma.eventSubmission.deleteMany()
  await prisma.eventTranslation.deleteMany()
  await prisma.event.deleteMany()
  await prisma.restaurantTranslation.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.tourTranslation.deleteMany()
  await prisma.tour.deleteMany()
  await prisma.featurePageTranslation.deleteMany()
  await prisma.featurePage.deleteMany()
  await prisma.locale.deleteMany()

  const en = await prisma.locale.create({
    data: {
      code: LocaleCode.en,
      name: 'English',
    },
  })
  const es = await prisma.locale.create({
    data: {
      code: LocaleCode.es,
      name: 'Español',
    },
  })

  const featurePages = await Promise.all([
    prisma.featurePage.create({
      data: {
        feature: FeatureType.EVENTS,
        slug: 'events',
        status: ContentStatus.PUBLISHED,
      },
    }),
    prisma.featurePage.create({
      data: {
        feature: FeatureType.RESTAURANTS,
        slug: 'restaurants',
        status: ContentStatus.PUBLISHED,
      },
    }),
    prisma.featurePage.create({
      data: {
        feature: FeatureType.TOURS,
        slug: 'tours',
        status: ContentStatus.PUBLISHED,
      },
    }),
  ])

  const featureLocales = [
    [FeatureType.EVENTS, eventsContentByLanguage],
    [FeatureType.RESTAURANTS, restaurantsContentByLanguage],
    [FeatureType.TOURS, toursContentByLanguage],
  ] as const

  for (const [feature, contentByLanguage] of featureLocales) {
    const page = featurePages.find((item) => item.feature === feature)

    if (!page) {
      continue
    }

    await prisma.featurePageTranslation.createMany({
      data: [
        {
          featurePageId: page.id,
          localeId: en.id,
          eyebrow: contentByLanguage.en.eyebrow,
          title: contentByLanguage.en.title,
          description: contentByLanguage.en.description,
        },
        {
          featurePageId: page.id,
          localeId: es.id,
          eyebrow: contentByLanguage.es.eyebrow,
          title: contentByLanguage.es.title,
          description: contentByLanguage.es.description,
        },
      ],
    })
  }

  for (const [index, item] of eventsContentByLanguage.en.items.entries()) {
    const event = await prisma.event.create({
      data: {
        slug: item.id,
        status: ContentStatus.PUBLISHED,
        category: item.category as EventCategory,
        sortOrder: index,
        isFeatured: item.id in featuredEventOrderById,
        featuredOrder:
          item.id in featuredEventOrderById
            ? featuredEventOrderById[item.id as keyof typeof featuredEventOrderById]
            : null,
        startsAt: item.startsAt ? new Date(item.startsAt) : null,
        endsAt: item.endsAt ? new Date(item.endsAt) : null,
      },
    })

    const enTranslation = eventsContentByLanguage.en.items[index]
    const esTranslation = eventsContentByLanguage.es.items[index]
    const enDetail = eventDetailsByLanguage.en[item.id]
    const esDetail = eventDetailsByLanguage.es[item.id]

    await prisma.eventTranslation.createMany({
      data: [
        {
          eventId: event.id,
          localeId: en.id,
          title: enTranslation.title,
          dateLabel: enTranslation.dateLabel,
          venue: enTranslation.venue,
          description: enDetail?.description,
        },
        {
          eventId: event.id,
          localeId: es.id,
          title: esTranslation.title,
          dateLabel: esTranslation.dateLabel,
          venue: esTranslation.venue,
          description: esDetail?.description,
        },
      ],
    })
  }

  for (const [index, item] of restaurantSeeds.entries()) {
    const restaurant = await prisma.restaurant.create({
      data: {
        slug: item.slug,
        status: ContentStatus.PUBLISHED,
        priceBand: item.priceBand,
        moments: item.moments,
        sortOrder: index,
        isFeatured: item.isFeatured,
        featuredOrder: item.featuredOrder,
      },
    })

    await prisma.restaurantTranslation.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          localeId: en.id,
          name: item.en.name,
          cuisine: item.en.cuisine,
          vibe: item.en.vibe,
          description: item.en.description,
        },
      ],
    })
  }

  for (const [index, item] of toursContentByLanguage.en.items.entries()) {
    const tour = await prisma.tour.create({
      data: {
        slug: item.id,
        status: ContentStatus.PUBLISHED,
        category: item.category,
        durationHours: item.durationHours,
        priceFrom: item.priceFrom,
        sortOrder: index,
        isFeatured: index < 3,
        featuredOrder: index < 3 ? index : null,
      },
    })

    const enTranslation = toursContentByLanguage.en.items[index]
    const esTranslation = toursContentByLanguage.es.items[index]

    await prisma.tourTranslation.createMany({
      data: [
        {
          tourId: tour.id,
          localeId: en.id,
          name: enTranslation.name,
          category: enTranslation.categoryLabel,
        },
        {
          tourId: tour.id,
          localeId: es.id,
          name: esTranslation.name,
          category: esTranslation.categoryLabel,
        },
      ],
    })
  }

  const homePage = await prisma.homePage.create({
    data: {
      slug: 'home',
      status: ContentStatus.PUBLISHED,
    },
  })

  await prisma.homePageTranslation.createMany({
    data: [
      {
        homePageId: homePage.id,
        localeId: en.id,
        heroEyebrow: homeContentByLanguage.en.hero.eyebrow,
        heroTitle: homeContentByLanguage.en.hero.title,
        heroDescription: homeContentByLanguage.en.hero.description,
        calloutEyebrow: '',
        calloutTitle: '',
        calloutDescription: '',
        calloutItems: [],
      },
      {
        homePageId: homePage.id,
        localeId: es.id,
        heroEyebrow: homeContentByLanguage.es.hero.eyebrow,
        heroTitle: homeContentByLanguage.es.hero.title,
        heroDescription: homeContentByLanguage.es.hero.description,
        calloutEyebrow: '',
        calloutTitle: '',
        calloutDescription: '',
        calloutItems: [],
      },
    ],
  })

  for (const [index, action] of homeContentByLanguage.en.spotlight.actions.entries()) {
    const entry = await prisma.homeSpotlightEntry.create({
      data: {
        homePageId: homePage.id,
        key: action.key.toUpperCase() as SpotlightKey,
        route: homeContentByLanguage.en.spotlight.entries[action.key].route,
        sortOrder: index,
      },
    })

    const enEntry = homeContentByLanguage.en.spotlight.entries[action.key]
    const esEntry = homeContentByLanguage.es.spotlight.entries[action.key]

    const enTranslation = await prisma.homeSpotlightEntryTranslation.create({
      data: {
        entryId: entry.id,
        localeId: en.id,
        actionLabel: homeContentByLanguage.en.spotlight.actions[index].label,
        title: enEntry.title,
        description: enEntry.description,
        ctaLabel: enEntry.cta,
      },
    })

    const esTranslation = await prisma.homeSpotlightEntryTranslation.create({
      data: {
        entryId: entry.id,
        localeId: es.id,
        actionLabel: homeContentByLanguage.es.spotlight.actions[index].label,
        title: esEntry.title,
        description: esEntry.description,
        ctaLabel: esEntry.cta,
      },
    })

    await prisma.homeSpotlightMetric.createMany({
      data: [
        ...enEntry.metrics.map((metric, metricIndex) => ({
          translationId: enTranslation.id,
          sortOrder: metricIndex,
          label: metric.label,
          value: metric.value,
        })),
        ...esEntry.metrics.map((metric, metricIndex) => ({
          translationId: esTranslation.id,
          sortOrder: metricIndex,
          label: metric.label,
          value: metric.value,
        })),
      ],
    })
  }

  const homeSections = [
    ['featuredExperiences', HomeSectionKind.FEATURED_EXPERIENCES],
    ['diningMoments', HomeSectionKind.DINING_MOMENTS],
    ['weeklyHappenings', HomeSectionKind.WEEKLY_HAPPENINGS],
  ] as const

  for (const [sectionKey, sectionKind] of homeSections) {
    const section = await prisma.homeSection.create({
      data: {
        homePageId: homePage.id,
        kind: sectionKind,
      },
    })

    await prisma.homeSectionTranslation.createMany({
      data: [
        {
          sectionId: section.id,
          localeId: en.id,
          eyebrow: homeContentByLanguage.en[sectionKey].intro.eyebrow,
          title: homeContentByLanguage.en[sectionKey].intro.title,
          description: homeContentByLanguage.en[sectionKey].intro.description,
        },
        {
          sectionId: section.id,
          localeId: es.id,
          eyebrow: homeContentByLanguage.es[sectionKey].intro.eyebrow,
          title: homeContentByLanguage.es[sectionKey].intro.title,
          description: homeContentByLanguage.es[sectionKey].intro.description,
        },
      ],
    })

    for (const [index, enCard] of homeContentByLanguage.en[sectionKey].items.entries()) {
      const esCard = homeContentByLanguage.es[sectionKey].items[index]
      const card = await prisma.homeSectionCard.create({
        data: {
          sectionId: section.id,
          route: enCard.route,
          sortOrder: index,
        },
      })

      await prisma.homeSectionCardTranslation.createMany({
        data: [
          {
            cardId: card.id,
            localeId: en.id,
            label: enCard.label,
            title: enCard.title,
            description: enCard.description,
            meta: enCard.meta,
          },
          {
            cardId: card.id,
            localeId: es.id,
            label: esCard.label,
            title: esCard.title,
            description: esCard.description,
            meta: esCard.meta,
          },
        ],
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('seed-failed', error)
    await prisma.$disconnect()
    process.exit(1)
  })
