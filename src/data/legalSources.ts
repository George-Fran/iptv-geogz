import { Channel, LegalSourceItem } from '../types/iptv';

export const INITIAL_LEGAL_CHANNELS: Channel[] = [
  {
    id: 'dw-espanol',
    name: 'DW Español (Alemania)',
    url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_logo.svg/320px-Deutsche_Welle_logo.svg.png',
    group: 'Noticias',
    country: 'Internacional',
    language: 'Español'
  },
  {
    id: 'france-24-es',
    name: 'France 24 en Español',
    url: 'https://f24hls-i.akamaihd.net/hls/live/221193/F24_ES_LO_HLS/master_500.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/France_24_logo_2013.svg/320px-France_24_logo_2013.svg.png',
    group: 'Noticias',
    country: 'Francia / Latam',
    language: 'Español'
  },
  {
    id: 'rtve-24h',
    name: 'RTVE Canal 24 Horas (España)',
    url: 'https://rtvelivestream.akamaized.net/rtvesec/24h/24h_main.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Canal_24_horas_2008.svg/320px-Canal_24_horas_2008.svg.png',
    group: 'Noticias',
    country: 'España',
    language: 'Español'
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV Live (Mundo/Espacio)',
    url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png',
    group: 'Ciencia & Cultura',
    country: 'Internacional',
    language: 'Inglés'
  },
  {
    id: 'bloomberg-tv',
    name: 'Bloomberg TV Finance',
    url: 'https://liveprodupm.global.ssl.fastly.net/us/Channel-USTV-AWS-virginia-1/Source-USTV-1000-1_live.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bloomberg_Television_logo.svg/320px-Bloomberg_Television_logo.svg.png',
    group: 'Economía & Negocios',
    country: 'Internacional',
    language: 'Inglés'
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV (Deportes & Aventura)',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png',
    group: 'Deportes',
    country: 'Internacional',
    language: 'Español / Inglés'
  },
  {
    id: 'euronews-es',
    name: 'Euronews en Español',
    url: 'https://euronews-euronews-spanish-1-es.samsung.wurl.tv/playlist.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Euronews_logo_2016.svg/320px-Euronews_logo_2016.svg.png',
    group: 'Noticias',
    country: 'Europa',
    language: 'Español'
  },
  {
    id: 'telefe-noticias-feed',
    name: 'Canal Noticias Abierto 24/7',
    url: 'https://stream.ecable.tv/ecable_channel/index.m3u8',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80',
    group: 'Noticias',
    country: 'Latinoamérica',
    language: 'Español'
  },
  {
    id: 'test-stream-bbb',
    name: 'Big Buck Bunny (HLS Test 1080p Multitasa)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=80',
    group: 'Test & Calidad',
    country: 'Global',
    language: 'Multiaudio'
  },
  {
    id: 'test-stream-tos',
    name: 'Tears of Steel (HLS Ultra Fast Segments)',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    logo: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&auto=format&fit=crop&q=80',
    group: 'Test & Calidad',
    country: 'Global',
    language: 'Español / Inglés'
  }
];

export const PUBLIC_PLAYLIST_DIRECTORIES = [
  {
    id: 'iptv-org-country-global',
    title: 'iptv-org: Enlace Original Completo por Países (index.country.m3u)',
    description: 'La base de datos original completa con más de 11.000 señales de televisión organizadas por cada país.',
    url: 'https://iptv-org.github.io/iptv/index.country.m3u',
    channelCount: '11.000+ canales',
    category: '⚡ Todo de Golpe (Oficial)',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-master-original',
    title: 'iptv-org: Enlace Original Maestro por Género (index.m3u)',
    description: 'El archivo M3U original de iptv-org con todos los canales abiertos del mundo agrupados por categorías.',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    channelCount: '11.000+ canales',
    category: '🌐 Maestro Original',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-ar',
    title: 'iptv-org: Argentina (TV Pública & Abiertos)',
    description: 'Emisiones públicas y canales abiertos de Argentina (Telefe, América, C5N, TVP, etc.).',
    url: 'https://iptv-org.github.io/iptv/countries/ar.m3u',
    channelCount: '~120 canales',
    category: 'País: 🇦🇷 Argentina',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-es',
    title: 'iptv-org: España (TDT & Canales Abiertos)',
    description: 'Lista comunitaria de código abierto con emisiones legales y gratuitas de España.',
    url: 'https://iptv-org.github.io/iptv/countries/es.m3u',
    channelCount: '~120 canales',
    category: 'País: 🇪🇸 España',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-mx',
    title: 'iptv-org: México (Públicos & Regionales)',
    description: 'Canales educativos, gubernamentales, legislativos y abiertos de México.',
    url: 'https://iptv-org.github.io/iptv/countries/mx.m3u',
    channelCount: '~70 canales',
    category: 'País: 🇲🇽 México',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-co',
    title: 'iptv-org: Colombia (Señal Colombia & Regionales)',
    description: 'Canales nacionales abiertos y regionales de Colombia.',
    url: 'https://iptv-org.github.io/iptv/countries/co.m3u',
    channelCount: '~45 canales',
    category: 'País: Colombia',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-news',
    title: 'iptv-org: Noticias Mundiales (News Global)',
    description: 'Recopilación mundial de canales de noticias 24/7 en español, inglés y francés.',
    url: 'https://iptv-org.github.io/iptv/categories/news.m3u',
    channelCount: '~350 canales',
    category: 'Género: Noticias',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-sports',
    title: 'iptv-org: Deportes Abiertos (Sports & Extreme)',
    description: 'Emisiones de deportes de motor, ciclismo, atletismo y ligas abiertas.',
    url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
    channelCount: '~140 canales',
    category: 'Género: Deportes',
    source: 'github.com/iptv-org/iptv'
  },
  {
    id: 'iptv-org-music',
    title: 'iptv-org: Música & Conciertos en Vivo',
    description: 'Emisoras de videoclips musicales, festivales en vivo y canales temáticos.',
    url: 'https://iptv-org.github.io/iptv/categories/music.m3u',
    channelCount: '~210 canales',
    category: 'Género: Música',
    source: 'github.com/iptv-org/iptv'
  }
];

export const SPEED_PRESETS = {
  'ultra-fast': {
    name: 'Ultra Rápido (Baja Latencia)',
    description: 'Ideal para deportes y directos. El búfer es mínimo (~4s), zapping instantáneo de canales.',
    config: {
      lowLatencyMode: true,
      maxBufferLength: 4,
      maxMaxBufferLength: 8,
      liveSyncDurationCount: 2,
      liveMaxLatencyDurationCount: 4,
      enableWorker: true,
      backBufferLength: 0,
      preset: 'ultra-fast' as const
    }
  },
  'balanced': {
    name: 'Equilibrado (Recomendado)',
    description: 'Excelente equilibrio: respuesta ágil de arranque con 10s de búfer para evitar parpadeos.',
    config: {
      lowLatencyMode: false,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 7,
      enableWorker: true,
      backBufferLength: 30,
      preset: 'balanced' as const
    }
  },
  'anti-buffering': {
    name: 'Buffer Seguro (Anti-cortes)',
    description: 'Diseñado para conexiones móviles o Wi-Fi inestables. Almacena 25s de vídeo para cero cortes.',
    config: {
      lowLatencyMode: false,
      maxBufferLength: 25,
      maxMaxBufferLength: 45,
      liveSyncDurationCount: 5,
      liveMaxLatencyDurationCount: 15,
      enableWorker: true,
      backBufferLength: 60,
      preset: 'anti-buffering' as const
    }
  }
};
