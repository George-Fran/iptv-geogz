import React from 'react';
import { Tv, LayoutGrid, Calendar, ShieldCheck, Sliders, Radio, Code2, Plus } from 'lucide-react';

export type NavTabType = 'player' | 'multiview' | 'epg' | 'health' | 'speed' | 'sources' | 'guide';

interface NavbarProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenLoadModal: () => void;
  channelCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenLoadModal,
  channelCount
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-4 lg:px-8 py-3 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#player" 
          onClick={(e) => { e.preventDefault(); onSelectTab('player'); }}
          className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Tv className="w-4 h-4" />
          </div>
          <span>Geogz Studio</span>
        </a>
        <span className="hidden md:inline-block text-xs text-neutral-400 font-mono tabular-nums">
          {channelCount} canales
        </span>
      </div>

      {/* Zone 2: Nav Links (Clean, single-line) */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => onSelectTab('player')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'player'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Reproductor</span>
        </button>

        <button
          onClick={() => onSelectTab('multiview')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'multiview'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Multipantalla</span>
        </button>

        <button
          onClick={() => onSelectTab('epg')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'epg'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Guía EPG</span>
        </button>

        <button
          onClick={() => onSelectTab('health')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'health'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Salud M3U</span>
        </button>

        <button
          onClick={() => onSelectTab('speed')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'speed'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Hacerlo Veloz</span>
        </button>

        <button
          onClick={() => onSelectTab('sources')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'sources'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Dónde Sacar IPTV</span>
        </button>

        <button
          onClick={() => onSelectTab('guide')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'guide'
              ? 'text-cyan-400 bg-neutral-900 border border-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Crear Tu Propio</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenLoadModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-400/20 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cargar M3U</span>
        </button>
      </div>
    </header>
  );
};
