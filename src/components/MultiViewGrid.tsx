import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Volume2, VolumeX, Maximize2, RefreshCw, Plus, Trash2, LayoutGrid, SplitSquareVertical } from 'lucide-react';
import { Channel } from '../types/iptv';

interface MultiViewGridProps {
  channels: Channel[];
}

interface SlotState {
  id: number;
  channel: Channel | null;
  isMuted: boolean;
  status: string;
}

export const MultiViewGrid: React.FC<MultiViewGridProps> = ({ channels }) => {
  const [layout, setLayout] = useState<'2x1' | '2x2'>('2x2');
  const [activeAudioSlot, setActiveAudioSlot] = useState<number>(0);

  const [slots, setSlots] = useState<SlotState[]>([
    { id: 0, channel: channels[0] || null, isMuted: false, status: 'Cargando' },
    { id: 1, channel: channels[1] || null, isMuted: true, status: 'Cargando' },
    { id: 2, channel: channels[2] || null, isMuted: true, status: 'Cargando' },
    { id: 3, channel: channels[3] || null, isMuted: true, status: 'Cargando' },
  ]);

  const handleSelectChannelForSlot = (slotIndex: number, channelId: string) => {
    const ch = channels.find(c => c.id === channelId) || null;
    setSlots(prev => prev.map((s, idx) => idx === slotIndex ? { ...s, channel: ch } : s));
  };

  const handleAudioSwitch = (slotIndex: number) => {
    setActiveAudioSlot(slotIndex);
    setSlots(prev => prev.map((s, idx) => ({ ...s, isMuted: idx !== slotIndex })));
  };

  const visibleSlots = layout === '2x1' ? slots.slice(0, 2) : slots;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-0.5">
            Mosaico de Canales en Vivo
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Modo Multipantalla (Multi-View)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Monitorea hasta 4 señales simultáneas. Haz clic en el icono de altavoz de cualquier pantalla para escuchar su audio.
          </p>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 bg-neutral-950 p-1 border border-neutral-800 rounded-lg">
          <button
            onClick={() => setLayout('2x1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              layout === '2x1' ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>Dual (2 pantallas)</span>
          </button>
          <button
            onClick={() => setLayout('2x2')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              layout === '2x2' ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Quad (4 pantallas)</span>
          </button>
        </div>
      </div>

      {/* Grid of Players */}
      <div className={`grid gap-4 ${layout === '2x1' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {visibleSlots.map((slot, index) => (
          <MultiViewCell
            key={slot.id}
            slotNumber={index + 1}
            channel={slot.channel}
            allChannels={channels}
            isMuted={slot.isMuted}
            onAudioSelect={() => handleAudioSwitch(index)}
            onChannelChange={(chId) => handleSelectChannelForSlot(index, chId)}
          />
        ))}
      </div>
    </div>
  );
};

interface MultiViewCellProps {
  slotNumber: number;
  channel: Channel | null;
  allChannels: Channel[];
  isMuted: boolean;
  onAudioSelect: () => void;
  onChannelChange: (channelId: string) => void;
}

const MultiViewCell: React.FC<MultiViewCellProps> = ({
  slotNumber,
  channel,
  allChannels,
  isMuted,
  onAudioSelect,
  onChannelChange
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    setError(false);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 4,
        maxMaxBufferLength: 8,
        liveSyncDurationCount: 2,
        capLevelToPlayerSize: true, // Crucial for multi-view bandwidth efficiency
      });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = isMuted;
        video.play().catch(console.warn);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(true);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      video.muted = isMuted;
      video.play().catch(console.warn);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-neutral-900 border rounded-xl overflow-hidden group aspect-video flex flex-col justify-between ${
        !isMuted ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-neutral-800'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-contain bg-black"
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-neutral-950/80 flex flex-col items-center justify-center p-4 text-center z-20">
          <span className="text-xs text-red-400 font-semibold mb-2">Canal no disponible</span>
          <button
            onClick={() => channel && onChannelChange(channel.id)}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] rounded transition-colors"
          >
            Reconectar
          </button>
        </div>
      )}

      {/* Top Header inside Slot */}
      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="w-5 h-5 rounded bg-neutral-800 text-[11px] font-mono font-bold flex items-center justify-center text-white shrink-0">
            {slotNumber}
          </span>
          <select
            value={channel?.id || ''}
            onChange={(e) => onChannelChange(e.target.value)}
            className="bg-neutral-900/90 text-white text-xs border border-neutral-700 rounded px-2 py-1 outline-none truncate max-w-full"
          >
            {allChannels.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio toggle button */}
          <button
            onClick={onAudioSelect}
            className={`p-1.5 rounded-md transition-colors ${
              !isMuted ? 'bg-cyan-500 text-neutral-950 font-bold' : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
            title={!isMuted ? 'Audio activo en este canal' : 'Activar audio de este canal'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md bg-neutral-800/80 text-neutral-400 hover:text-white transition-colors"
            title="Pantalla completa para esta ventana"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Badge bottom left */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-neutral-300">
        <span className={`w-1.5 h-1.5 rounded-full ${!isMuted ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`}></span>
        <span className="font-semibold uppercase tracking-wider">{channel?.name || 'Señal'}</span>
      </div>
    </div>
  );
};
