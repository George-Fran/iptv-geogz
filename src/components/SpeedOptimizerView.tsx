import React, { useState } from 'react';
import { 
  Zap, Cpu, Globe, Server, Activity, Sliders, CheckCircle2, 
  AlertCircle, ArrowRight, Play, RefreshCw, BarChart2, ShieldCheck 
} from 'lucide-react';
import { SpeedConfig } from '../types/iptv';
import { SPEED_PRESETS } from '../data/legalSources';

interface SpeedOptimizerViewProps {
  speedConfig: SpeedConfig;
  onUpdateSpeedConfig: (config: SpeedConfig) => void;
  onSwitchToPlayer: () => void;
}

export const SpeedOptimizerView: React.FC<SpeedOptimizerViewProps> = ({
  speedConfig,
  onUpdateSpeedConfig,
  onSwitchToPlayer
}) => {
  const [testUrl, setTestUrl] = useState<string>('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    pingMs: number;
    manifestSizeKb: number;
    downloadSpeedMbps: number;
    corsOk: boolean;
    rating: 'Óptimo' | 'Aceptable' | 'Lento' | 'Bloqueado';
    recommendation: string;
  } | null>(null);

  // Live Stream Benchmarking function
  const runStreamBenchmark = async () => {
    if (!testUrl) return;
    setIsTesting(true);
    setTestResult(null);

    const startTime = performance.now();
    try {
      const response = await fetch(testUrl, { method: 'GET', cache: 'no-store' });
      const pingMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const manifestSizeKb = Number((new Blob([text]).size / 1024).toFixed(1));

      // Calculate rating
      let rating: 'Óptimo' | 'Aceptable' | 'Lento' | 'Bloqueado' = 'Óptimo';
      let recommendation = 'La señal responde de forma instantánea. Ideal para modo Ultra Rápido (4s de búfer).';

      if (pingMs > 700) {
        rating = 'Lento';
        recommendation = 'Alta latencia de respuesta (>700ms). Te recomendamos configurar el búfer en modo "Anti-cortes (25s)" para evitar congelamientos.';
      } else if (pingMs > 300) {
        rating = 'Aceptable';
        recommendation = 'Latencia estándar. Funciona perfecto con el perfil "Equilibrado (10s)".';
      }

      // Download speed estimate
      const downloadSpeedMbps = Number(((manifestSizeKb * 8) / (pingMs / 1000) / 100).toFixed(1));

      setTestResult({
        pingMs,
        manifestSizeKb,
        downloadSpeedMbps: Math.max(12, downloadSpeedMbps),
        corsOk: true,
        rating,
        recommendation
      });
    } catch (err: any) {
      setTestResult({
        pingMs: Math.round(performance.now() - startTime),
        manifestSizeKb: 0,
        downloadSpeedMbps: 0,
        corsOk: false,
        rating: 'Bloqueado',
        recommendation: 'Error al conectar: El servidor no envía cabeceras CORS ("Access-Control-Allow-Origin") o la transmisión está caída. Para este tipo de señales se requiere un proxy inverso (Node.js/Cloudflare).'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-10">
      {/* Header Banner */}
      <div>
        <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
          Ingeniería de Rendimiento HLS
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ¿Cómo Hacer que tu Reproductor IPTV sea Ultra Rápido?
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          La diferencia entre un reproductor que tarda 6 segundos en abrir un canal y uno que cambia de señal en 300 milisegundos reside en 5 factores de arquitectura: sintonización de búferes, Web Workers, proxies perimetrales con CDN, y decodificación por hardware.
        </p>
      </div>

      {/* Speed Presets Selector */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Configuración Activa de HLS.js</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(Object.keys(SPEED_PRESETS) as Array<keyof typeof SPEED_PRESETS>).map((key) => {
            const item = SPEED_PRESETS[key];
            const isSelected = speedConfig.preset === key;
            return (
              <div
                key={key}
                onClick={() => onUpdateSpeedConfig(item.config)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{item.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {item.description}
                </p>
                <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800/80 pt-2 flex justify-between">
                  <span>Búfer máx: {item.config.maxBufferLength}s</span>
                  <span className="text-cyan-400">{item.config.lowLatencyMode ? 'LL-HLS On' : 'Standard'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Fine-Tuning Sliders */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200">Ajuste Fino de Parámetros de Motor</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
                <span>maxBufferLength (Segundos)</span>
                <span className="font-mono text-cyan-400 font-bold">{speedConfig.maxBufferLength}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={speedConfig.maxBufferLength}
                onChange={(e) => onUpdateSpeedConfig({
                  ...speedConfig,
                  maxBufferLength: parseInt(e.target.value)
                })}
                className="w-full h-1.5 bg-neutral-800 accent-cyan-400 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-neutral-400">Menor valor = zapping más rápido, pero más susceptible a micro-cortes.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
                <span>liveSyncDurationCount (Segmentos)</span>
                <span className="font-mono text-cyan-400 font-bold">{speedConfig.liveSyncDurationCount} segs</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={speedConfig.liveSyncDurationCount}
                onChange={(e) => onUpdateSpeedConfig({
                  ...speedConfig,
                  liveSyncDurationCount: parseInt(e.target.value)
                })}
                className="w-full h-1.5 bg-neutral-800 accent-cyan-400 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-neutral-400">Distancia de seguridad respecto al punto en vivo directo.</span>
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-xs text-neutral-300 mb-2">Web Worker Desmultiplexor</span>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={speedConfig.enableWorker}
                  onChange={(e) => onUpdateSpeedConfig({
                    ...speedConfig,
                    enableWorker: e.target.checked
                  })}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs text-neutral-300">
                  enableWorker (Hilo secundario sin trabas en UI)
                </span>
              </label>
              <span className="text-[11px] text-neutral-400 mt-1">Evita que decodificar vídeo congele botones o animaciones.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Speed & Latency Ping Benchmark Tool */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Test en Tiempo Real: Latencia y Conexión de Señal</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Prueba cualquier enlace de canal (.m3u8) para medir su tiempo de respuesta (TTFB) y compatibilidad.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Introduce la URL del flujo HLS (.m3u8)..."
            className="flex-1 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={runStreamBenchmark}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Medir Latencia</span>
              </>
            )}
          </button>
        </div>

        {/* Benchmark Results Display */}
        {testResult && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-neutral-800">
              <div>
                <span className="text-[11px] text-neutral-400">Latencia (Ping TTFB)</span>
                <div className={`text-xl font-bold font-mono tabular-nums ${
                  testResult.pingMs < 300 ? 'text-emerald-400' : testResult.pingMs < 700 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {testResult.pingMs} ms
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400">Diagnóstico CORS</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {testResult.corsOk ? (
                    <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Permitido
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Bloqueado
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400">Tamaño Manifiesto</span>
                <div className="text-xl font-bold font-mono tabular-nums text-white">
                  {testResult.manifestSizeKb} KB
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400">Calificación</span>
                <div className="text-sm font-bold text-cyan-400 mt-1 uppercase">
                  {testResult.rating}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
              <strong className="text-cyan-400 font-semibold">Consejo de optimización:</strong> {testResult.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* The 5 Speed Secrets Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Los 5 Secretos Técnicos para la Máxima Velocidad
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <span>1. Configurar Búferes Bajos al Cambiar de Canal</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Por defecto, los reproductores intentan precargar 30 o 60 segundos de vídeo antes de empezar a reproducir. Configurando <code className="text-cyan-300 font-mono">maxBufferLength: 4</code> y <code className="text-cyan-300 font-mono">liveSyncDurationCount: 2</code>, el reproductor arranca inmediatamente en el primer segmento de 2 segundos, reduciendo el retardo de zapping a menos de medio segundo.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <span>2. Desmultiplexado Fuera del Hilo Principal (Web Workers)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Un flujo HLS contiene paquetes de transporte MPEG-TS que deben convertirse en MP4 fragmentado (fMP4) en JavaScript. Al activar <code className="text-cyan-300 font-mono">enableWorker: true</code>, todo el cálculo matemático pesado se realiza en un hilo paralelo de la CPU sin congelar la interfaz de usuario ni saltar fotogramas.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <span>3. Usar un Proxy Inverso o CDN Perimetral (Edge Caching)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Si tu reproductor conecta directamente al servidor del canal, sufres la latencia de distancia y problemas de CORS. Implementar un micro-proxy en Cloudflare Workers o Express con cabeceras <code className="text-cyan-300 font-mono">Cache-Control: public, max-age=2</code> permite entregar segmentos desde el servidor más cercano al usuario.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>4. Códecs Compatibles con Aceleración por GPU (H.264 / AAC)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Los streams codificados en <strong>H.264 (AVC) Baseline / High Profile</strong> y audio <strong>AAC-LC</strong> utilizan la GPU del dispositivo del usuario directamente a través de MediaSource Extensions (MSE), consumiendo 5 veces menos batería y eliminando micro-parones.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-neutral-900 border border-cyan-800/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">¿Listo para probar estas configuraciones en vivo?</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Tus parámetros actuales están listos para ser ejecutados en el reproductor en tiempo real.</p>
        </div>
        <button
          onClick={onSwitchToPlayer}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-md shadow-cyan-400/20"
        >
          <span>Ir al Reproductor en Vivo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
