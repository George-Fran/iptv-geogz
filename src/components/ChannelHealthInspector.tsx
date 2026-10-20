import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  RefreshCw, Download, Play, Filter, Activity, Zap 
} from 'lucide-react';
import { Channel } from '../types/iptv';

interface ChannelHealthInspectorProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onSwitchToPlayer: () => void;
}

interface ProbeResult {
  channelId: string;
  status: 'online' | 'slow' | 'offline';
  pingMs: number;
  httpStatus?: number;
  error?: string;
}

export const ChannelHealthInspector: React.FC<ChannelHealthInspectorProps> = ({
  channels,
  onSelectChannel,
  onSwitchToPlayer
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, ProbeResult>>({});
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanLimit, setScanLimit] = useState<number>(50);
  const [visibleResultsCount, setVisibleResultsCount] = useState<number>(40);

  // Probe single channel
  const probeChannel = async (channel: Channel): Promise<ProbeResult> => {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(channel.url, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        return {
          channelId: channel.id,
          status: elapsed > 650 ? 'slow' : 'online',
          pingMs: elapsed,
          httpStatus: res.status
        };
      } else {
        return {
          channelId: channel.id,
          status: 'offline',
          pingMs: elapsed,
          httpStatus: res.status,
          error: `HTTP ${res.status}`
        };
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      return {
        channelId: channel.id,
        status: 'offline',
        pingMs: elapsed,
        error: err.name === 'AbortError' ? 'Tiempo de espera agotado (>4s)' : 'Bloqueo CORS o Servidor Desconectado'
      };
    }
  };

  // Run batch scan
  const startBatchScan = async () => {
    setIsScanning(true);
    setResults({});
    setScanProgress(0);

    const newResults: Record<string, ProbeResult> = {};
    const targetChannels = scanLimit === -1 ? channels : channels.slice(0, scanLimit);
    const total = targetChannels.length;

    // Scan in chunks of 3 concurrent requests to avoid overwhelming network
    for (let i = 0; i < targetChannels.length; i += 3) {
      const chunk = targetChannels.slice(i, i + 3);
      const chunkResults = await Promise.all(chunk.map(c => probeChannel(c)));
      chunkResults.forEach(r => {
        newResults[r.channelId] = r;
      });
      setResults({ ...newResults });
      setScanProgress(Math.round(((i + chunk.length) / total) * 100));
    }

    setIsScanning(false);
  };

  // Calculate statistics
  const scannedCount = Object.keys(results).length;
  const onlineCount = Object.values(results).filter(r => r.status === 'online' || r.status === 'slow').length;
  const offlineCount = Object.values(results).filter(r => r.status === 'offline').length;
  const onlinePercentage = scannedCount > 0 ? Math.round((onlineCount / scannedCount) * 100) : 0;

  // Filter channels
  const displayedChannels = channels.filter(c => {
    const res = results[c.id];
    if (filter === 'online') return res && (res.status === 'online' || res.status === 'slow');
    if (filter === 'offline') return res && res.status === 'offline';
    return true;
  });

  // Export clean M3U
  const handleExportCleanM3U = () => {
    const workingChannels = channels.filter(c => {
      const r = results[c.id];
      return r && (r.status === 'online' || r.status === 'slow');
    });

    if (workingChannels.length === 0) {
      alert('Primero inicia el escaneo para verificar qué canales están activos.');
      return;
    }

    let m3uContent = '#EXTM3U\n';
    workingChannels.forEach(c => {
      m3uContent += `#EXTINF:-1 tvg-id="${c.tvgId || ''}" tvg-logo="${c.logo || ''}" group-title="${c.group || 'General'}",${c.name}\n`;
      m3uContent += `${c.url}\n`;
    });

    const blob = new Blob([m3uContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista_iptv_depurada_${Date.now()}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
          Herramienta de Diagnóstico
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Inspector de Salud y Depurador de Listas M3U
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Prueba automáticamente todos los canales de tu lista para detectar señales caídas o con latencia excesiva. Filtra los canales que no funcionan y descarga una nueva lista M3U 100% limpia.
        </p>
      </div>

      {/* Control Banner & Metrics */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Diagnóstico de {channels.length} canales cargados
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Envía peticiones de verificación de cabeceras HTTP y mide el tiempo de respuesta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {channels.length > 50 && (
              <select
                value={scanLimit}
                disabled={isScanning}
                onChange={(e) => setScanLimit(parseInt(e.target.value))}
                className="bg-neutral-950 text-neutral-200 text-xs border border-neutral-800 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
              >
                <option value={50}>Muestra: primeros 50</option>
                <option value={100}>Muestra: primeros 100</option>
                <option value={250}>Muestra: primeros 250</option>
                <option value={-1}>Escanear todos ({channels.length})</option>
              </select>
            )}

            <button
              onClick={startBatchScan}
              disabled={isScanning}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-cyan-400/20"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Escaneando ({scanProgress}%)...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Iniciar Diagnóstico Completo</span>
                </>
              )}
            </button>

            {onlineCount > 0 && (
              <button
                onClick={handleExportCleanM3U}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors border border-neutral-700"
                title="Descargar lista con solo canales que funcionan"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar M3U Depurado ({onlineCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar during scan */}
        {isScanning && (
          <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}

        {/* Diagnostic KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-neutral-800/80">
          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-[11px] text-neutral-400">Canales Verificados</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {scannedCount} / {channels.length}
            </div>
          </div>

          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-[11px] text-neutral-400">En Línea & Rápidos</div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {onlineCount}
            </div>
          </div>

          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-[11px] text-neutral-400">Desconectados / Bloqueados</div>
            <div className="text-xl font-bold font-mono text-red-400 tabular-nums">
              {offlineCount}
            </div>
          </div>

          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-[11px] text-neutral-400">Tasa de Disponibilidad</div>
            <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
              {onlinePercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos ({channels.length})
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'online' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            En Línea ({onlineCount})
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'offline' ? 'bg-neutral-800 text-red-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Caídos ({offlineCount})
          </button>
        </div>
      </div>

      {/* Results Table / List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-neutral-800">
          {displayedChannels.slice(0, visibleResultsCount).map(channel => {
            const res = results[channel.id];

            return (
              <div
                key={channel.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center p-1 shrink-0">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Zap className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{channel.name}</h4>
                    <p className="text-xs text-neutral-400 truncate max-w-md font-mono text-[11px]">
                      {channel.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Status Indicator */}
                  <div>
                    {!res ? (
                      <span className="text-xs text-neutral-500 font-mono">Sin escanear</span>
                    ) : res.status === 'online' ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>En línea ({res.pingMs} ms)</span>
                      </div>
                    ) : res.status === 'slow' ? (
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Lento ({res.pingMs} ms)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                        <XCircle className="w-4 h-4" />
                        <span>Caído / CORS</span>
                      </div>
                    )}
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => {
                      onSelectChannel(channel);
                      onSwitchToPlayer();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors border border-neutral-700 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Reproducir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {visibleResultsCount < displayedChannels.length && (
          <div className="p-3 text-center border-t border-neutral-800 bg-neutral-950/40">
            <button
              onClick={() => setVisibleResultsCount(c => Math.min(c + 40, displayedChannels.length))}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-800 transition-colors"
            >
              Mostrar 40 canales más (viendo {Math.min(visibleResultsCount, displayedChannels.length)} de {displayedChannels.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
