import { Channel } from '../types/iptv';

// ISO 2-letter Country mapping to clean Spanish names & flags
export const COUNTRY_MAP: Record<string, string> = {
  AR: 'Argentina',
  ES: 'España',
  MX: 'México',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Perú',
  VE: 'Venezuela',
  EC: 'Ecuador',
  UY: 'Uruguay',
  PY: 'Paraguay',
  BO: 'Bolivia',
  CR: 'Costa Rica',
  PA: 'Panamá',
  GT: 'Guatemala',
  DO: 'Rep. Dominicana',
  PR: 'Puerto Rico',
  HN: 'Honduras',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  CU: 'Cuba',
  US: 'Estados Unidos',
  USA: 'Estados Unidos',
  GB: 'Reino Unido',
  UK: 'Reino Unido',
  FR: 'Francia',
  DE: 'Alemania',
  IT: 'Italia',
  BR: 'Brasil',
  PT: 'Portugal',
  CA: 'Canadá',
  JP: 'Japón',
  KR: 'Corea del Sur',
  CN: 'China',
  RU: 'Rusia',
  NL: 'Países Bajos',
  BE: 'Bélgica',
  CH: 'Suiza',
  AT: 'Austria',
  SE: 'Suecia',
  NO: 'Noruega',
  DK: 'Dinamarca',
  FI: 'Finlandia',
  PL: 'Polonia',
  TR: 'Turquía',
  GR: 'Grecia',
  AU: 'Australia',
  NZ: 'Nueva Zelanda',
  IE: 'Irlanda',
  IN: 'India',
  ID: 'Indonesia',
  PH: 'Filipinas',
  TH: 'Tailandia',
  VN: 'Vietnam',
  SG: 'Singapur',
  MY: 'Malasia',
  ZA: 'Sudáfrica',
  EG: 'Egipto',
  MA: 'Marruecos',
  SA: 'Arabia Saudita',
  AE: 'Emiratos Árabes',
  IL: 'Israel',
  UA: 'Ucrania',
  CZ: 'República Checa',
  RO: 'Rumania',
  HU: 'Hungría',
  BG: 'Bulgaria',
  HR: 'Croacia',
  RS: 'Serbia',
  SK: 'Eslovaquia',
  SI: 'Eslovenia',
  INT: 'Internacional'
};

// Recognized country full names in English and Spanish to standard Spanish
export const COUNTRY_NAMES_MAP: Record<string, string> = {
  'argentina': 'Argentina',
  'spain': 'España',
  'espana': 'España',
  'españa': 'España',
  'mexico': 'México',
  'méxico': 'México',
  'colombia': 'Colombia',
  'chile': 'Chile',
  'peru': 'Perú',
  'perú': 'Perú',
  'venezuela': 'Venezuela',
  'ecuador': 'Ecuador',
  'uruguay': 'Uruguay',
  'paraguay': 'Paraguay',
  'bolivia': 'Bolivia',
  'united states': 'Estados Unidos',
  'united states of america': 'Estados Unidos',
  'usa': 'Estados Unidos',
  'eeuu': 'Estados Unidos',
  'united kingdom': 'Reino Unido',
  'uk': 'Reino Unido',
  'great britain': 'Reino Unido',
  'england': 'Reino Unido',
  'france': 'Francia',
  'francia': 'Francia',
  'germany': 'Alemania',
  'alemania': 'Alemania',
  'italy': 'Italia',
  'italia': 'Italia',
  'brazil': 'Brasil',
  'brasil': 'Brasil',
  'portugal': 'Portugal',
  'canada': 'Canadá',
  'canadá': 'Canadá',
  'costa rica': 'Costa Rica',
  'panama': 'Panamá',
  'panamá': 'Panamá',
  'guatemala': 'Guatemala',
  'honduras': 'Honduras',
  'el salvador': 'El Salvador',
  'nicaragua': 'Nicaragua',
  'dominican republic': 'Rep. Dominicana',
  'republica dominicana': 'Rep. Dominicana',
  'rep. dominicana': 'Rep. Dominicana',
  'puerto rico': 'Puerto Rico',
  'cuba': 'Cuba',
  'japan': 'Japón',
  'japon': 'Japón',
  'china': 'China',
  'russia': 'Rusia',
  'rusia': 'Rusia',
  'korea': 'Corea del Sur',
  'south korea': 'Corea del Sur',
  'north korea': 'Corea del Norte',
  'netherlands': 'Países Bajos',
  'paises bajos': 'Países Bajos',
  'belgium': 'Bélgica',
  'belgica': 'Bélgica',
  'switzerland': 'Suiza',
  'suiza': 'Suiza',
  'austria': 'Austria',
  'sweden': 'Suecia',
  'suecia': 'Suecia',
  'norway': 'Noruega',
  'noruega': 'Noruega',
  'denmark': 'Dinamarca',
  'finland': 'Finlandia',
  'finlandia': 'Finlandia',
  'poland': 'Polonia',
  'polonia': 'Polonia',
  'czech republic': 'República Checa',
  'czechia': 'República Checa',
  'hungary': 'Hungría',
  'hungria': 'Hungría',
  'romania': 'Rumania',
  'bulgaria': 'Bulgaria',
  'croatia': 'Croacia',
  'serbia': 'Serbia',
  'slovakia': 'Eslovaquia',
  'slovenia': 'Eslovenia',
  'ireland': 'Irlanda',
  'australia': 'Australia',
  'new zealand': 'Nueva Zelanda',
  'india': 'India',
  'turkey': 'Turquía',
  'turquia': 'Turquía',
  'greece': 'Grecia',
  'egypt': 'Egipto',
  'morocco': 'Marruecos',
  'south africa': 'Sudáfrica',
  'saudi arabia': 'Arabia Saudita',
  'israel': 'Israel',
  'ukraine': 'Ucrania',
  'international': 'Internacional',
  'global': 'Global'
};

// Normalizes English category names into friendly Spanish categories
export function normalizeCategory(rawGroup: string): string {
  if (!rawGroup) return 'General';
  const first = rawGroup.split(';')[0].trim();
  const lower = first.toLowerCase();

  // If group-title is actually a country, return General for category
  if (COUNTRY_NAMES_MAP[lower]) {
    return 'General';
  }

  if (lower.includes('music') || lower.includes('musica')) return 'Música';
  if (lower.includes('news') || lower.includes('noticia')) return 'Noticias';
  if (lower.includes('sport') || lower.includes('deporte')) return 'Deportes';
  if (lower.includes('movie') || lower.includes('cine') || lower.includes('film')) return 'Cine & Películas';
  if (lower.includes('entertain') || lower.includes('entretenimiento')) return 'Entretenimiento';
  if (lower.includes('kid') || lower.includes('child') || lower.includes('infantil') || lower.includes('family')) return 'Infantil & Familia';
  if (lower.includes('animat') || lower.includes('anime')) return 'Animación';
  if (lower.includes('docu')) return 'Documentales';
  if (lower.includes('culture') || lower.includes('cultura') || lower.includes('educat')) return 'Cultura & Educación';
  if (lower.includes('sci') || lower.includes('ciencia') || lower.includes('tech')) return 'Ciencia & Tecnología';
  if (lower.includes('relig') || lower.includes('reli')) return 'Religión';
  if (lower.includes('life') || lower.includes('estilo')) return 'Estilo de Vida';
  if (lower.includes('outdoor') || lower.includes('naturaleza')) return 'Naturaleza & Aventura';
  if (lower.includes('series') || lower.includes('show')) return 'Series';
  if (lower.includes('comedy') || lower.includes('comedia')) return 'Comedia';
  if (lower.includes('travel') || lower.includes('viaje')) return 'Viajes';
  if (lower.includes('auto') || lower.includes('motor')) return 'Motor';
  if (lower.includes('business') || lower.includes('finance') || lower.includes('economia')) return 'Economía';
  if (lower.includes('weather') || lower.includes('tiempo')) return 'Meteorología';
  if (lower.includes('classic')) return 'Clásicos';
  if (lower.includes('test')) return 'Test & Calidad';

  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function parseM3U(content: string, playlistSourceUrl?: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];

  // Determine if this playlist is organized by country (e.g. index.country.m3u or countries/ar.m3u)
  const isCountryPlaylist = playlistSourceUrl 
    ? (playlistSourceUrl.includes('index.country.m3u') || playlistSourceUrl.includes('/countries/')) 
    : false;

  let fallbackCountryFromUrl: string | null = null;
  if (playlistSourceUrl) {
    const countryUrlMatch = playlistSourceUrl.match(/\/countries\/([a-z]{2})\.m3u/i);
    if (countryUrlMatch && countryUrlMatch[1]) {
      fallbackCountryFromUrl = COUNTRY_MAP[countryUrlMatch[1].toUpperCase()] || null;
    }
  }

  let currentChannel: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {
        id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
        name: 'Canal sin nombre',
        group: 'General',
        country: fallbackCountryFromUrl || 'Global',
        isCustom: true
      };

      // 1. Extract Logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      if (logoMatch && logoMatch[1]) {
        currentChannel.logo = logoMatch[1];
      }

      // 2. Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      if (groupMatch && groupMatch[1]) {
        const rawGroup = groupMatch[1].trim();
        const rawGroupLower = rawGroup.toLowerCase();

        if (isCountryPlaylist) {
          // If it's a country playlist like index.country.m3u, group-title IS the country
          currentChannel.country = COUNTRY_NAMES_MAP[rawGroupLower] || rawGroup;
          currentChannel.group = 'General';
        } else if (COUNTRY_NAMES_MAP[rawGroupLower]) {
          currentChannel.country = COUNTRY_NAMES_MAP[rawGroupLower];
          currentChannel.group = 'General';
        } else {
          currentChannel.group = normalizeCategory(rawGroup);
        }
      }

      // 3. Extract tvg-country (e.g. tvg-country="AR" or tvg-country="ar;es")
      const countryMatch = line.match(/tvg-country="([^"]*)"/i);
      if (countryMatch && countryMatch[1]) {
        const rawCodes = countryMatch[1].split(/[;,]/);
        for (const item of rawCodes) {
          const code = item.toUpperCase().trim();
          if (COUNTRY_MAP[code]) {
            currentChannel.country = COUNTRY_MAP[code];
            break;
          } else if (COUNTRY_NAMES_MAP[item.toLowerCase().trim()]) {
            currentChannel.country = COUNTRY_NAMES_MAP[item.toLowerCase().trim()];
            break;
          }
        }
      }

      // 4. Extract tvg-id (e.g. "Telefe.ar" or "C5N.ar@SD" or "RTVE24h.es")
      const idMatch = line.match(/tvg-id="([^"]*)"/i);
      if (idMatch && idMatch[1]) {
        currentChannel.tvgId = idMatch[1];
        // If country not yet identified or still 'Global', inspect domain extension
        if (!currentChannel.country || currentChannel.country === 'Global') {
          const cleanId = idMatch[1].split('@')[0].split('#')[0];
          const dotMatch = cleanId.match(/\.([a-z]{2,3})$/i);
          if (dotMatch && dotMatch[1]) {
            const ext = dotMatch[1].toUpperCase();
            if (COUNTRY_MAP[ext]) {
              currentChannel.country = COUNTRY_MAP[ext];
            }
          }
        }
      }

      // 5. Extract tvg-language
      const langMatch = line.match(/tvg-language="([^"]*)"/i);
      if (langMatch && langMatch[1]) {
        currentChannel.language = langMatch[1];
      }

      // 6. Extract Channel Name
      const lastCommaIndex = line.lastIndexOf(',');
      if (lastCommaIndex !== -1) {
        const namePart = line.substring(lastCommaIndex + 1).trim();
        if (namePart) {
          currentChannel.name = namePart;
        }
      } else {
        const nameMatch = line.match(/tvg-name="([^"]*)"/i);
        if (nameMatch && nameMatch[1]) {
          currentChannel.name = nameMatch[1];
        }
      }

      // 7. If country is still Global, check name for parenthesis or bracket tags like (Argentina), [AR]
      if (currentChannel.country === 'Global' && currentChannel.name) {
        const tagMatch = currentChannel.name.match(/[\(\[]\s*([a-zA-Z\s]+)\s*[\)\]]/);
        if (tagMatch && tagMatch[1]) {
          const tag = tagMatch[1].trim();
          const tagUpper = tag.toUpperCase();
          const tagLower = tag.toLowerCase();
          if (COUNTRY_MAP[tagUpper]) {
            currentChannel.country = COUNTRY_MAP[tagUpper];
          } else if (COUNTRY_NAMES_MAP[tagLower]) {
            currentChannel.country = COUNTRY_NAMES_MAP[tagLower];
          }
        }
      }

    } else if (!line.startsWith('#') && (line.startsWith('http://') || line.startsWith('https://') || line.includes('.m3u8') || line.includes('.ts'))) {
      if (currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = null;
      } else {
        channels.push({
          id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
          name: `Transmisión ${channels.length + 1}`,
          url: line,
          group: 'General',
          country: fallbackCountryFromUrl || 'Global',
          isCustom: true
        });
      }
    }
  }

  return channels;
}

export async function fetchPlaylistFromUrl(url: string): Promise<Channel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const text = await response.text();
    return parseM3U(text, url);
  } catch (err) {
    console.warn('Direct fetch failed (likely CORS), attempting via proxy...', err);
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl);
      if (!proxyResponse.ok) {
        throw new Error(`Proxy error HTTP: ${proxyResponse.status}`);
      }
      const proxyText = await proxyResponse.text();
      return parseM3U(proxyText, url);
    } catch (proxyErr) {
      throw new Error('No se pudo descargar la lista M3U. Puede deberse a restricciones de red o CORS del proveedor. Puedes copiar y pegar el contenido M3U directamente en la pestaña "Texto M3U".');
    }
  }
}
