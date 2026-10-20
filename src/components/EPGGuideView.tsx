import React, { useState } from 'react';
import { Calendar, Clock, Tv, Play, Radio, ChevronRight, Info } from 'lucide-react';
import { Channel } from '../types/iptv';
import { getEPGScheduleForChannel } from '../data/epgData';

interface EPGGuideViewProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onSwitchToPlayer: () => void;
}

export const EPGGuideView: React.FC<EPGGuideViewProps> = ({
  channels,
  onSelectChannel,
  onSwitchToPlayer
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [epgSearch, setEpgSearch] = useState<string>('');

  const filteredEpgChannels = channels
    .filter(c => !epgSearch || c.name.toLowerCase().includes(epgSearch.toLowerCase()))
    .slice(0, 40);

  const activeChannel = channels.find(c => c.id === selectedChannelId) || channels[0];
  const schedule = activeChannel ? getEPGScheduleForChannel(activeChannel.id) : [];

  const currentProgram = schedule[0];
  const upcomingPrograms = schedule.slice(1);

  // Calculate elapsed progress for current program
  const now = new Date();
  const minutes = now.getMinutes();
  const progressPercent = Math.min(100, Math.max(5, Math.round((minutes / 60) * 100)));

  const handleTuneIn = (channel: Channel) => {
    onSelectChannel(channel);
    onSwitchToPlayer();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
          Guía Electrónica de Programación (EPG)
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Parrilla de Emisión y Horarios en Vivo
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Sigue en tiempo real qué programa se está emitiendo en cada cadena y qué se emitirá en las próximas horas.
        </p>
      </div>

      {/* Main Grid: Channels list on left, Program Schedule on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Channel Selector Sidebar */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 px-1">
            <span>Seleccionar Cadena</span>
            <span className="font-mono">{filteredEpgChannels.length} visibles</span>
          </div>

          <input
            type="text"
            placeholder="Buscar canal..."
            value={epgSearch}
            onChange={(e) => setEpgSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
          />

          <div className="space-y-1.5">
            {filteredEpgChannels.map((ch) => {
              const isSelected = ch.id === selectedChannelId;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }`}
                >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                    {ch.logo ? (
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Tv className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold truncate text-white">{ch.name}</div>
                    <div className="text-[11px] text-neutral-400 truncate">{ch.group}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-600'}`} />
              </div>
            );
          })}
        </div>
      </div>

        {/* Schedule & Program Details */}
        <div className="lg:col-span-8 space-y-6">
          {activeChannel && (
            <>
              {/* Now Airing Hero Card */}
              {currentProgram && (
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-cyan-500/40 rounded-xl p-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400">EMITIÉNDOSE AHORA</span>
                      <span className="text-xs text-neutral-500">·</span>
                      <span className="text-xs text-neutral-400 font-mono tabular-nums">
                        {currentProgram.startTime} - {currentProgram.endTime}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTuneIn(activeChannel)}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors shadow-sm shadow-cyan-400/20 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Sintonizar en Vivo</span>
                    </button>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {currentProgram.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5 max-w-2xl">
                    {currentProgram.description}
                  </p>

                  {/* Program Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1.5 font-mono">
                      <span>Inicio: {currentProgram.startTime}</span>
                      <span className="text-cyan-400 font-semibold">{progressPercent}% completado</span>
                      <span>Fin: {currentProgram.endTime}</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Programs List */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>A Continuación en {activeChannel.name}</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {upcomingPrograms.map((prog, idx) => (
                    <div
                      key={prog.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-lg hover:border-neutral-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                            {prog.startTime}
                          </span>
                          <span className="text-xs text-neutral-600">·</span>
                          <span className="text-xs text-neutral-400 font-medium">
                            {prog.category || 'General'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          {prog.title}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {prog.description}
                        </p>
                      </div>

                      <div className="text-xs text-neutral-500 font-mono shrink-0 sm:text-right">
                        Duración: 60m
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
