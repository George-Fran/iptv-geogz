import { EPGProgram } from '../types/iptv';

// Generates dynamic schedule relative to current time
export function getEPGScheduleForChannel(channelId: string): EPGProgram[] {
  const now = new Date();
  const currentHour = now.getHours();

  // Helper to format HH:MM
  const formatTime = (h: number, m: number) => {
    const hh = String(((h % 24) + 24) % 24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const programsData: Record<string, { title: string; desc: string; cat: string }[]> = {
    'rtve-24h': [
      { title: 'Telediario 24H: Edición Continua', desc: 'Repaso exhaustivo a la actualidad nacional e internacional, política, economía y sociedad.', cat: 'Noticias' },
      { title: 'La Tarde en 24 Horas', desc: 'Análisis y debate de los temas de mayor impacto informativo con analistas especializados.', cat: 'Debate' },
      { title: 'El Tiempo & Radar Meteorológico', desc: 'Pronóstico de temperaturas, frentes de viento y avisos meteorológicos para las próximas 48 horas.', cat: 'Meteorología' },
      { title: 'Zoom Net: Tecnología e Innovación', desc: 'Tendencias en inteligencia artificial, videojuegos, robótica y cultura digital.', cat: 'Ciencia' },
      { title: 'Crónica 24H Internacional', desc: 'Corresponsalías de RTVE en Bruselas, Washington, Tokio y América Latina.', cat: 'Mundo' }
    ],
    'dw-espanol': [
      { title: 'DW Noticias Central', desc: 'La visión europea y global de los acontecimientos más determinantes del día.', cat: 'Noticias' },
      { title: 'Economía Actual con DW', desc: 'Mercados financieros, comercio internacional y transición energética europea.', cat: 'Economía' },
      { title: 'Enfoque Europa: Reportajes a Fondo', desc: 'Documentales e investigaciones en terreno sobre la sociedad europea.', cat: 'Documental' },
      { title: 'Cultura XXI', desc: 'Arquitectura, cine, literatura y tendencias culturales de vanguardia.', cat: 'Cultura' },
      { title: 'Alemania Hoy', desc: 'Panorama de la política interna, industria y sociedad de la mayor economía europea.', cat: 'Actualidad' }
    ],
    'france-24-es': [
      { title: 'El Diario de France 24', desc: 'Información inmediata y rigurosa sobre los acontecimientos que marcan la agenda mundial.', cat: 'Noticias' },
      { title: 'El Debate: América Latina y el Mundo', desc: 'Mesa redonda con analistas internacionales sobre los desafíos geopolíticos de la región.', cat: 'Opinión' },
      { title: 'Semana de la Salud & Ciencia', desc: 'Avances médicos, investigación biológica y salud pública global.', cat: 'Salud' },
      { title: 'Cine & Escena Internacional', desc: 'Festivales, estrenos y entrevistas con directores y actores destacados.', cat: 'Arte' }
    ],
    'nasa-tv': [
      { title: 'ISS Live Feed & Earth Views', desc: 'Transmisión en directo en alta definición desde las cámaras exteriores de la Estación Espacial Internacional.', cat: 'Espacio' },
      { title: 'Artemis Deep Space Briefing', desc: 'Actualización técnica de la misión hacia la órbita lunar y preparativos del cohete SLS.', cat: 'Ingeniería' },
      { title: 'James Webb Telescope Highlights', desc: 'Nuevos descubrimientos astronómicos de galaxias primitivas y exoplanetas.', cat: 'Astronomía' },
      { title: 'Space Station Science Operations', desc: 'Experimentos de microgravedad y botánica espacial conducidos por los astronautas.', cat: 'Ciencia' }
    ],
    'bloomberg-tv': [
      { title: 'Bloomberg Markets: Global Open', desc: 'Apertura de bolsas, materias primas, bonos del tesoro y divisas internacionales.', cat: 'Finanzas' },
      { title: 'Balance of Power with Joe Mathieu', desc: 'Impacto de las decisiones políticas en la economía global y el comercio.', cat: 'Política' },
      { title: 'Bloomberg Technology Live', desc: 'Inversiones en Silicon Valley, semiconductores, computación cuántica y startups.', cat: 'Tecnología' }
    ],
    'redbull-tv': [
      { title: 'UCI Mountain Bike World Cup', desc: 'Descenso extremo y cross-country por circuitos de alta dificultad en los Alpes.', cat: 'Deportes' },
      { title: 'Red Bull Cliff Diving Highlights', desc: 'Saltos de gran altura desde acantilados naturales a más de 27 metros sobre el mar.', cat: 'Aventura' },
      { title: 'Way of the Wildcard: Historias de Atletas', desc: 'Documental biográfico sobre la perseverancia de atletas de deportes extremos.', cat: 'Documental' }
    ]
  };

  const list = programsData[channelId] || [
    { title: 'Emisión Continua en Directo', desc: 'Transmisión regular del canal 24/7 con programación continua y noticias de última hora.', cat: 'En Vivo' },
    { title: 'Informativo Especial', desc: 'Resumen de las noticias más relevantes y seguimiento de eventos en curso.', cat: 'Noticias' },
    { title: 'Espacio Cultural & Documentales', desc: 'Programación temática dedicada a la historia, ciencia y sociedad.', cat: 'Cultura' },
    { title: 'Resumen de Medianoche', desc: 'Cierre de jornada con los titulares más destacados del día.', cat: 'Actualidad' }
  ];

  return list.map((item, index) => {
    const startHour = (currentHour + index) % 24;
    const endHour = (startHour + 1) % 24;
    const startTimestamp = Date.now() + (index * 3600000) - (now.getMinutes() * 60000);
    const endTimestamp = startTimestamp + 3600000;

    return {
      id: `${channelId}-prog-${index}`,
      channelId,
      title: item.title,
      description: item.desc,
      startTime: formatTime(startHour, 0),
      endTime: formatTime(endHour, 0),
      startTimestamp,
      endTimestamp,
      category: item.cat
    };
  });
}
