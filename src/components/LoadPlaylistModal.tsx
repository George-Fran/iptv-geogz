import React, { useState } from 'react';
import { X, Link, FileText, Upload, AlertCircle, CheckCircle2, RefreshCw, Zap, Globe, Sparkles } from 'lucide-react';
import { parseM3U, fetchPlaylistFromUrl } from '../utils/m3uParser';
import { Channel } from '../types/iptv';

interface LoadPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadChannels: (channels: Channel[], playlistName: string) => void;
}

export const LoadPlaylistModal: React.FC<LoadPlaylistModalProps> = ({
  isOpen,
  onClose,
  onLoadChannels
}) => {
  const [tab, setTab] = useState<'url' | 'text' | 'file'>('url');
  const [urlInput, setUrlInput] = useState<string>('https://iptv-org.github.io/iptv/index.country.m3u');
  const [textInput, setTextInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Immediate 1-click loader for the full master playlist
  const handleLoadAllAtOnce = async (
    targetUrl: string = 'https://iptv-org.github.io/iptv/index.country.m3u',
    listTitle: string = 'iptv-org (Lista Original Mundial - 11.000+ Canales)'
  ) => {
    setIsLoading(true);
    setLoadingStatus('Descargando lista original de 11.000+ canales mundiales...');
    setErrorMsg('');

    try {
      const channels = await fetchPlaylistFromUrl(targetUrl);
      if (channels.length === 0) {
        throw new Error('La lista no contiene canales válidos (#EXTINF o URLs de vídeo).');
      }
      onLoadChannels(channels, listTitle);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al descargar la lista completa.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setLoadingStatus('Descargando y analizando lista M3U...');
    setErrorMsg('');

    try {
      const channels = await fetchPlaylistFromUrl(urlInput.trim());
      if (channels.length === 0) {
        throw new Error('La lista no contiene canales válidos (#EXTINF o URLs de vídeo).');
      }
      const title = urlInput.includes('index.country.m3u')
        ? 'iptv-org (Mundial por Países)'
        : urlInput.includes('index.m3u')
        ? 'iptv-org (Mundial Original)'
        : 'Lista Remota';
      onLoadChannels(channels, title);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la URL M3U.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    try {
      const channels = parseM3U(textInput.trim());
      if (channels.length === 0) {
        throw new Error('No se detectaron canales en el texto pegado. Asegúrate de incluir líneas #EXTINF o enlaces directos.');
      }
      onLoadChannels(channels, 'Lista Personalizada');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al analizar el contenido M3U.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const channels = parseM3U(content);
        if (channels.length === 0) {
          throw new Error('El archivo seleccionado no contiene canales válidos.');
        }
        onLoadChannels(channels, file.name.replace(/\.[^/.]+$/, ''));
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al leer el archivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Cargar Lista IPTV (M3U / M3U8)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Añade canales desde una URL, archivo o texto plano</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50">
          <button
            onClick={() => { setTab('url'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
              tab === 'url' ? 'border-cyan-400 text-cyan-400 bg-neutral-900/50' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>URL Remota</span>
          </button>
          <button
            onClick={() => { setTab('text'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
              tab === 'text' ? 'border-cyan-400 text-cyan-400 bg-neutral-900/50' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pegar Texto M3U</span>
          </button>
          <button
            onClick={() => { setTab('file'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
              tab === 'file' ? 'border-cyan-400 text-cyan-400 bg-neutral-900/50' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4">
              {/* SPECIAL 1-CLICK ACTION: SUBIR TODOS DE GOLPE */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-neutral-900 border border-cyan-500/40 shadow-xl shadow-cyan-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                      <span>Enlace Original Completo iptv-org</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                      11.000+ Canales
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Descarga con 1 solo clic la base de datos oficial completa con todos los países filtrables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLoadAllAtOnce('https://iptv-org.github.io/iptv/index.country.m3u', 'iptv-org (Lista Original Mundial - 11.000+ Canales)')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-neutral-950 text-xs font-bold rounded-lg shadow-md hover:shadow-cyan-400/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cargando...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Subir Todos de Golpe</span>
                    </>
                  )}
                </button>
              </div>

              {/* URL Form */}
              <form onSubmit={handleUrlSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    URL de la Lista M3U / M3U8 o canal directo
                  </label>
                  <input
                    type="url"
                    placeholder="https://iptv-org.github.io/iptv/index.country.m3u"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    Soporta enlaces directos de iptv-org, TDTChannels o cualquier servidor HLS público.
                  </span>

                  {/* Quick Official Presets */}
                  <div className="pt-3">
                    <span className="block text-[11px] font-semibold text-neutral-300 mb-2">
                      Listas Oficiales de iptv-org (1 Clic para seleccionar o cargar):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { 
                          label: '⚡ Subir Todos de Golpe (11k)', 
                          url: 'https://iptv-org.github.io/iptv/index.country.m3u',
                          isPrimary: true
                        },
                        { 
                          label: '🗺️ Enlace Original por Países (index.country.m3u)', 
                          url: 'https://iptv-org.github.io/iptv/index.country.m3u',
                          isSpecial: true
                        },
                        { 
                          label: '🌐 Enlace Original por Categorías (index.m3u)', 
                          url: 'https://iptv-org.github.io/iptv/index.m3u',
                          isSpecial: true
                        },
                        { label: '🇦🇷 Argentina', url: 'https://iptv-org.github.io/iptv/countries/ar.m3u' },
                        { label: '🇪🇸 España', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' },
                        { label: '🇲🇽 México', url: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
                        { label: '🇨🇴 Colombia', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
                        { label: '🇨🇱 Chile', url: 'https://iptv-org.github.io/iptv/countries/cl.m3u' },
                        { label: '🇵🇪 Perú', url: 'https://iptv-org.github.io/iptv/countries/pe.m3u' },
                        { label: '🇺🇸 Estados Unidos', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
                        { label: '📰 Noticias Globales', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
                        { label: '⚽ Deportes Globales', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
                        { label: '🎵 Música Global', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' }
                      ].map(p => {
                        const isCurrent = urlInput === p.url;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setUrlInput(p.url);
                              if (p.isPrimary) {
                                handleLoadAllAtOnce(p.url);
                              }
                            }}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all cursor-pointer ${
                              p.isPrimary 
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 font-bold'
                                : isCurrent 
                                ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-bold shadow-sm' 
                                : p.isSpecial
                                ? 'bg-neutral-900 text-cyan-300 border-cyan-900 hover:border-cyan-700'
                                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {loadingStatus && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex items-center gap-2 text-xs text-cyan-300">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>{loadingStatus}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Cargando lista...</span>
                      </>
                    ) : (
                      <span>Cargar Canales</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Pega el contenido sin formato del archivo M3U
                </label>
                <textarea
                  rows={6}
                  placeholder={`#EXTM3U\n#EXTINF:-1 tvg-logo="https://..." group-title="Noticias",Mi Canal\nhttps://servidor.com/stream.m3u8`}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-white placeholder-neutral-600 outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Importar Canales
                </button>
              </div>
            </form>
          )}

          {tab === 'file' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-neutral-800 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-950/50 group">
                <Upload className="w-8 h-8 text-neutral-500 group-hover:text-cyan-400 transition-colors mb-2" />
                <span className="text-xs font-medium text-white mb-1">
                  Selecciona tu archivo .m3u o .m3u8
                </span>
                <span className="text-[11px] text-neutral-500">
                  Archivos locales de hasta 10 MB
                </span>
                <input
                  type="file"
                  accept=".m3u,.m3u8,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
