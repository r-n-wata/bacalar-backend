import type {
  AppLanguage,
  EventDetail,
  EventsContent,
  HomeContent,
  HomeImage,
  RestaurantDetail,
  RestaurantsContent,
  TourDetail,
  ToursContent,
} from '../types/content'

const images = {
  hero: {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Turquoise water and white shoreline in Bacalar',
  },
  tourSailing: {
    src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    alt: 'Sailboat gliding over bright lagoon water',
  },
  tourPontoon: {
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    alt: 'Group enjoying a calm lagoon boat ride',
  },
  tourKayak: {
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Kayaks moving through calm water at golden hour',
  },
  restaurantCielo: {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Sunlit breakfast table with tropical greenery',
  },
  restaurantIxchel: {
    src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Relaxed restaurant terrace prepared for lunch',
  },
  restaurantNao: {
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    alt: 'Warm evening restaurant setting near the water',
  },
  eventJazz: {
    src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Live music performance during sunset',
  },
  eventMarket: {
    src: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Colorful local market with food stalls',
  },
  eventBreathwork: {
    src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    alt: 'Wellness practice beside calm water at sunrise',
  },
} satisfies Record<string, HomeImage>

export const toursContentByLanguage: Record<AppLanguage, ToursContent> = {
  en: {
    eyebrow: 'Bacalar tours',
    title: 'Choose a lagoon experience that fits the day',
    description:
      'Compare a few focused options first, then move into a fuller browse once the right pace becomes clear.',
    items: [
      {
        id: 'tour-sailing',
        name: 'Private Sailing at Sunrise',
        category: 'Premium',
        durationHours: 4,
        priceFrom: 2100,
        route: '/tours/tour-sailing',
      },
      {
        id: 'tour-pontoon',
        name: 'Family Pontoon Loop',
        category: 'Group',
        durationHours: 3,
        priceFrom: 1450,
        route: '/tours/tour-pontoon',
      },
      {
        id: 'tour-kayak',
        name: 'Guided Mangrove Kayak',
        category: 'Adventure',
        durationHours: 2,
        priceFrom: 680,
        route: '/tours/tour-kayak',
      },
    ],
  },
  es: {
    eyebrow: 'Tours en Bacalar',
    title: 'Elige una experiencia en la laguna que encaje con el dia',
    description:
      'Compara primero unas pocas opciones claras y luego entra a una exploracion mas amplia cuando el ritmo del dia ya este definido.',
    items: [
      {
        id: 'tour-sailing',
        name: 'Vela privada al amanecer',
        category: 'Premium',
        durationHours: 4,
        priceFrom: 2100,
        route: '/tours/tour-sailing',
      },
      {
        id: 'tour-pontoon',
        name: 'Recorrido familiar en ponton',
        category: 'Grupo',
        durationHours: 3,
        priceFrom: 1450,
        route: '/tours/tour-pontoon',
      },
      {
        id: 'tour-kayak',
        name: 'Kayak guiado por manglares',
        category: 'Aventura',
        durationHours: 2,
        priceFrom: 680,
        route: '/tours/tour-kayak',
      },
    ],
  },
}

export const restaurantsContentByLanguage: Record<
  AppLanguage,
  RestaurantsContent
> = {
  en: {
    eyebrow: 'Restaurants',
    title: 'Pick the right stop for the moment',
    description:
      'Keep dining simple: one strong breakfast, one easy lunch, and one dinner worth slowing down for.',
    items: [
      {
        id: 'rest-cielo',
        name: 'Cielo de Maiz',
        cuisine: 'Vegetarian',
        vibe: 'Garden breakfast',
        priceBand: '$$',
        route: '/restaurants/rest-cielo',
      },
      {
        id: 'rest-ixchel',
        name: 'Ixchel Cocina',
        cuisine: 'Regional Mexican',
        vibe: 'Casual local favorite',
        priceBand: '$$',
        route: '/restaurants/rest-ixchel',
      },
      {
        id: 'rest-naao',
        name: 'Nao',
        cuisine: 'Seafood',
        vibe: 'Lagoon-facing dinner',
        priceBand: '$$$',
        route: '/restaurants/rest-naao',
      },
    ],
  },
  es: {
    eyebrow: 'Restaurantes',
    title: 'Elige la parada correcta para cada momento',
    description:
      'Haz la comida facil: un gran desayuno, un almuerzo sin vueltas y una cena que valga bajar el ritmo.',
    items: [
      {
        id: 'rest-cielo',
        name: 'Cielo de Maiz',
        cuisine: 'Vegetariano',
        vibe: 'Desayuno en jardin',
        priceBand: '$$',
        route: '/restaurants/rest-cielo',
      },
      {
        id: 'rest-ixchel',
        name: 'Ixchel Cocina',
        cuisine: 'Mexicana regional',
        vibe: 'Favorito local casual',
        priceBand: '$$',
        route: '/restaurants/rest-ixchel',
      },
      {
        id: 'rest-naao',
        name: 'Nao',
        cuisine: 'Mariscos',
        vibe: 'Cena frente a la laguna',
        priceBand: '$$$',
        route: '/restaurants/rest-naao',
      },
    ],
  },
}

export const eventsContentByLanguage: Record<AppLanguage, EventsContent> = {
  en: {
    eyebrow: 'Events',
    title: 'See what feels current in Bacalar this week',
    description:
      'Use events as texture for the trip: a timely extra when the right night or morning opens up.',
    items: [
      {
        id: 'event-sunset-jazz',
        title: 'Sunset Jazz by the Lagoon',
        dateLabel: 'Friday, 7:00 PM',
        venue: 'Casa Laguna Deck',
        category: 'music',
        route: '/events/event-sunset-jazz',
      },
      {
        id: 'event-market-brunch',
        title: 'Local Market Brunch Crawl',
        dateLabel: 'Saturday, 10:30 AM',
        venue: 'Centro Bacalar',
        category: 'food',
        route: '/events/event-market-brunch',
      },
      {
        id: 'event-breathwork',
        title: 'Lagoon Breathwork Session',
        dateLabel: 'Sunday, 8:00 AM',
        venue: 'Isla Yoga Garden',
        category: 'wellness',
        route: '/events/event-breathwork',
      },
    ],
  },
  es: {
    eyebrow: 'Eventos',
    title: 'Mira que se siente vigente en Bacalar esta semana',
    description:
      'Usa los eventos como textura del viaje: un extra oportuno cuando aparece la noche o la manana correcta.',
    items: [
      {
        id: 'event-sunset-jazz',
        title: 'Jazz al atardecer junto a la laguna',
        dateLabel: 'Viernes, 7:00 PM',
        venue: 'Terraza Casa Laguna',
        category: 'music',
        route: '/events/event-sunset-jazz',
      },
      {
        id: 'event-market-brunch',
        title: 'Ruta de brunch por el mercado local',
        dateLabel: 'Sabado, 10:30 AM',
        venue: 'Centro de Bacalar',
        category: 'food',
        route: '/events/event-market-brunch',
      },
      {
        id: 'event-breathwork',
        title: 'Sesion de respiracion frente a la laguna',
        dateLabel: 'Domingo, 8:00 AM',
        venue: 'Jardin Isla Yoga',
        category: 'wellness',
        route: '/events/event-breathwork',
      },
    ],
  },
}

export const tourDetailsByLanguage: Record<
  AppLanguage,
  Record<string, TourDetail>
> = {
  en: {
    'tour-sailing': {
      id: 'tour-sailing',
      name: 'Private Sailing at Sunrise',
      category: 'Premium',
      durationHours: 4,
      priceFrom: 2100,
      description:
        'A quiet sunrise departure with a private crew, slow scenic movement, and the kind of calm water that makes Bacalar unforgettable on day one.',
      route: '/tours/tour-sailing',
      image: images.tourSailing,
    },
    'tour-pontoon': {
      id: 'tour-pontoon',
      name: 'Family Pontoon Loop',
      category: 'Group',
      durationHours: 3,
      priceFrom: 1450,
      description:
        'A relaxed midday circuit built for families and small groups that want easy swimming stops, lagoon views, and very little planning friction.',
      route: '/tours/tour-pontoon',
      image: images.tourPontoon,
    },
    'tour-kayak': {
      id: 'tour-kayak',
      name: 'Guided Mangrove Kayak',
      category: 'Adventure',
      durationHours: 2,
      priceFrom: 680,
      description:
        'A lighter, more active outing through calmer edges of the lagoon for travelers who want a nature-forward experience without committing a full day.',
      route: '/tours/tour-kayak',
      image: images.tourKayak,
    },
  },
  es: {
    'tour-sailing': {
      id: 'tour-sailing',
      name: 'Vela privada al amanecer',
      category: 'Premium',
      durationHours: 4,
      priceFrom: 2100,
      description:
        'Una salida tranquila al amanecer con tripulacion privada, movimiento lento y ese tipo de agua serena que vuelve inolvidable el primer dia en Bacalar.',
      route: '/tours/tour-sailing',
      image: {
        ...images.tourSailing,
        alt: 'Velero privado navegando por la laguna al amanecer',
      },
    },
    'tour-pontoon': {
      id: 'tour-pontoon',
      name: 'Recorrido familiar en ponton',
      category: 'Grupo',
      durationHours: 3,
      priceFrom: 1450,
      description:
        'Un circuito relajado al mediodia para familias y grupos pequenos que quieren parar a nadar, mirar la laguna y resolver el plan sin esfuerzo.',
      route: '/tours/tour-pontoon',
      image: {
        ...images.tourPontoon,
        alt: 'Grupo disfrutando un paseo calmado en ponton',
      },
    },
    'tour-kayak': {
      id: 'tour-kayak',
      name: 'Kayak guiado por manglares',
      category: 'Aventura',
      durationHours: 2,
      priceFrom: 680,
      description:
        'Una salida mas ligera y activa por zonas tranquilas de la laguna para quienes quieren una experiencia cercana a la naturaleza sin ocupar todo el dia.',
      route: '/tours/tour-kayak',
      image: {
        ...images.tourKayak,
        alt: 'Kayaks avanzando por agua tranquila en Bacalar',
      },
    },
  },
}

export const restaurantDetailsByLanguage: Record<
  AppLanguage,
  Record<string, RestaurantDetail>
> = {
  en: {
    'rest-cielo': {
      id: 'rest-cielo',
      name: 'Cielo de Maiz',
      cuisine: 'Vegetarian',
      vibe: 'Garden breakfast',
      priceBand: '$$',
      description:
        'A relaxed breakfast stop with garden energy, fresh plates, and enough calm to set up a lagoon morning without rushing anyone through it.',
      route: '/restaurants/rest-cielo',
      image: images.restaurantCielo,
    },
    'rest-ixchel': {
      id: 'rest-ixchel',
      name: 'Ixchel Cocina',
      cuisine: 'Regional Mexican',
      vibe: 'Casual local favorite',
      priceBand: '$$',
      description:
        'A dependable lunch option when the day needs something grounded, regional, and easy to say yes to after a morning on the water.',
      route: '/restaurants/rest-ixchel',
      image: images.restaurantIxchel,
    },
    'rest-naao': {
      id: 'rest-naao',
      name: 'Nao',
      cuisine: 'Seafood',
      vibe: 'Lagoon-facing dinner',
      priceBand: '$$$',
      description:
        'An evening pick for when the stay calls for one elevated meal, strong seafood, and a setting that makes sunset feel part of dinner.',
      route: '/restaurants/rest-naao',
      image: images.restaurantNao,
    },
  },
  es: {
    'rest-cielo': {
      id: 'rest-cielo',
      name: 'Cielo de Maiz',
      cuisine: 'Vegetariano',
      vibe: 'Desayuno en jardin',
      priceBand: '$$',
      description:
        'Un desayuno relajado con ambiente de jardin, platos frescos y la calma suficiente para arrancar una manana de laguna sin prisas.',
      route: '/restaurants/rest-cielo',
      image: {
        ...images.restaurantCielo,
        alt: 'Mesa de desayuno iluminada por el sol entre vegetacion',
      },
    },
    'rest-ixchel': {
      id: 'rest-ixchel',
      name: 'Ixchel Cocina',
      cuisine: 'Mexicana regional',
      vibe: 'Favorito local casual',
      priceBand: '$$',
      description:
        'Una opcion confiable para almorzar cuando el dia pide algo regional, cercano y facil de elegir despues de una manana en el agua.',
      route: '/restaurants/rest-ixchel',
      image: {
        ...images.restaurantIxchel,
        alt: 'Terraza de restaurante preparada para el almuerzo',
      },
    },
    'rest-naao': {
      id: 'rest-naao',
      name: 'Nao',
      cuisine: 'Mariscos',
      vibe: 'Cena frente a la laguna',
      priceBand: '$$$',
      description:
        'Una eleccion nocturna para cuando la estancia pide una comida mas especial, buenos mariscos y un entorno donde el atardecer acompana la cena.',
      route: '/restaurants/rest-naao',
      image: {
        ...images.restaurantNao,
        alt: 'Restaurante calido de noche cerca del agua',
      },
    },
  },
}

export const eventDetailsByLanguage: Record<
  AppLanguage,
  Record<string, EventDetail>
> = {
  en: {
    'event-sunset-jazz': {
      id: 'event-sunset-jazz',
      title: 'Sunset Jazz by the Lagoon',
      category: 'music',
      dateLabel: 'Friday, 7:00 PM',
      venue: 'Casa Laguna Deck',
      description:
        'An easy, high-reward evening add-on with live music, open air, and a sunset window that works especially well after a lighter afternoon.',
      route: '/events/event-sunset-jazz',
      image: images.eventJazz,
    },
    'event-market-brunch': {
      id: 'event-market-brunch',
      title: 'Local Market Brunch Crawl',
      category: 'food',
      dateLabel: 'Saturday, 10:30 AM',
      venue: 'Centro Bacalar',
      description:
        'A social daytime option for travelers who want to spend one morning in town and fold local flavors into the trip without a fixed formal meal.',
      route: '/events/event-market-brunch',
      image: images.eventMarket,
    },
    'event-breathwork': {
      id: 'event-breathwork',
      title: 'Lagoon Breathwork Session',
      category: 'wellness',
      dateLabel: 'Sunday, 8:00 AM',
      venue: 'Isla Yoga Garden',
      description:
        'A softer sunrise plan that leans into Bacalar calm, ideal for visitors who want one restorative moment rather than another packed activity.',
      route: '/events/event-breathwork',
      image: images.eventBreathwork,
    },
  },
  es: {
    'event-sunset-jazz': {
      id: 'event-sunset-jazz',
      title: 'Jazz al atardecer junto a la laguna',
      category: 'music',
      dateLabel: 'Viernes, 7:00 PM',
      venue: 'Terraza Casa Laguna',
      description:
        'Un extra nocturno facil y muy rendidor con musica en vivo, aire libre y una ventana de atardecer que funciona especialmente bien despues de una tarde ligera.',
      route: '/events/event-sunset-jazz',
      image: {
        ...images.eventJazz,
        alt: 'Musica en vivo al atardecer junto a la laguna',
      },
    },
    'event-market-brunch': {
      id: 'event-market-brunch',
      title: 'Ruta de brunch por el mercado local',
      category: 'food',
      dateLabel: 'Sabado, 10:30 AM',
      venue: 'Centro de Bacalar',
      description:
        'Una opcion social de dia para quienes quieren pasar una manana en el centro y sumar sabores locales al viaje sin una comida formal cerrada.',
      route: '/events/event-market-brunch',
      image: {
        ...images.eventMarket,
        alt: 'Mercado local lleno de color y puestos de comida',
      },
    },
    'event-breathwork': {
      id: 'event-breathwork',
      title: 'Sesion de respiracion frente a la laguna',
      category: 'wellness',
      dateLabel: 'Domingo, 8:00 AM',
      venue: 'Jardin Isla Yoga',
      description:
        'Un plan suave al amanecer que se apoya en la calma de Bacalar, ideal para quienes quieren un momento restaurador en vez de otra actividad cargada.',
      route: '/events/event-breathwork',
      image: {
        ...images.eventBreathwork,
        alt: 'Sesion de bienestar al amanecer junto al agua',
      },
    },
  },
}

export const homeContentByLanguage: Record<AppLanguage, HomeContent> = {
  en: {
    hero: {
      eyebrow: 'Bacalar, made simple',
      title: 'Start with the water, then layer in food and what is happening this week.',
      description:
        'A calmer homepage for both first-time visitors and returning travelers: strong lagoon picks up front, easy food choices next, and timely events when they actually improve the plan.',
    },
    spotlight: {
      actions: [
        { key: 'tours', label: 'Tours' },
        { key: 'restaurants', label: 'Restaurants' },
        { key: 'events', label: 'Events' },
      ],
      entries: {
        tours: {
          title: 'Choose a lagoon experience with less second-guessing',
          description:
            'Compare a few high-confidence tour options first, then keep browsing if you want more range.',
          route: '/tours',
          cta: 'Browse tours',
          metrics: [
            { label: 'Best for', value: 'First planning step' },
            { label: 'Focus', value: 'Time + price' },
            { label: 'Mood', value: 'Lagoon first' },
          ],
          image: images.hero,
        },
        restaurants: {
          title: 'Match breakfast, lunch, and dinner to the shape of the day',
          description:
            'Restaurant picks should support the itinerary, not compete with it.',
          route: '/restaurants',
          cta: 'Browse restaurants',
          metrics: [
            { label: 'Best for', value: 'Meal planning' },
            { label: 'Focus', value: 'Cuisine + vibe' },
            { label: 'Mood', value: 'Easy choices' },
          ],
          image: images.restaurantCielo,
        },
        events: {
          title: 'Use events as the timely extra, not the whole plan',
          description:
            'Give returning visitors something fresh while keeping the homepage calm for newcomers.',
          route: '/events',
          cta: 'Browse events',
          metrics: [
            { label: 'Best for', value: 'Returning visits' },
            { label: 'Focus', value: 'This week' },
            { label: 'Mood', value: 'Local texture' },
          ],
          image: images.eventJazz,
        },
      },
    },
    planningCallout: {
      eyebrow: 'How to use this page',
      title: 'A few strong options beat an overloaded travel homepage',
      description:
        'Keep the structure practical: choose the water plan, pair it with the right meal, then add one timely event if it fits.',
      items: [
        'Start with one tour that sets the rhythm of the day.',
        'Use restaurants to support the itinerary, not distract from it.',
        'Treat events as selective upgrades for guests who want something current.',
      ],
    },
    featuredExperiences: {
      intro: {
        eyebrow: 'Top tours',
        title: 'A short list of lagoon experiences worth opening first',
        description:
          'Compact, confidence-building options for people who want to move quickly.',
      },
      items: [
        {
          id: 'tour-sailing',
          title: 'Private Sailing at Sunrise',
          description:
            'A premium first memory for travelers who want still water and soft morning light.',
          meta: '4 hours · From 2,100 MXN',
          route: '/tours/tour-sailing',
          image: images.tourSailing,
        },
        {
          id: 'tour-pontoon',
          title: 'Family Pontoon Loop',
          description:
            'A relaxed midday option for groups who want swimming and sightseeing without overplanning.',
          meta: '3 hours · From 1,450 MXN',
          route: '/tours/tour-pontoon',
          image: images.tourPontoon,
        },
        {
          id: 'tour-kayak',
          title: 'Guided Mangrove Kayak',
          description:
            'A quieter, active route for travelers who want something lighter and closer to nature.',
          meta: '2 hours · From 680 MXN',
          route: '/tours/tour-kayak',
          image: images.tourKayak,
        },
      ],
    },
    diningMoments: {
      intro: {
        eyebrow: 'Where to eat',
        title: 'Breakfast, lunch, and dinner that fit the pace of Bacalar',
        description:
          'Keep restaurant decisions short, visual, and easy to scan.',
      },
      items: [
        {
          id: 'rest-cielo',
          label: 'Breakfast',
          title: 'Cielo de Maiz',
          description:
            'A garden breakfast stop before a lagoon morning.',
          meta: 'Vegetarian · $$',
          route: '/restaurants/rest-cielo',
          image: images.restaurantCielo,
        },
        {
          id: 'rest-ixchel',
          label: 'Lunch',
          title: 'Ixchel Cocina',
          description:
            'A casual local lunch that works well after a tour.',
          meta: 'Regional Mexican · $$',
          route: '/restaurants/rest-ixchel',
          image: images.restaurantIxchel,
        },
        {
          id: 'rest-naao',
          label: 'Dinner',
          title: 'Nao',
          description:
            'A lagoon-facing dinner pick for the one more elevated meal of the trip.',
          meta: 'Seafood · $$$',
          route: '/restaurants/rest-naao',
          image: images.restaurantNao,
        },
      ],
    },
    weeklyHappenings: {
      intro: {
        eyebrow: 'This week',
        title: 'Current events that add texture without crowding the page',
        description:
          'Fresh enough for repeat visitors, selective enough for everyone else.',
      },
      items: [
        {
          id: 'event-sunset-jazz',
          label: 'Friday evening',
          title: 'Sunset Jazz by the Lagoon',
          description:
            'A memorable evening add-on with very little planning overhead.',
          meta: 'Casa Laguna Deck · 7:00 PM',
          route: '/events/event-sunset-jazz',
          image: images.eventJazz,
        },
        {
          id: 'event-market-brunch',
          label: 'Saturday morning',
          title: 'Local Market Brunch Crawl',
          description:
            'A useful town morning for travelers who want one social food outing.',
          meta: 'Centro Bacalar · 10:30 AM',
          route: '/events/event-market-brunch',
          image: images.eventMarket,
        },
        {
          id: 'event-breathwork',
          label: 'Sunday sunrise',
          title: 'Lagoon Breathwork Session',
          description:
            'A quieter wellness option that leans into Bacalar calm.',
          meta: 'Isla Yoga Garden · 8:00 AM',
          route: '/events/event-breathwork',
          image: images.eventBreathwork,
        },
      ],
    },
  },
  es: {
    hero: {
      eyebrow: 'Bacalar, mas simple',
      title: 'Empieza por el agua y despues suma comida y lo que esta pasando esta semana.',
      description:
        'Una portada mas calmada para quienes vienen por primera vez y para quienes regresan: grandes picks de laguna al frente, comida facil despues y eventos oportunos solo cuando realmente ayudan.',
    },
    spotlight: {
      actions: [
        { key: 'tours', label: 'Tours' },
        { key: 'restaurants', label: 'Restaurantes' },
        { key: 'events', label: 'Eventos' },
      ],
      entries: {
        tours: {
          title: 'Elige una experiencia en la laguna con menos dudas',
          description:
            'Compara primero unas pocas opciones de alta confianza y sigue explorando solo si quieres mas variedad.',
          route: '/tours',
          cta: 'Ver tours',
          metrics: [
            { label: 'Ideal para', value: 'Primer paso' },
            { label: 'Enfoque', value: 'Tiempo y precio' },
            { label: 'Ambiente', value: 'Laguna primero' },
          ],
          image: {
            ...images.hero,
            alt: 'Agua turquesa y orilla clara en Bacalar',
          },
        },
        restaurants: {
          title: 'Haz que desayuno, almuerzo y cena acompañen el dia',
          description:
            'Los restaurantes deben apoyar el itinerario, no competir con el.',
          route: '/restaurants',
          cta: 'Ver restaurantes',
          metrics: [
            { label: 'Ideal para', value: 'Planear comidas' },
            { label: 'Enfoque', value: 'Cocina y ambiente' },
            { label: 'Ambiente', value: 'Elecciones faciles' },
          ],
          image: {
            ...images.restaurantCielo,
            alt: 'Desayuno luminoso rodeado de vegetacion',
          },
        },
        events: {
          title: 'Usa los eventos como el extra oportuno, no como todo el plan',
          description:
            'Dale algo fresco a quien regresa sin volver caotica la portada para quien llega por primera vez.',
          route: '/events',
          cta: 'Ver eventos',
          metrics: [
            { label: 'Ideal para', value: 'Visitas repetidas' },
            { label: 'Enfoque', value: 'Esta semana' },
            { label: 'Ambiente', value: 'Textura local' },
          ],
          image: {
            ...images.eventJazz,
            alt: 'Musica en vivo al atardecer',
          },
        },
      },
    },
    planningCallout: {
      eyebrow: 'Como usar esta pagina',
      title: 'Unas pocas opciones fuertes funcionan mejor que una portada saturada',
      description:
        'Mantena el recorrido practico: elige primero el plan de agua, acompanalo con la comida adecuada y agrega un evento solo si encaja.',
      items: [
        'Empieza con un tour que marque el ritmo del dia.',
        'Usa restaurantes para apoyar el itinerario, no para distraerlo.',
        'Trata los eventos como mejoras selectivas para quien quiere algo actual.',
      ],
    },
    featuredExperiences: {
      intro: {
        eyebrow: 'Tours top',
        title: 'Una lista corta de experiencias en la laguna que vale la pena abrir primero',
        description:
          'Opciones compactas y claras para avanzar rapido con confianza.',
      },
      items: [
        {
          id: 'tour-sailing',
          title: 'Vela privada al amanecer',
          description:
            'Un primer recuerdo premium para quienes buscan agua quieta y luz suave.',
          meta: '4 horas · Desde 2,100 MXN',
          route: '/tours/tour-sailing',
          image: {
            ...images.tourSailing,
            alt: 'Velero privado al amanecer',
          },
        },
        {
          id: 'tour-pontoon',
          title: 'Recorrido familiar en ponton',
          description:
            'Una opcion relajada al mediodia para grupos que quieren nadar y pasear sin planear demasiado.',
          meta: '3 horas · Desde 1,450 MXN',
          route: '/tours/tour-pontoon',
          image: {
            ...images.tourPontoon,
            alt: 'Paseo familiar en ponton sobre la laguna',
          },
        },
        {
          id: 'tour-kayak',
          title: 'Kayak guiado por manglares',
          description:
            'Una ruta mas tranquila y activa para quienes quieren algo ligero y cercano a la naturaleza.',
          meta: '2 horas · Desde 680 MXN',
          route: '/tours/tour-kayak',
          image: {
            ...images.tourKayak,
            alt: 'Kayaks recorriendo agua tranquila',
          },
        },
      ],
    },
    diningMoments: {
      intro: {
        eyebrow: 'Donde comer',
        title: 'Desayuno, almuerzo y cena con el ritmo correcto para Bacalar',
        description:
          'Haz que decidir restaurante sea corto, visual y facil de leer.',
      },
      items: [
        {
          id: 'rest-cielo',
          label: 'Desayuno',
          title: 'Cielo de Maiz',
          description:
            'Una parada de desayuno en jardin antes de la manana de laguna.',
          meta: 'Vegetariano · $$',
          route: '/restaurants/rest-cielo',
          image: {
            ...images.restaurantCielo,
            alt: 'Desayuno luminoso en jardin',
          },
        },
        {
          id: 'rest-ixchel',
          label: 'Almuerzo',
          title: 'Ixchel Cocina',
          description:
            'Un almuerzo local y casual que funciona muy bien despues de un tour.',
          meta: 'Mexicana regional · $$',
          route: '/restaurants/rest-ixchel',
          image: {
            ...images.restaurantIxchel,
            alt: 'Terraza casual para almorzar',
          },
        },
        {
          id: 'rest-naao',
          label: 'Cena',
          title: 'Nao',
          description:
            'Una cena frente a la laguna para esa comida mas especial del viaje.',
          meta: 'Mariscos · $$$',
          route: '/restaurants/rest-naao',
          image: {
            ...images.restaurantNao,
            alt: 'Cena calida frente al agua',
          },
        },
      ],
    },
    weeklyHappenings: {
      intro: {
        eyebrow: 'Esta semana',
        title: 'Eventos actuales que suman textura sin saturar la pagina',
        description:
          'Lo bastante fresco para quien vuelve, lo bastante selectivo para todos.',
      },
      items: [
        {
          id: 'event-sunset-jazz',
          label: 'Viernes por la tarde',
          title: 'Jazz al atardecer junto a la laguna',
          description:
            'Un plan nocturno memorable con muy poca friccion para decidir.',
          meta: 'Terraza Casa Laguna · 7:00 PM',
          route: '/events/event-sunset-jazz',
          image: {
            ...images.eventJazz,
            alt: 'Jazz al atardecer junto a la laguna',
          },
        },
        {
          id: 'event-market-brunch',
          label: 'Sabado por la manana',
          title: 'Ruta de brunch por el mercado local',
          description:
            'Una manana util en el pueblo para quienes quieren una salida social alrededor de la comida.',
          meta: 'Centro Bacalar · 10:30 AM',
          route: '/events/event-market-brunch',
          image: {
            ...images.eventMarket,
            alt: 'Mercado local con comida y color',
          },
        },
        {
          id: 'event-breathwork',
          label: 'Domingo al amanecer',
          title: 'Sesion de respiracion frente a la laguna',
          description:
            'Una opcion de bienestar mas silenciosa que se apoya en la calma de Bacalar.',
          meta: 'Jardin Isla Yoga · 8:00 AM',
          route: '/events/event-breathwork',
          image: {
            ...images.eventBreathwork,
            alt: 'Sesion de bienestar al amanecer',
          },
        },
      ],
    },
  },
}
