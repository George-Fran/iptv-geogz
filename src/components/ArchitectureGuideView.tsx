import React, { useState } from 'react';
import { 
  Code2, Copy, Check, Layers, Cpu, Smartphone, Monitor, 
  Terminal, Server, FileText, CheckCircle2, ArrowRight 
} from 'lucide-react';

export const ArchitectureGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'react' | 'vanilla' | 'proxy' | 'parser'>('react');
  const [copied, setCopied] = useState<boolean>(false);

  const codeSnippets = {
    react: `// PlayerIPTV.tsx - Componente React + HLS.js Optimizado
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface PlayerProps {
  streamUrl: string; // URL del .m3u8
}

export const PlayerIPTV: React.FC<PlayerProps> = ({ streamUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,          // Desmultiplexa en Web Worker fuera del hilo principal
        lowLatencyMode: true,        // Activa Low-Latency HLS (LL-HLS)
        maxBufferLength: 5,          // 5 segundos de búfer para zapping veloz
        liveSyncDurationCount: 2,    // 2 segmentos detrás del directo
        capLevelToPlayerSize: true,  // Adapta resolución al tamaño de pantalla para ahorrar ancho de banda
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.warn);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Soporte nativo en Safari iOS y macOS
      video.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '960px', aspectRatio: '16/9' }}>
      <video
        ref={videoRef}
        controls
        playsInline
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
      />
    </div>
  );
};`,

    vanilla: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Reproductor IPTV Rápido</title>
  <!-- Incluir HLS.js desde CDN oficial -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    body { margin: 0; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
    .player-box { width: 90%; max-width: 800px; }
    video { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 8px; }
    .controls { margin-top: 10px; display: flex; gap: 10px; width: 100%; }
    input { flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #fff; }
    button { padding: 10px 18px; border-radius: 6px; border: none; background: #06b6d4; color: #000; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="player-box">
    <video id="videoPlayer" controls autoplay playsinline></video>
    <div class="controls">
      <input id="streamInput" value="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" placeholder="URL .m3u8" />
      <button onclick="playStream()">Reproducir</button>
    </div>
  </div>

  <script>
    let hls = null;
    const video = document.getElementById('videoPlayer');

    function playStream() {
      const url = document.getElementById('streamInput').value.trim();
      if (!url) return;

      if (hls) { hls.destroy(); }

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 4
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play();
      }
    }

    // Iniciar con la primera señal
    playStream();
  </script>
</body>
</html>`,

    proxy: `// proxy-server.js - Micro-proxy en Express para solucionar CORS y acelerar segmentos
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

// Habilitar CORS para tu reproductor
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Range, Content-Type');
  next();
});

// Endpoint proxy: /proxy?url=https://ejemplo.com/canal.m3u8
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Falta el parámetro url');

  try {
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Añadir cabecera de caché para segmentos .ts para que la CDN local responda en 10ms
    if (targetUrl.endsWith('.ts')) {
      res.setHeader('Cache-Control', 'public, max-age=60');
    } else {
      res.setHeader('Cache-Control', 'no-cache'); // Los manifiestos cambian constantemente
    }

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
    response.data.pipe(res);
  } catch (error) {
    res.status(502).json({ error: 'Fallo al conectar con la señal', details: error.message });
  }
});

app.listen(PORT, () => console.log(\`Proxy IPTV listo en http://localhost:\${PORT}/proxy\`));`,

    parser: `// parseM3U.ts - Algoritmo rápido para procesar listas M3U y M3U8
export interface ParsedChannel {
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
}

export function parseM3UPlaylist(rawContent: string): ParsedChannel[] {
  const lines = rawContent.split(/\\r?\\n/);
  const channels: ParsedChannel[] = [];
  let currentMeta: Partial<ParsedChannel> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#EXTINF:')) {
      currentMeta = {
        name: 'Canal',
        group: 'General'
      };

      // Extraer logotipo
      const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/i);
      if (logoMatch) currentMeta.logo = logoMatch[1];

      // Extraer categoría / grupo
      const groupMatch = trimmed.match(/group-title="([^"]*)"/i);
      if (groupMatch) currentMeta.group = groupMatch[1];

      // Extraer nombre (texto tras la última coma)
      const lastComma = trimmed.lastIndexOf(',');
      if (lastComma !== -1) {
        currentMeta.name = trimmed.substring(lastComma + 1).trim();
      }
    } else if (!trimmed.startsWith('#') && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
      if (currentMeta) {
        currentMeta.url = trimmed;
        channels.push(currentMeta as ParsedChannel);
        currentMeta = null;
      }
    }
  }

  return channels;
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-10">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
          Guía Técnica de Implementación
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ¿Cómo Crear Tu Propio Reproductor de IPTV desde Cero?
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Un reproductor IPTV se compone de 3 piezas clave: el motor decodificador de vídeo (HLS.js), el analizador de listas M3U y la guía de programación (EPG XMLTV). Aquí tienes la arquitectura y el código completo listo para producción.
        </p>
      </div>

      {/* Architecture Diagram Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-sm font-bold text-white">Parser de Listas M3U</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Descarga el archivo de texto <code className="text-cyan-300 font-mono">.m3u</code> o <code className="text-cyan-300 font-mono">.m3u8</code>, extrae las etiquetas <code className="text-cyan-300 font-mono">#EXTINF</code>, nombres de canal, logos y URLs de señal en vivo.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-sm font-bold text-white">Motor HLS.js + MSE</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Convierte flujos MPEG-TS y fragmentos de vídeo fMP4 en tiempo real para inyectarlos en la etiqueta HTML5 <code className="text-blue-300 font-mono">&lt;video&gt;</code> mediante MediaSource Extensions.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-sm font-bold text-white">Micro-Proxy de Caché</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Resuelve el bloqueo de CORS que muchos navegadores aplican y cachea los segmentos de 2 a 6 segundos para que el vídeo arranque de forma instantánea sin latencia.
          </p>
        </div>
      </div>

      {/* Interactive Code Generator Tabs */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Tab Selector Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('react')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'react'
                  ? 'bg-neutral-800 text-cyan-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              React + TypeScript (Hls.js)
            </button>
            <button
              onClick={() => setActiveTab('vanilla')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'vanilla'
                  ? 'bg-neutral-800 text-cyan-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              HTML5 Puro (Sin Framework)
            </button>
            <button
              onClick={() => setActiveTab('proxy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'proxy'
                  ? 'bg-neutral-800 text-cyan-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Node.js Express Proxy (Anti-CORS)
            </button>
            <button
              onClick={() => setActiveTab('parser')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'parser'
                  ? 'bg-neutral-800 text-cyan-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Parser M3U (TypeScript)
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado al portapapeles' : 'Copiar Código'}</span>
          </button>
        </div>

        {/* Code Container */}
        <div className="p-4 bg-neutral-950 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed text-neutral-300">
          <pre>{codeSnippets[activeTab]}</pre>
        </div>
      </div>

      {/* Target Platforms: Mobile, Web, Smart TV */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          ¿Cómo Llevar tu Reproductor a Smart TV y Dispositivos Móviles?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Monitor className="w-4 h-4" />
              <span>Smart TV (Samsung Tizen / LG webOS)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tanto Samsung Tizen como LG webOS ejecutan aplicaciones basadas en la web (HTML5 + JS). Puedes empaquetar exactamente esta misma aplicación web usando el SDK de Tizen Studio o webOS CLI para publicarla o instalarla en modo desarrollador en tu televisor.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>Android TV / Fire TV Stick</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              En Android TV, puedes usar <strong>React Native</strong> con la librería <code className="text-cyan-300 font-mono">react-native-video</code> (que usa <strong>ExoPlayer</strong> por debajo). ExoPlayer es el estándar de Google y ofrece decodificación por hardware con soporte nativo de mando a distancia D-Pad.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>Guía EPG XMLTV (Programación)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Para mostrar la guía con el horario de qué programa se está emitiendo ahora y qué viene después, descarga un archivo <code className="text-cyan-300 font-mono">.xml</code> con formato XMLTV (como los provistos por iptv-org/epg) y vincúlalo mediante el atributo <code className="text-cyan-300 font-mono">tvg-id</code> del canal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
