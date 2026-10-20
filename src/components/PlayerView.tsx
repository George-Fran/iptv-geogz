import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, Sliders, Zap, Search, Star, 
  Radio, AlertTriangle, PictureInPicture, Disc, Clock,
  SlidersHorizontal, ChevronRight, Download, Check,
  Globe, Folder, X, Filter
} from 'lucide-react';
import { Channel, SpeedConfig, StreamMetrics, VideoFilters } from '../types/iptv';
import { SPEED_PRESETS } from '../data/legalSources';
import { getEPGScheduleForChannel } from '../data/epgData';

interface PlayerViewProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  speedConfig: SpeedConfig;
  onUpdateSpeedConfig: (config: SpeedConfig) => void;
  onOpenLoadModal: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  speedConfig,
  onUpdateSpeedConfig,
  onOpenLoadModal
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Listo');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos');
  const [selectedCountry, setSelectedCountry] = useState<string>('Todos');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Video Enhancements
  const [videoFilters, setVideoFilters] = useState<VideoFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    aspectRatio: '16:9'
  });

  // Live DVR Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<any>(null);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('iptv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [metrics, setMetrics] = useState<StreamMetrics>({
    currentLevel: -1,
    levels: [],
    bitrateKbps: 0,
    bufferLengthSec: 0,
    latencySec: 0,
    fps: 0,
    droppedFrames: 0,
    loadedSegments: 0,
    audioTracks: [],
    currentAudioTrack: 0,
    live: true
  });

  // EPG for active channel
  const epgSchedule = selectedChannel ? getEPGScheduleForChannel(selectedChannel.id) : [];
  const currentProgram = epgSchedule[0];
  const nextProgram = epgSchedule[1];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('iptv_favorites', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Memoized categories with channel counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    channels.forEach(c => {
      const g = c.group || 'General';
      counts[g] = (counts[g] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return [
      { name: 'Todos', count: channels.length },
      ...sorted.map(([name, count]) => ({ name, count }))
    ];
  }, [channels]);

  // Memoized countries with channel counts
  const countriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    channels.forEach(c => {
      const country = c.country || 'Global';
      counts[country] = (counts[country] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return [
      { name: 'Todos', count: channels.length },
      ...sorted.map(([name, count]) => ({ name, count }))
    ];
  }, [channels]);

  // Top popular quick categories for single-click pills
  const popularCategories = useMemo(() => {
    const popularKeys = ['Música', 'Noticias', 'Deportes', 'Cine & Películas', 'Entretenimiento', 'Infantil & Familia', 'Documentales'];
    return popularKeys.filter(key => categoriesWithCounts.some(c => c.name === key && c.count > 0));
  }, [categoriesWithCounts]);

  // Memoized filtered channels so telemetry timer (every 800ms) does NOT re-filter 30,000 items
  const filteredChannels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return channels.filter(c => {
      // Favorite filter
      if (showOnlyFavorites && !favoriteIds.includes(c.id)) {
        return false;
      }
      // Group / Category filter
      const matchesGroup = selectedGroup === 'Todos' || (c.group || 'General') === selectedGroup;
      if (!matchesGroup) return false;
      // Country filter
      const matchesCountry = selectedCountry === 'Todos' || (c.country || 'Global') === selectedCountry;
      if (!matchesCountry) return false;
      // Search text query
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.group && c.group.toLowerCase().includes(q)) ||
        (c.language && c.language.toLowerCase().includes(q))
      );
    });
  }, [channels, selectedGroup, selectedCountry, showOnlyFavorites, favoriteIds, searchQuery]);

  // Virtual windowing: render in chunks of 50 to maintain 60 FPS even with 30,000 channels
  const [visibleCount, setVisibleCount] = useState<number>(50);

  useEffect(() => {
    setVisibleCount(50);
  }, [searchQuery, selectedGroup, selectedCountry, showOnlyFavorites, channels]);

  const handleChannelListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 250) {
      if (visibleCount < filteredChannels.length) {
        setVisibleCount(prev => Math.min(prev + 50, filteredChannels.length));
      }
    }
  };

  // Setup HLS Stream
  const initStream = useCallback((streamUrl: string) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setHasError(false);
    setErrorMessage('');
    setStatusMessage('Conectando a transmisión...');

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: speedConfig.enableWorker,
        lowLatencyMode: speedConfig.lowLatencyMode,
        maxBufferLength: speedConfig.maxBufferLength,
        maxMaxBufferLength: speedConfig.maxMaxBufferLength,
        liveSyncDurationCount: speedConfig.liveSyncDurationCount,
        liveMaxLatencyDurationCount: speedConfig.liveMaxLatencyDurationCount,
        backBufferLength: speedConfig.backBufferLength,
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: true,
        fragLoadingTimeOut: 12000,
        manifestLoadingTimeOut: 10000
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setStatusMessage('Manifiesto HLS cargado');
        const levels = data.levels.map((lvl, index) => ({
          height: lvl.height,
          width: lvl.width,
          bitrate: lvl.bitrate,
          name: lvl.height ? `${lvl.height}p` : `Nivel ${index + 1}`
        }));

        setMetrics(m => ({
          ...m,
          levels,
          currentLevel: hls.currentLevel
        }));

        video.play().catch(e => {
          console.warn('Reproducción automática prevenida por el navegador:', e);
          setStatusMessage('Haz clic en Reproducir');
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const currentLvl = hls.levels[data.level];
        if (currentLvl) {
          setMetrics(m => ({
            ...m,
            currentLevel: data.level,
            bitrateKbps: Math.round(currentLvl.bitrate / 1000)
          }));
        }
      });

      hls.on(Hls.Events.AUDIO_TRACK_LOADED, () => {
        if (hls.audioTracks) {
          setMetrics(m => ({
            ...m,
            audioTracks: hls.audioTracks.map((t, idx) => ({
              id: idx,
              name: t.name || `Pista ${idx + 1}`,
              lang: t.lang
            })),
            currentAudioTrack: hls.audioTrack
          }));
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setMetrics(m => ({
          ...m,
          loadedSegments: m.loadedSegments + 1
        }));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setHasError(true);
              setErrorMessage('Error de red o restricción CORS: el servidor de la señal no permite la conexión directa o está desconectado.');
              setStatusMessage('Fallo de red');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('Error de medios recuperable, intentando recuperar...');
              setStatusMessage('Recuperando códec...');
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setErrorMessage(`Error fatal no recuperable (${data.details}).`);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.warn);
      });
    } else {
      setHasError(true);
      setErrorMessage('Este navegador no soporta MediaSource Extensions ni reproducción HLS.');
    }
  }, [speedConfig]);

  // Monitor buffer & live latency
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      let bufferSec = 0;
      if (video.buffered.length > 0) {
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.buffered.start(i) <= video.currentTime && video.currentTime <= video.buffered.end(i)) {
            bufferSec = video.buffered.end(i) - video.currentTime;
            break;
          }
        }
      }

      let latency = 0;
      if (hlsRef.current && hlsRef.current.latency !== undefined) {
        latency = Math.max(0, hlsRef.current.latency);
      }

      const videoQuality = (video as any).getVideoPlaybackQuality ? (video as any).getVideoPlaybackQuality() : null;
      const dropped = videoQuality ? videoQuality.droppedVideoFrames : 0;

      setMetrics(m => ({
        ...m,
        bufferLengthSec: Number(bufferSec.toFixed(1)),
        latencySec: Number(latency.toFixed(1)),
        droppedFrames: dropped
      }));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Sleep Timer Countdown
  useEffect(() => {
    if (sleepSecondsLeft === null) return;

    if (sleepSecondsLeft <= 0) {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setSleepTimerMinutes(null);
      setSleepSecondsLeft(null);
      return;
    }

    const timer = setTimeout(() => {
      setSleepSecondsLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [sleepSecondsLeft]);

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepSecondsLeft(minutes ? minutes * 60 : null);
  };

  // Keyboard Shortcuts: Space, M, F, Arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in search or input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        // Next channel
        const currentIndex = channels.findIndex(c => c.id === selectedChannel?.id);
        if (currentIndex < channels.length - 1) {
          onSelectChannel(channels[currentIndex + 1]);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        // Prev channel
        const currentIndex = channels.findIndex(c => c.id === selectedChannel?.id);
        if (currentIndex > 0) {
          onSelectChannel(channels[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, channels, selectedChannel]);

  // Live Clip DVR Recording
  const startRecording = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Capture stream from video element
      const stream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
      if (!stream) {
        alert('La captura directa de señal no está soportada en este navegador.');
        return;
      }

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
          ? 'video/webm;codecs=vp9,opus' 
          : 'video/webm'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clip_${selectedChannel?.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start(1000); // 1s slice
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error al iniciar grabación:', err);
      alert('No se pudo iniciar la grabación del clip.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  // Trigger stream on selected channel change
  useEffect(() => {
    if (selectedChannel) {
      initStream(selectedChannel.url);
    }
  }, [selectedChannel, initStream]);

  // Handle Play / Pause
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Picture in picture
  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  // Change HLS Quality Level
  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setMetrics(m => ({ ...m, currentLevel: levelIndex }));
    }
  };

  // Change Speed Preset
  const handlePresetSelect = (presetKey: 'ultra-fast' | 'balanced' | 'anti-buffering') => {
    const newConfig = SPEED_PRESETS[presetKey].config;
    onUpdateSpeedConfig(newConfig);
    if (selectedChannel) {
      initStream(selectedChannel.url);
    }
  };

  // Compute CSS filter string
  const videoFilterStyle: React.CSSProperties = {
    filter: `brightness(${videoFilters.brightness}%) contrast(${videoFilters.contrast}%) saturate(${videoFilters.saturation}%)`,
    objectFit: videoFilters.aspectRatio === 'fill' ? 'cover' : 'contain',
    aspectRatio: videoFilters.aspectRatio === '4:3' ? '4/3' : '16/9'
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Left/Main Column: Video Player & Stream Telemetry */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Player Container */}
        <div 
          ref={containerRef}
          className="relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl group aspect-video flex items-center justify-center"
        >
          <video
            ref={videoRef}
            className="w-full h-full bg-black transition-all"
            style={videoFilterStyle}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Recording Badge */}
          {isRecording && (
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-xs font-mono font-bold animate-pulse shadow-lg shadow-red-600/30">
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
              <span>REC {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
            </div>
          )}

          {/* Sleep Timer Indicator */}
          {sleepSecondsLeft !== null && (
            <div className="absolute top-4 right-16 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/80 backdrop-blur border border-neutral-700 text-neutral-300 rounded-lg text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{Math.ceil(sleepSecondsLeft / 60)}m</span>
            </div>
          )}

          {/* Error Overlay */}
          {hasError && (
            <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">No se pudo reproducir este canal</h3>
              <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
                {errorMessage}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedChannel && initStream(selectedChannel.url)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-neutral-950 text-xs font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reintentar Conexión</span>
                </button>
                <button
                  onClick={() => {
                    const fallback = channels.find(c => c.id !== selectedChannel?.id);
                    if (fallback) onSelectChannel(fallback);
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors"
                >
                  Probar otro canal
                </button>
              </div>
            </div>
          )}

          {/* Top Info Bar inside Player */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div className="flex items-center gap-3">
              {selectedChannel?.logo && (
                <img 
                  src={selectedChannel.logo} 
                  alt={selectedChannel.name} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain rounded bg-neutral-800/80 p-0.5" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <div>
                <h2 className="text-sm font-semibold text-white drop-shadow">
                  {selectedChannel?.name || 'Selecciona un canal'}
                </h2>
                <div className="flex items-center gap-2 text-xs text-neutral-300 drop-shadow">
                  <span>{selectedChannel?.group || 'General'}</span>
                  <span>·</span>
                  <span>{selectedChannel?.country || 'Abierto'}</span>
                  {metrics.bitrateKbps > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-cyan-300">{metrics.bitrateKbps} kbps</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Video Enhancement Filters Button */}
              <button
                onClick={() => setShowFiltersModal(!showFiltersModal)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  showFiltersModal ? 'bg-cyan-500 text-neutral-950' : 'bg-black/60 text-neutral-300 hover:text-white'
                }`}
                title="Ajustes de imagen y relación de aspecto"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* HUD Diagnostics */}
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  showDiagnostics ? 'bg-cyan-500 text-neutral-950' : 'bg-black/60 text-neutral-300 hover:text-white'
                }`}
                title="Telemetría en tiempo real"
              >
                HUD
              </button>
            </div>
          </div>

          {/* Video Enhancements Drawer / Box */}
          {showFiltersModal && (
            <div className="absolute top-16 left-4 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl p-4 text-xs text-neutral-300 z-30 w-72 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white">Post-Procesado de Imagen</span>
                <button
                  onClick={() => setVideoFilters({ brightness: 100, contrast: 100, saturation: 100, aspectRatio: '16:9' })}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Restablecer
                </button>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Relación de Aspecto</span>
                  <span className="text-cyan-400 font-mono">{videoFilters.aspectRatio}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['16:9', '4:3', 'fill'] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setVideoFilters(f => ({ ...f, aspectRatio: ratio }))}
                      className={`py-1 rounded text-[11px] font-medium border ${
                        videoFilters.aspectRatio === ratio
                          ? 'bg-neutral-800 border-cyan-500 text-cyan-400'
                          : 'border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {ratio === 'fill' ? 'Rellenar' : ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Brillo</span>
                  <span className="font-mono text-cyan-400">{videoFilters.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={videoFilters.brightness}
                  onChange={(e) => setVideoFilters(f => ({ ...f, brightness: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-neutral-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Contraste</span>
                  <span className="font-mono text-cyan-400">{videoFilters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={videoFilters.contrast}
                  onChange={(e) => setVideoFilters(f => ({ ...f, contrast: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-neutral-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Saturación de Color</span>
                  <span className="font-mono text-cyan-400">{videoFilters.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={videoFilters.saturation}
                  onChange={(e) => setVideoFilters(f => ({ ...f, saturation: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-neutral-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Sleep timer selector */}
              <div className="border-t border-neutral-800 pt-3">
                <span className="block mb-1.5 font-semibold text-neutral-200">Temporizador de Apagado</span>
                <div className="grid grid-cols-4 gap-1">
                  {[15, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => handleSetSleepTimer(sleepTimerMinutes === mins ? null : mins)}
                      className={`py-1 rounded text-[11px] font-medium border ${
                        sleepTimerMinutes === mins
                          ? 'bg-cyan-500 text-neutral-950 font-bold border-cyan-400'
                          : 'border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Diagnostics Overlay HUD */}
          {showDiagnostics && (
            <div className="absolute top-16 right-4 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-300 z-20 w-64 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-neutral-400 font-sans font-semibold border-b border-neutral-800 pb-1.5">
                <span>Telemetría HLS</span>
                <span className="text-cyan-400 text-[10px]">TIEMPO REAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Búfer actual:</span>
                <span className="font-mono tabular-nums text-white">{metrics.bufferLengthSec}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Latencia en vivo:</span>
                <span className="font-mono tabular-nums text-white">{metrics.latencySec}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Bitrate actual:</span>
                <span className="font-mono tabular-nums text-cyan-400">{metrics.bitrateKbps} kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Segmentos cargados:</span>
                <span className="font-mono tabular-nums text-white">{metrics.loadedSegments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Cuadros caídos:</span>
                <span className="font-mono tabular-nums text-white">{metrics.droppedFrames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Web Worker:</span>
                <span className="text-emerald-400">{speedConfig.enableWorker ? 'Activo' : 'Desactivado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Baja Latencia:</span>
                <span className="text-amber-400">{speedConfig.lowLatencyMode ? 'Encendido' : 'Apagado'}</span>
              </div>
            </div>
          )}

          {/* Bottom Player Controls */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {/* Play/Pause & Reload & DVR Record */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleTogglePlay}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => selectedChannel && initStream(selectedChannel.url)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                title="Recargar señal en vivo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Live DVR Clip Recording Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isRecording 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white'
                }`}
                title={isRecording ? 'Detener y descargar clip grabado' : 'Grabar clip en directo (DVR)'}
              >
                <Disc className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMute}
                  className="text-neutral-300 hover:text-white transition-colors"
                  title="Silenciar (M)"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-neutral-700 accent-cyan-400 rounded-lg cursor-pointer"
                />
              </div>

              {/* Status / Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-semibold tracking-wider text-[11px] uppercase">EN DIRECTO</span>
              </div>
            </div>

            {/* Right Controls: Quality, PiP, Fullscreen */}
            <div className="flex items-center gap-2.5">
              {/* Quality selector */}
              {metrics.levels.length > 0 && (
                <select
                  value={metrics.currentLevel}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  className="bg-neutral-800/90 text-white text-xs border border-neutral-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value={-1}>Auto ({metrics.levels[metrics.currentLevel]?.name || 'Adaptativo'})</option>
                  {metrics.levels.map((lvl, idx) => (
                    <option key={idx} value={idx}>
                      {lvl.name} ({Math.round(lvl.bitrate / 1000)}k)
                    </option>
                  ))}
                </select>
              )}

              {/* Picture in Picture */}
              <button
                onClick={handleTogglePiP}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={handleToggleFullscreen}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                title="Pantalla completa (F)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live EPG Mini-Bar (Ticker) below player */}
        {currentProgram && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider shrink-0">
                AHORA
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {currentProgram.title}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {currentProgram.startTime} - {currentProgram.endTime} · {currentProgram.category || 'General'}
                </div>
              </div>
            </div>

            {nextProgram && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0 border-t sm:border-t-0 sm:border-l border-neutral-800 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-neutral-500">A continuación:</span>
                <span className="font-semibold text-neutral-200">{nextProgram.title}</span>
                <span className="font-mono text-[11px] text-cyan-400">({nextProgram.startTime})</span>
              </div>
            )}
          </div>
        )}

        {/* Speed & Buffer Tuning Quick Presets Bar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-neutral-200">Modo de Velocidad & Búfer</h3>
            </div>
            <p className="text-xs text-neutral-400">
              {SPEED_PRESETS[speedConfig.preset].description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800 shrink-0">
            <button
              onClick={() => handlePresetSelect('ultra-fast')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                speedConfig.preset === 'ultra-fast'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ultra Rápido (4s)
            </button>
            <button
              onClick={() => handlePresetSelect('balanced')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                speedConfig.preset === 'balanced'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Equilibrado (10s)
            </button>
            <button
              onClick={() => handlePresetSelect('anti-buffering')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                speedConfig.preset === 'anti-buffering'
                  ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Anti-cortes (25s)
            </button>
          </div>
        </div>

        {/* Informative Stream Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-[11px] text-neutral-400 mb-0.5">Búfer en Memoria</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-white">
              {metrics.bufferLengthSec}s
            </div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-[11px] text-neutral-400 mb-0.5">Tasa de Bits</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-cyan-400">
              {metrics.bitrateKbps > 0 ? `${metrics.bitrateKbps} kbps` : 'Adaptativo'}
            </div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-[11px] text-neutral-400 mb-0.5">Resolución</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-white">
              {metrics.levels[metrics.currentLevel]?.name || 'Auto 1080p'}
            </div>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3">
            <div className="text-[11px] text-neutral-400 mb-0.5">Atajos Teclado</div>
            <div className="text-xs font-mono text-neutral-300 pt-1">
              [Espacio] [M] [F] [←/→]
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Channels Navigation & Selector */}
      <div className="w-full lg:w-96 flex flex-col gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 max-h-[760px]">
        {/* Search & Advanced Multi-Filter Header */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Guía de Canales</span>
            </h3>
            <div className="flex items-center gap-2">
              {channels.length < 500 && (
                <button
                  onClick={onOpenLoadModal}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
                  title="Subir todos los canales de golpe (11.000+)"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Subir Todos (11k)</span>
                </button>
              )}
              <span className="text-xs text-neutral-400 font-mono tabular-nums">
                {filteredChannels.length} de {channels.length}
              </span>
            </div>
          </div>

          {/* Search Box with Clear Button */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, país, género o idioma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dual Dropdowns: Categoría + País */}
          <div className="grid grid-cols-2 gap-2">
            {/* Categoría Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center gap-1">
                <Folder className="w-3 h-3 text-cyan-400" />
                <span>Categoría</span>
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500 truncate cursor-pointer"
              >
                {categoriesWithCounts.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* País / Región Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>País</span>
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500 truncate cursor-pointer"
              >
                {countriesWithCounts.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Access Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
            <button
              onClick={() => {
                setSelectedGroup('Todos');
                setSelectedCountry('Todos');
                setShowOnlyFavorites(false);
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                selectedGroup === 'Todos' && selectedCountry === 'Todos' && !showOnlyFavorites && !searchQuery
                  ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                  : 'text-neutral-400 hover:text-white bg-neutral-950/60 border border-neutral-900'
              }`}
            >
              Todos ({channels.length})
            </button>

            {/* Favoritos Chip */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                showOnlyFavorites
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                  : 'text-neutral-400 hover:text-white bg-neutral-950/60 border border-neutral-900'
              }`}
            >
              <Star className={`w-3 h-3 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favoritos ({favoriteIds.length})</span>
            </button>

            {/* Popular quick categories: Música, Noticias, Deportes, Cine, etc. */}
            {popularCategories.map(cat => {
              const isSelected = selectedGroup === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedGroup(isSelected ? 'Todos' : cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 font-semibold'
                      : 'text-neutral-400 hover:text-white bg-neutral-950/60 border border-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Active Filters Reset Indicator */}
          {(selectedGroup !== 'Todos' || selectedCountry !== 'Todos' || showOnlyFavorites || searchQuery) && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-950 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-300">
              <span className="truncate">
                Filtros: {selectedGroup !== 'Todos' ? selectedGroup : ''}
                {selectedCountry !== 'Todos' ? (selectedGroup !== 'Todos' ? ' · ' : '') + selectedCountry : ''}
                {showOnlyFavorites ? ' · ⭐ Favoritos' : ''}
                {searchQuery ? ` · "${searchQuery}"` : ''}
              </span>
              <button
                onClick={() => {
                  setSelectedGroup('Todos');
                  setSelectedCountry('Todos');
                  setShowOnlyFavorites(false);
                  setSearchQuery('');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium shrink-0 ml-2"
              >
                Restablecer
              </button>
            </div>
          )}
        </div>

        {/* Channel Items List with Virtual Windowing */}
        <div 
          onScroll={handleChannelListScroll}
          className="flex-1 overflow-y-auto space-y-1.5 pr-1"
        >
          {filteredChannels.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No se encontraron canales para "{searchQuery}".
            </div>
          ) : (
            <>
              {filteredChannels.slice(0, visibleCount).map(channel => {
                const isSelected = selectedChannel?.id === channel.id;
                const isFav = favoriteIds.includes(channel.id);

                return (
                  <div
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-800/50 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Radio className="w-4 h-4 text-neutral-500" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-medium text-white truncate">
                          {channel.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {channel.group} · {channel.country || 'Global'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => toggleFavorite(channel.id, e)}
                        className={`p-1.5 rounded transition-colors ${
                          isFav ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {visibleCount < filteredChannels.length && (
                <div className="py-2.5 text-center">
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + 50, filteredChannels.length))}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-3 py-1.5 bg-neutral-950 rounded-lg border border-neutral-800 transition-colors w-full"
                  >
                    Cargar 50 canales más (viendo {Math.min(visibleCount, filteredChannels.length)} de {filteredChannels.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Load custom playlist footer button */}
        <div className="pt-2 border-t border-neutral-800">
          <button
            onClick={onOpenLoadModal}
            className="w-full py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>+ Cargar más canales M3U</span>
          </button>
        </div>
      </div>
    </div>
  );
};
