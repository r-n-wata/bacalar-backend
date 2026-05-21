import type {
  AppLanguage,
  EventsContent,
  HomeContent,
  RestaurantsContent,
  ToursContent,
} from '../types/content'

export const homeContentByLanguage: Record<AppLanguage, HomeContent> = {
  en: {
    hero: {
      eyebrow: 'Plan Bacalar with intention',
      title: 'Help travelers build an easy, beautiful first plan for Bacalar.',
      description:
        'This page should feel like a calm travel concierge: lead with the lagoon, suggest the best next decisions, and make the first plan feel simple from the start.',
    },
    spotlight: {
      actions: [
        { key: 'events', label: 'Events' },
        { key: 'restaurants', label: 'Restaurants' },
        { key: 'tours', label: 'Tours' },
      ],
      entries: {
        events: {
          title: 'Show what is happening in Bacalar this week',
          description:
            'Highlight live music, food gatherings, wellness sessions, and small local moments that help a stay feel current.',
          route: '/events',
          cta: 'Browse events',
          metrics: [
            { label: 'Best for', value: 'Evening plans' },
            { label: 'Focus', value: 'This week' },
            { label: 'Value', value: 'Timely picks' },
          ],
        },
        restaurants: {
          title: 'Choose where to eat in Bacalar throughout the day',
          description:
            'Help guests move from lagoon mornings to breakfast gardens, easy lunches, and memorable dinners without overthinking it.',
          route: '/restaurants',
          cta: 'Browse restaurants',
          metrics: [
            { label: 'Best for', value: 'Meal planning' },
            { label: 'Focus', value: 'Cuisine + vibe' },
            { label: 'Value', value: 'Curated choices' },
          ],
        },
        tours: {
          title: 'Turn lagoon tour browsing into a confident decision',
          description:
            'Compare duration, category, and starting price so travelers can quickly choose the right time on the water.',
          route: '/tours',
          cta: 'Browse tours',
          metrics: [
            { label: 'Best for', value: 'First click' },
            { label: 'Focus', value: 'Time + price' },
            { label: 'Value', value: 'Easy comparison' },
          ],
        },
      },
    },
    planningCallout: {
      eyebrow: 'Start here',
      title: 'A clear first plan beats a crowded homepage',
      description:
        'Lead with the lagoon, support the day with a few strong restaurant picks, and add timely events only when they genuinely improve the stay.',
      items: [
        'Choose one standout lagoon experience first.',
        'Pair it with the right breakfast, lunch, or dinner stop.',
        'Add an event only if it improves the day, not because it fills space.',
        'Keep the page focused on the next best decision.',
      ],
    },
    featuredExperiences: {
      intro: {
        eyebrow: 'Featured lagoon experiences',
        title: 'Start with a few strong lagoon experiences',
        description:
          'Keep the homepage focused on a small number of high-confidence options instead of trying to show everything at once.',
      },
      items: [
        {
          title: 'Private Sailing at Sunrise',
          description:
            'A signature Bacalar experience for travelers who want calm water, soft light, and a premium first memory.',
          meta: '4 hours · From 2,100 MXN',
          route: '/tours',
        },
        {
          title: 'Family Pontoon Loop',
          description:
            'An easy midday option for groups who want swimming, sightseeing, and a relaxed pace on the lagoon.',
          meta: '3 hours · From 1,450 MXN',
          route: '/tours',
        },
        {
          title: 'Guided Mangrove Kayak',
          description:
            'A lighter, more active outing for guests who want to explore quietly and stay close to nature.',
          meta: '2 hours · From 680 MXN',
          route: '/tours',
        },
      ],
    },
    diningMoments: {
      intro: {
        eyebrow: 'Where to eat by moment',
        title: 'Breakfast, lunch, and dinner picks for Bacalar',
        description:
          'Restaurant content works best when it quietly supports the day plan.',
      },
      items: [
        {
          label: 'Breakfast',
          title: 'Cielo de Maiz',
          description:
            'Start with a garden breakfast that feels unhurried and local before guests head toward the water.',
          meta: 'Vegetarian · $$',
          route: '/restaurants',
        },
        {
          label: 'Lunch',
          title: 'Ixchel Cocina',
          description:
            'A casual local favorite that works well after a morning tour when people want something easy and satisfying.',
          meta: 'Regional Mexican · $$',
          route: '/restaurants',
        },
        {
          label: 'Dinner',
          title: 'Nao',
          description:
            'A lagoon-facing seafood dinner pick for evenings when the trip calls for one elevated meal.',
          meta: 'Seafood · $$$',
          route: '/restaurants',
        },
      ],
    },
    weeklyHappenings: {
      intro: {
        eyebrow: 'This week in Bacalar',
        title: 'Use events as timely local add-ons',
        description:
          'Keep event coverage selective so it adds texture without competing with the main planning flow.',
      },
      items: [
        {
          label: 'Friday evening',
          title: 'Sunset Jazz by the Lagoon',
          description:
            'A strong end-of-day upgrade for travelers who want one memorable local event without overplanning.',
          meta: 'Casa Laguna Deck · 7:00 PM',
          route: '/events',
        },
        {
          label: 'Saturday morning',
          title: 'Local Market Brunch Crawl',
          description:
            'Useful for guests who want to spend one morning in town and mix food discovery into the stay.',
          meta: 'Centro Bacalar · 10:30 AM',
          route: '/events',
        },
        {
          label: 'Sunday sunrise',
          title: 'Lagoon Breathwork Session',
          description:
            'A wellness-forward option that reinforces Bacalar\'s quieter, restorative side.',
          meta: 'Isla Yoga Garden · 8:00 AM',
          route: '/events',
        },
      ],
    },
  },
  es: {
    hero: {
      eyebrow: 'Planea Bacalar con intencion',
      title:
        'Ayuda a las personas viajeras a construir un primer plan facil y bonito para Bacalar.',
      description:
        'Esta pagina debe sentirse como una concierge tranquila de viaje: lidera con la laguna, sugiere las siguientes decisiones y haz que el primer plan se sienta sencillo desde la primera pantalla.',
    },
    spotlight: {
      actions: [
        { key: 'events', label: 'Eventos' },
        { key: 'restaurants', label: 'Restaurantes' },
        { key: 'tours', label: 'Tours' },
      ],
      entries: {
        events: {
          title: 'Muestra lo que sucede en Bacalar esta semana',
          description:
            'Destaca musica en vivo, reuniones de comida, sesiones de bienestar y pequenos momentos locales que hacen sentir actual la estancia.',
          route: '/events',
          cta: 'Ver eventos',
          metrics: [
            { label: 'Ideal para', value: 'Planes nocturnos' },
            { label: 'Enfoque', value: 'Esta semana' },
            { label: 'Valor', value: 'Picks oportunos' },
          ],
        },
        restaurants: {
          title: 'Elige donde comer en Bacalar durante el dia',
          description:
            'Ayuda a las personas huespedes a pasar de las mananas en la laguna a desayunos en jardin, almuerzos faciles y cenas memorables.',
          route: '/restaurants',
          cta: 'Ver restaurantes',
          metrics: [
            { label: 'Ideal para', value: 'Planear comidas' },
            { label: 'Enfoque', value: 'Cocina y ambiente' },
            { label: 'Valor', value: 'Opciones curadas' },
          ],
        },
        tours: {
          title: 'Convierte la exploracion de tours en una decision segura',
          description:
            'Compara duracion, categoria y precio inicial para que la gente elija rapido el mejor tiempo en el agua.',
          route: '/tours',
          cta: 'Ver tours',
          metrics: [
            { label: 'Ideal para', value: 'Primer clic' },
            { label: 'Enfoque', value: 'Tiempo y precio' },
            { label: 'Valor', value: 'Comparacion facil' },
          ],
        },
      },
    },
    planningCallout: {
      eyebrow: 'Comienza aqui',
      title: 'Un primer plan claro funciona mejor que una portada saturada',
      description:
        'Lidera con la laguna, acompana el dia con unos pocos restaurantes fuertes y agrega eventos solo cuando realmente mejoran la estancia.',
      items: [
        'Elige primero una experiencia destacada en la laguna.',
        'Combinala con el desayuno, almuerzo o cena adecuados.',
        'Agrega un evento solo si mejora el dia, no solo para llenar espacio.',
        'Manten la pagina enfocada en la siguiente mejor decision.',
      ],
    },
    featuredExperiences: {
      intro: {
        eyebrow: 'Experiencias destacadas en la laguna',
        title: 'Comienza con unas pocas experiencias fuertes en la laguna',
        description:
          'La pagina principal funciona mejor cuando enfoca unas opciones de alta confianza en vez de intentar mostrarlo todo.',
      },
      items: [
        {
          title: 'Vela privada al amanecer',
          description:
            'Una experiencia insignia de Bacalar para quienes buscan agua tranquila, luz suave y un primer recuerdo premium.',
          meta: '4 horas · Desde 2,100 MXN',
          route: '/tours',
        },
        {
          title: 'Recorrido familiar en ponton',
          description:
            'Una opcion facil al mediodia para grupos que quieren nadar, conocer la laguna y avanzar sin prisa.',
          meta: '3 horas · Desde 1,450 MXN',
          route: '/tours',
        },
        {
          title: 'Kayak guiado por manglar',
          description:
            'Una salida mas ligera y activa para quienes quieren explorar en silencio y mantenerse cerca de la naturaleza.',
          meta: '2 horas · Desde 680 MXN',
          route: '/tours',
        },
      ],
    },
    diningMoments: {
      intro: {
        eyebrow: 'Donde comer segun el momento',
        title: 'Picks de desayuno, almuerzo y cena para Bacalar',
        description:
          'El contenido de restaurantes funciona mejor cuando acompana el plan del dia sin competir con el.',
      },
      items: [
        {
          label: 'Desayuno',
          title: 'Cielo de Maiz',
          description:
            'Empieza con un desayuno de jardin que se siente local y sin prisa antes de ir hacia el agua.',
          meta: 'Vegetariano · $$',
          route: '/restaurants',
        },
        {
          label: 'Almuerzo',
          title: 'Ixchel Cocina',
          description:
            'Un favorito local casual que funciona bien despues de un tour matutino cuando la gente quiere algo facil y rico.',
          meta: 'Mexicana regional · $$',
          route: '/restaurants',
        },
        {
          label: 'Cena',
          title: 'Nao',
          description:
            'Una cena frente a la laguna para noches en las que el viaje pide una comida mas especial.',
          meta: 'Mariscos · $$$',
          route: '/restaurants',
        },
      ],
    },
    weeklyHappenings: {
      intro: {
        eyebrow: 'Esta semana en Bacalar',
        title: 'Usa eventos como extras locales y oportunos',
        description:
          'Manten la cobertura de eventos selectiva para que aporte textura sin competir con el flujo principal del plan.',
      },
      items: [
        {
          label: 'Viernes por la tarde',
          title: 'Jazz al atardecer junto a la laguna',
          description:
            'Una mejora fuerte para cerrar el dia si alguien quiere un momento local memorable sin planear demasiado.',
          meta: 'Deck Casa Laguna · 7:00 PM',
          route: '/events',
        },
        {
          label: 'Sabado por la manana',
          title: 'Ruta brunch por el mercado local',
          description:
            'Util para quienes quieren dedicar una manana al centro y mezclar descubrimiento gastronomico en la estancia.',
          meta: 'Centro Bacalar · 10:30 AM',
          route: '/events',
        },
        {
          label: 'Domingo al amanecer',
          title: 'Sesion de respiracion frente a la laguna',
          description:
            'Una opcion de bienestar que refuerza el lado mas tranquilo y restaurador de Bacalar.',
          meta: 'Isla Yoga Garden · 8:00 AM',
          route: '/events',
        },
      ],
    },
  },
}

export const eventsContentByLanguage: Record<AppLanguage, EventsContent> = {
  en: {
    eyebrow: 'Events feature',
    title: 'Recent and upcoming events',
    description:
      'This feature owns event queries, event-specific UI, and future filters without pushing server data into global state.',
    items: [
      {
        id: 'event-sunset-jazz',
        title: 'Sunset Jazz by the Lagoon',
        dateLabel: 'Friday, 7:00 PM',
        venue: 'Casa Laguna Deck',
        category: 'music',
      },
      {
        id: 'event-market-brunch',
        title: 'Local Market Brunch Crawl',
        dateLabel: 'Saturday, 10:30 AM',
        venue: 'Centro Bacalar',
        category: 'food',
      },
      {
        id: 'event-breathwork',
        title: 'Lagoon Breathwork Session',
        dateLabel: 'Sunday, 8:00 AM',
        venue: 'Isla Yoga Garden',
        category: 'wellness',
      },
    ],
  },
  es: {
    eyebrow: 'Funcionalidad de eventos',
    title: 'Eventos recientes y proximos',
    description:
      'Esta funcionalidad controla las consultas de eventos, la UI especifica del dominio y futuros filtros sin mover datos remotos al estado global.',
    items: [
      {
        id: 'event-sunset-jazz',
        title: 'Jazz al atardecer junto a la laguna',
        dateLabel: 'Viernes, 7:00 PM',
        venue: 'Terraza Casa Laguna',
        category: 'music',
      },
      {
        id: 'event-market-brunch',
        title: 'Ruta de brunch por el mercado local',
        dateLabel: 'Sabado, 10:30 AM',
        venue: 'Centro de Bacalar',
        category: 'food',
      },
      {
        id: 'event-breathwork',
        title: 'Sesion de respiracion frente a la laguna',
        dateLabel: 'Domingo, 8:00 AM',
        venue: 'Jardin Isla Yoga',
        category: 'wellness',
      },
    ],
  },
}

export const restaurantsContentByLanguage: Record<
  AppLanguage,
  RestaurantsContent
> = {
  en: {
    eyebrow: 'Restaurants feature',
    title: 'Restaurant discovery',
    description:
      'Shared cards and layout stay generic, while restaurant copy and queries remain feature-owned.',
    items: [
      {
        id: 'rest-naao',
        name: 'Nao',
        cuisine: 'Seafood',
        vibe: 'Lagoon-facing dinner',
        priceBand: '$$$',
      },
      {
        id: 'rest-ixchel',
        name: 'Ixchel Cocina',
        cuisine: 'Regional Mexican',
        vibe: 'Casual local favorite',
        priceBand: '$$',
      },
      {
        id: 'rest-cielo',
        name: 'Cielo de Maiz',
        cuisine: 'Vegetarian',
        vibe: 'Garden breakfast',
        priceBand: '$$',
      },
    ],
  },
  es: {
    eyebrow: 'Funcionalidad de restaurantes',
    title: 'Descubrimiento de restaurantes',
    description:
      'Las tarjetas y el layout compartidos se mantienen genericos, mientras la copia y las consultas quedan dentro de la funcionalidad.',
    items: [
      {
        id: 'rest-naao',
        name: 'Nao',
        cuisine: 'Mariscos',
        vibe: 'Cena frente a la laguna',
        priceBand: '$$$',
      },
      {
        id: 'rest-ixchel',
        name: 'Ixchel Cocina',
        cuisine: 'Mexicana regional',
        vibe: 'Favorito local casual',
        priceBand: '$$',
      },
      {
        id: 'rest-cielo',
        name: 'Cielo de Maiz',
        cuisine: 'Vegetariano',
        vibe: 'Desayuno en el jardin',
        priceBand: '$$',
      },
    ],
  },
}

export const toursContentByLanguage: Record<AppLanguage, ToursContent> = {
  en: {
    eyebrow: 'Tours feature',
    title: 'Boat tours and experience browsing',
    description:
      'React Query owns live availability-ready tour data, while future compare and filter state can stay client-side.',
    items: [
      {
        id: 'tour-sailing',
        name: 'Private Sailing at Sunrise',
        category: 'Premium',
        durationHours: 4,
        priceFrom: 2100,
      },
      {
        id: 'tour-pontoon',
        name: 'Family Pontoon Loop',
        category: 'Group',
        durationHours: 3,
        priceFrom: 1450,
      },
      {
        id: 'tour-kayak',
        name: 'Guided Mangrove Kayak',
        category: 'Adventure',
        durationHours: 2,
        priceFrom: 680,
      },
    ],
  },
  es: {
    eyebrow: 'Funcionalidad de tours',
    title: 'Tours en lancha y exploracion de experiencias',
    description:
      'React Query controla los datos listos para disponibilidad, mientras futuros filtros y comparaciones pueden quedarse del lado del cliente.',
    items: [
      {
        id: 'tour-sailing',
        name: 'Velero privado al amanecer',
        category: 'Premium',
        durationHours: 4,
        priceFrom: 2100,
      },
      {
        id: 'tour-pontoon',
        name: 'Recorrido familiar en ponton',
        category: 'Grupo',
        durationHours: 3,
        priceFrom: 1450,
      },
      {
        id: 'tour-kayak',
        name: 'Kayak guiado por manglares',
        category: 'Aventura',
        durationHours: 2,
        priceFrom: 680,
      },
    ],
  },
}
