import React, { useState } from 'react';
import { 
  Radio, Globe, Download, Play, CheckCircle2, AlertOctagon, 
  ExternalLink, Copy, Check, Tv, Sparkles, ShieldCheck, Flame, Zap, RefreshCw 
} from 'lucide-react';
import { PUBLIC_PLAYLIST_DIRECTORIES } from '../data/legalSources';
import { Channel } from '../types/iptv';

interface SourcesDirectoryViewProps {
  onLoadDirectoryPlaylist: (url: string, title: string) => Promise<void>;
  isLoadingPlaylist: boolean;
  onOpenLoadModal: () => void;
}

export const SourcesDirectoryView: React.FC<SourcesDirectoryViewProps> = ({
  onLoadDirectoryPlaylist,
  isLoadingPlaylist,
  onOpenLoadModal
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-10">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
          Guía de Fuentes Legales y Abiertas
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ¿De Dónde Sacar Listas y Flujos IPTV Seguros y Rápidos?
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Existen miles de transmisiones de televisión abierta que emiten legalmente en internet a través de servidores CDN ultrarrápidos (Akamai, Fastly, Cloudflare). Aquí tienes las mejores fuentes oficiales, cómo cargarlas con 1 clic y por qué evitar las listas piratas de pago.
        </p>
      </div>

      {/* Top Source Spotlight: iptv-org GitHub */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-cyan-500/30 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold text-cyan-400">
              <Globe className="w-3.5 h-3.5" />
              <span>La Fuente #1 a Nivel Mundial: GitHub iptv-org</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Más de 30.000 Canales Abiertos y Gratuitos de Todo el Mundo
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              El repositorio de código abierto <strong className="text-white">iptv-org/iptv</strong> es una gigantesca base de datos comunitaria que reúne exclusivamente señales que las cadenas de televisión emiten públicamente sin geobloqueo. Están organizadas por país, idioma y categoría.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onLoadDirectoryPlaylist('https://iptv-org.github.io/iptv/index.country.m3u', 'iptv-org (Lista Original Mundial - 11.000+ Canales)')}
              disabled={isLoadingPlaylist}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-neutral-950 text-xs font-bold rounded-lg transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoadingPlaylist ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cargando Canales...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Subir Todos de Golpe (11k)</span>
                </>
              )}
            </button>
            <a
              href="https://github.com/iptv-org/iptv"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors border border-neutral-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver en GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* 1-Click Curated Playlists Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Listas Comunitarias Listas para Cargar (1 Clic)</span>
          </h2>
          <span className="text-xs text-neutral-400">Se cargan directamente en tu reproductor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PUBLIC_PLAYLIST_DIRECTORIES.map((playlist) => {
            const isCopied = copiedId === playlist.id;

            return (
              <div
                key={playlist.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-400">{playlist.category}</span>
                    <span className="text-xs font-mono tabular-nums text-neutral-400">{playlist.channelCount}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                    {playlist.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    {playlist.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopy(playlist.url, playlist.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-800 transition-colors"
                    title="Copiar enlace M3U"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copiado' : 'Copiar URL'}</span>
                  </button>

                  <button
                    onClick={() => onLoadDirectoryPlaylist(playlist.url, playlist.title)}
                    disabled={isLoadingPlaylist}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Cargar en Vivo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories of Free & Legal IPTV Sources */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Las 4 Grandes Categorías de Fuentes IPTV Legales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Tv className="w-4 h-4" />
              <span>1. Emisiones TDT y Cadenas Públicas (Free-to-Air)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cadenas públicas como <strong>RTVE (España), BBC News, Deutsche Welle (Alemania), France 24, TV Pública Argentina, Canal Once México</strong> y canales autonómicos publican enlaces HLS directos sin coste para que cualquier ciudadano pueda verlos en streaming. Proyectos como <em>TDTChannels</em> recopilan estos enlaces de forma legal.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>2. Plataformas FAST (Free Ad-Supported TV)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Plataformas como <strong>Pluto TV, Samsung TV Plus, Rakuten TV, LG Channels y Plex TV</strong> transmiten cientos de canales temáticos (cine, series clásicas, documentales, música) de manera 100% gratuita y legal, financiados mediante anuncios breves. Existen herramientas comunitarias que indexan sus manifiestos M3U oficiales.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Globe className="w-4 h-4" />
              <span>3. Organismos Oficiales y Ciencia (NASA, ONU, Parlamentos)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              La <strong>NASA, el Parlamento Europeo, la ONU, el Senado de México</strong> y museos internacionales ofrecen transmisiones en directo 24 horas al día con cámaras de la Estación Espacial Internacional (ISS), sesiones legislativas y documentales científicos con calidad 1080p y 4K.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Flame className="w-4 h-4" />
              <span>4. Creadores y Eventos de Deportes Abiertos (Red Bull TV)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Plataformas como <strong>Red Bull TV</strong> emiten deportes extremos, ciclismo de montaña (UCI MTB), surf, skate y carreras de rallies sin coste alguno a través de su CDN global de Akamai, con una estabilidad superior a la de la televisión por cable tradicional.
            </p>
          </div>
        </div>
      </div>

      {/* Crucial Section: Why Pirate IPTV Lists Fail & Freeze */}
      <div className="bg-neutral-900 border border-red-500/30 rounded-xl p-6 lg:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-red-400 font-semibold text-sm">
          <AlertOctagon className="w-5 h-5" />
          <span>¿Por Qué las Listas Piratas de Pago se Cortan y se Congelan Constantemente?</span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Muchas personas compran suscripciones ilegales esperando ver canales de pago y descubren que durante partidos importantes la imagen se congela a cada segundo. Aquí está la explicación técnica:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-1.5">
            <div className="text-xs font-bold text-red-300">1. Servidores Saturados</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Los revendedores ilegales sobrecargan servidores baratos VPS con miles de conexiones simultáneas. Al llegar un evento masivo, el ancho de banda colapsa y la tasa de transferencia cae a cero.
            </p>
          </div>

          <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-1.5">
            <div className="text-xs font-bold text-red-300">2. Bloqueo Dinámico por ISP</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Los proveedores de internet (Movistar, Claro, Vodafone, Telmex) utilizan cortafuegos de inspección profunda de paquetes (DPI) para bloquear las direcciones IP de origen durante los directos.
            </p>
          </div>

          <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-1.5">
            <div className="text-xs font-bold text-red-300">3. Riesgo de Phishing y Fraude</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Los paneles de revendedores piratas recopilan direcciones IP de clientes, tarjetas y credenciales que frecuentemente terminan en bases de datos comprometidas o sufren clausuras judiciales sin aviso.
            </p>
          </div>
        </div>
      </div>

      {/* Anatomy of M3U format */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">
          Anatomía de una Lista M3U: ¿Cómo Interpretar el Formato?
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Una lista IPTV no es más que un archivo de texto plano con extensión <code className="text-cyan-300 font-mono">.m3u</code> o <code className="text-cyan-300 font-mono">.m3u8</code> estructurado de la siguiente forma:
        </p>

        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto">
          <span className="text-neutral-500"># Encabezado obligatorio</span><br/>
          <span className="text-cyan-400">#EXTM3U</span><br/><br/>
          <span className="text-neutral-500"># Metadatos del canal (ID, logotipo, categoría, nombre legible)</span><br/>
          <span className="text-amber-300">#EXTINF:-1</span> <span className="text-blue-300">tvg-id=</span><span className="text-green-300">"RTVE24H.es"</span> <span className="text-blue-300">tvg-logo=</span><span className="text-green-300">"https://logo.png"</span> <span className="text-blue-300">group-title=</span><span className="text-green-300">"Noticias"</span><span className="text-white">,Canal 24 Horas</span><br/>
          <span className="text-cyan-300">https://rtvelivestream.akamaized.net/rtvesec/24h/24h_main.m3u8</span>
        </div>
      </div>
    </div>
  );
};
