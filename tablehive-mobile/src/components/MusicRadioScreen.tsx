import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Flame, Music2, Radio, Sparkles, ArrowRight } from 'lucide-react';
import { RadioStation, TrendingSong } from '../types';
import { CAFE_RADIO_STATIONS, TRENDING_SONGS } from '../data/musicData';

interface MusicRadioScreenProps {
  currentStation: RadioStation;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSelectStation: (station: RadioStation) => void;
  onToggleMute: () => void;
  onAskAiAboutSong: (song: TrendingSong) => void;
}

export const MusicRadioScreen: React.FC<MusicRadioScreenProps> = ({
  currentStation,
  isPlaying,
  isMuted,
  onTogglePlay,
  onSelectStation,
  onToggleMute,
  onAskAiAboutSong,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Bollywood' | 'Indie Pop' | 'Global Hit'>('All');

  const filteredSongs = TRENDING_SONGS.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto space-y-5 animate-in fade-in duration-200">
      {/* 📻 Live Café Radio Player Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl space-y-3.5 relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300">
              Live TableHive Radio Stream
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-amber-400 animate-equalizer-1" />
                <span className="w-0.5 bg-amber-400 animate-equalizer-2" />
                <span className="w-0.5 bg-amber-400 animate-equalizer-3" />
              </div>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {isPlaying ? 'ON AIR' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Current Station Info */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/10 flex-shrink-0">
            {currentStation.cover}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-sm text-white truncate">
              {currentStation.title}
            </h3>
            <p className="text-xs text-purple-200 truncate mt-0.5 font-medium">
              {currentStation.genre}
            </p>
            <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">
              {currentStation.desc}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onTogglePlay}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>LISTEN LIVE</span>
              </>
            )}
          </button>

          <div className="text-[10px] font-bold text-purple-300">
            HQ 320kbps
          </div>
        </div>
      </div>

      {/* Radio Station Selector */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-brand-600" />
          <span>Switch Café Radio Station</span>
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {CAFE_RADIO_STATIONS.map((station) => {
            const isCur = currentStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`p-2.5 rounded-2xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                  isCur
                    ? 'bg-purple-900 text-white border-purple-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <span className="text-xl flex-shrink-0">{station.cover}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${isCur ? 'text-white' : 'text-slate-900'}`}>
                    {station.title}
                  </p>
                  <p className={`text-[10px] truncate ${isCur ? 'text-purple-200' : 'text-slate-500'}`}>
                    {station.genre}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔥 Trending & New Songs (2025–2026) */}
      <div className="space-y-3 pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Trending & New Songs (2025–2026)
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            {TRENDING_SONGS.length} Hit Tracks
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Bollywood', 'Indie Pop', 'Global Hit'] as const).map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat === 'All' ? '🔥 All Songs' : cat}
              </button>
            );
          })}
        </div>

        {/* Songs List */}
        <div className="space-y-2">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-lg flex-shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                    {song.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                        {song.title}
                      </h5>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                        {song.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {song.artist} • <span className="font-medium text-slate-500">{song.movieOrAlbum}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                  Vibe: {song.vibe}
                </span>
                <button
                  onClick={() => onAskAiAboutSong(song)}
                  className="font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>💬 Ask AI Mitra</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
