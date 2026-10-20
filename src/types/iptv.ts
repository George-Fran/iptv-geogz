export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  country?: string;
  language?: string;
  isCustom?: boolean;
  tvgId?: string;
  health?: 'online' | 'slow' | 'offline' | 'untested';
  pingMs?: number;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  startTimestamp: number;
  endTimestamp: number;
  category?: string;
}

export interface VideoFilters {
  brightness: number; // 50 to 150 %
  contrast: number;   // 50 to 150 %
  saturation: number; // 0 to 200 %
  aspectRatio: '16:9' | '4:3' | 'original' | 'fill';
}

export interface MultiViewSlot {
  id: string;
  channel: Channel | null;
  isMuted: boolean;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  description: string;
  url?: string;
  count?: number;
  channels: Channel[];
}

export interface SpeedConfig {
  lowLatencyMode: boolean;
  maxBufferLength: number; // in seconds
  maxMaxBufferLength: number;
  liveSyncDurationCount: number; // segments behind live
  liveMaxLatencyDurationCount: number;
  enableWorker: boolean;
  backBufferLength: number;
  preset: 'ultra-fast' | 'balanced' | 'anti-buffering';
}

export interface StreamMetrics {
  currentLevel: number;
  levels: { height: number; width: number; bitrate: number; name: string }[];
  bitrateKbps: number;
  bufferLengthSec: number;
  latencySec: number;
  fps: number;
  droppedFrames: number;
  loadedSegments: number;
  audioTracks: { id: number; name: string; lang?: string }[];
  currentAudioTrack: number;
  live: boolean;
}

export interface LegalSourceItem {
  id: string;
  name: string;
  category: 'noticias' | 'deportes' | 'cultura' | 'musica' | 'internacional' | 'test';
  country: string;
  description: string;
  streamUrl: string;
  m3uUrl?: string;
  logo: string;
  verified: boolean;
  resolution: string;
}
