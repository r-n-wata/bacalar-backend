import { PrismaClient, ContentStatus, EventCategory, FeatureType, HomeSectionKind, LocaleCode, SpotlightKey } from '@prisma/client'
import {
  eventsContentByLanguage,
  homeContentByLanguage,
  restaurantsContentByLanguage,
  toursContentByLanguage,
} from '../src/data/seedContent'

const prisma = new PrismaClient()

async function main() {
  await prisma.homeSpotlightMetric.deleteMany()
  await prisma.homeSpotlightEntryTranslation.deleteMany()
  await prisma.homeSpotlightEntry.deleteMany()
  await prisma.homeSectionCardTranslation.deleteMany()
  await prisma.homeSectionCard.deleteMany()
  await prisma.homeSectionTranslation.deleteMany()
  await prisma.homeSection.deleteMany()
  await prisma.homeCtaTranslation.deleteMany()
  await prisma.homeCta.deleteMany()
  await prisma.homePageTranslation.deleteMany()
  await prisma.homePage.deleteMany()
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
      },
    })

    const enTranslation = eventsContentByLanguage.en.items[index]
    const esTranslation = eventsContentByLanguage.es.items[index]

    await prisma.eventTranslation.createMany({
      data: [
        {
          eventId: event.id,
          localeId: en.id,
          title: enTranslation.title,
          dateLabel: enTranslation.dateLabel,
          venue: enTranslation.venue,
        },
        {
          eventId: event.id,
          localeId: es.id,
          title: esTranslation.title,
          dateLabel: esTranslation.dateLabel,
          venue: esTranslation.venue,
        },
      ],
    })
  }

  for (const [index, item] of restaurantsContentByLanguage.en.items.entries()) {
    const restaurant = await prisma.restaurant.create({
      data: {
        slug: item.id,
        status: ContentStatus.PUBLISHED,
        priceBand: item.priceBand,
        sortOrder: index,
      },
    })

    const enTranslation = restaurantsContentByLanguage.en.items[index]
    const esTranslation = restaurantsContentByLanguage.es.items[index]

    await prisma.restaurantTranslation.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          localeId: en.id,
          name: enTranslation.name,
          cuisine: enTranslation.cuisine,
          vibe: enTranslation.vibe,
        },
        {
          restaurantId: restaurant.id,
          localeId: es.id,
          name: esTranslation.name,
          cuisine: esTranslation.cuisine,
          vibe: esTranslation.vibe,
        },
      ],
    })
  }

  for (const [index, item] of toursContentByLanguage.en.items.entries()) {
    const tour = await prisma.tour.create({
      data: {
        slug: item.id,
        status: ContentStatus.PUBLISHED,
        durationHours: item.durationHours,
        priceFrom: item.priceFrom,
        sortOrder: index,
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
          category: enTranslation.category,
        },
        {
          tourId: tour.id,
          localeId: es.id,
          name: esTranslation.name,
          category: esTranslation.category,
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
        calloutEyebrow: homeContentByLanguage.en.planningCallout.eyebrow,
        calloutTitle: homeContentByLanguage.en.planningCallout.title,
        calloutDescription: homeContentByLanguage.en.planningCallout.description,
      },
      {
        homePageId: homePage.id,
        localeId: es.id,
        heroEyebrow: homeContentByLanguage.es.hero.eyebrow,
        heroTitle: homeContentByLanguage.es.hero.title,
        heroDescription: homeContentByLanguage.es.hero.description,
        calloutEyebrow: homeContentByLanguage.es.planningCallout.eyebrow,
        calloutTitle: homeContentByLanguage.es.planningCallout.title,
        calloutDescription: homeContentByLanguage.es.planningCallout.description,
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

  const sectionMappings = [
    ['featuredExperiences', HomeSectionKind.FEATURED_EXPERIENCES],
    ['diningMoments', HomeSectionKind.DINING_MOMENTS],
    ['weeklyHappenings', HomeSectionKind.WEEKLY_HAPPENINGS],
  ] as const

  for (const [sectionKey, kind] of sectionMappings) {
    const section = await prisma.homeSection.create({
      data: {
        homePageId: homePage.id,
        kind,
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

    for (const [index, card] of homeContentByLanguage.en[sectionKey].items.entries()) {
      const sectionCard = await prisma.homeSectionCard.create({
        data: {
          sectionId: section.id,
          route: card.route,
          sortOrder: index,
        },
      })

      const enCard = homeContentByLanguage.en[sectionKey].items[index]
      const esCard = homeContentByLanguage.es[sectionKey].items[index]

      await prisma.homeSectionCardTranslation.createMany({
        data: [
          {
            cardId: sectionCard.id,
            localeId: en.id,
            label: enCard.label ?? null,
            title: enCard.title,
            description: enCard.description,
            meta: enCard.meta,
          },
          {
            cardId: sectionCard.id,
            localeId: es.id,
            label: esCard.label ?? null,
            title: esCard.title,
            description: esCard.description,
            meta: esCard.meta,
          },
        ],
      })
    }
  }

  const homeCta = await prisma.homeCta.create({
    data: {
      homePageId: homePage.id,
      primaryRoute: homeContentByLanguage.en.bookingCta.primaryAction.route,
      secondaryRoute: homeContentByLanguage.en.bookingCta.secondaryAction.route,
    },
  })

  await prisma.homeCtaTranslation.createMany({
    data: [
      {
        ctaId: homeCta.id,
        localeId: en.id,
        eyebrow: homeContentByLanguage.en.bookingCta.eyebrow,
        title: homeContentByLanguage.en.bookingCta.title,
        description: homeContentByLanguage.en.bookingCta.description,
        primaryLabel: homeContentByLanguage.en.bookingCta.primaryAction.label,
        secondaryLabel: homeContentByLanguage.en.bookingCta.secondaryAction.label,
      },
      {
        ctaId: homeCta.id,
        localeId: es.id,
        eyebrow: homeContentByLanguage.es.bookingCta.eyebrow,
        title: homeContentByLanguage.es.bookingCta.title,
        description: homeContentByLanguage.es.bookingCta.description,
        primaryLabel: homeContentByLanguage.es.bookingCta.primaryAction.label,
        secondaryLabel: homeContentByLanguage.es.bookingCta.secondaryAction.label,
      },
    ],
  })
}

void main()
  .catch(async (error) => {
    console.error(error)
    process.exitCode = 1
    await prisma.$disconnect()
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
