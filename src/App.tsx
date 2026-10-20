import React, { useState } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { PlayerView } from './components/PlayerView';
import { MultiViewGrid } from './components/MultiViewGrid';
import { EPGGuideView } from './components/EPGGuideView';
import { ChannelHealthInspector } from './components/ChannelHealthInspector';
import { SpeedOptimizerView } from './components/SpeedOptimizerView';
import { SourcesDirectoryView } from './components/SourcesDirectoryView';
import { ArchitectureGuideView } from './components/ArchitectureGuideView';
import { LoadPlaylistModal } from './components/LoadPlaylistModal';
import { INITIAL_LEGAL_CHANNELS, SPEED_PRESETS } from './data/legalSources';
import { Channel, SpeedConfig } from './types/iptv';
import { fetchPlaylistFromUrl } from './utils/m3uParser';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('player');
  const [channels, setChannels] = useState<Channel[]>(INITIAL_LEGAL_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(INITIAL_LEGAL_CHANNELS[0]);
  const [speedConfig, setSpeedConfig] = useState<SpeedConfig>(SPEED_PRESETS['balanced'].config);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoadChannels = (newChannels: Channel[], playlistName: string) => {
    setChannels(newChannels);
    if (newChannels.length > 0) {
      setSelectedChannel(newChannels[0]);
    }
    showNotification(`¡${newChannels.length} canales cargados desde "${playlistName}"!`);
  };

  const handleLoadDirectoryPlaylist = async (url: string, title: string) => {
    setIsLoadingDirectory(true);
    try {
      const parsedChannels = await fetchPlaylistFromUrl(url);
      if (parsedChannels.length > 0) {
        setChannels(parsedChannels);
        setSelectedChannel(parsedChannels[0]);
        setActiveTab('player');
        showNotification(`¡${parsedChannels.length} canales cargados con éxito!`);
      } else {
        throw new Error('No se encontraron canales válidos.');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al cargar la lista remota.');
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-cyan-500 text-neutral-950 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Contract (Brand, nav links, 1 primary action) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLoadModal={() => setIsLoadModalOpen(true)}
        channelCount={channels.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'player' && (
          <PlayerView
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            speedConfig={speedConfig}
            onUpdateSpeedConfig={setSpeedConfig}
            onOpenLoadModal={() => setIsLoadModalOpen(true)}
          />
        )}

        {activeTab === 'multiview' && (
          <MultiViewGrid channels={channels} />
        )}

        {activeTab === 'epg' && (
          <EPGGuideView
            channels={channels}
            onSelectChannel={setSelectedChannel}
            onSwitchToPlayer={() => setActiveTab('player')}
          />
        )}

        {activeTab === 'health' && (
          <ChannelHealthInspector
            channels={channels}
            onSelectChannel={setSelectedChannel}
            onSwitchToPlayer={() => setActiveTab('player')}
          />
        )}

        {activeTab === 'speed' && (
          <SpeedOptimizerView
            speedConfig={speedConfig}
            onUpdateSpeedConfig={setSpeedConfig}
            onSwitchToPlayer={() => setActiveTab('player')}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesDirectoryView
            onLoadDirectoryPlaylist={handleLoadDirectoryPlaylist}
            isLoadingPlaylist={isLoadingDirectory}
            onOpenLoadModal={() => setIsLoadModalOpen(true)}
          />
        )}

        {activeTab === 'guide' && (
          <ArchitectureGuideView />
        )}
      </main>

      {/* Playlist Importer Modal */}
      <LoadPlaylistModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoadChannels={handleLoadChannels}
      />
    </div>
  );
}
