'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Volume2, SkipForward, Music, Radio, Disc3 } from 'lucide-react';

interface Track {
  title: string;
  artist: string;
  genre: string;
  duration: string;
  cover: string;
}

export default function RadioPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    { title: 'Chill Lounge & Lo-Fi', artist: 'I Love Radio', genre: 'Lo-Fi Jazz', duration: 'LIVE', cover: '☕', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
    { title: 'Ambient Rain & Chill', artist: 'SomaFM', genre: 'Ambient Chill', duration: 'LIVE', cover: '🌧️', url: 'https://ice1.somafm.com/defcon-128-mp3' },
    { title: 'Deep Space Lounge', artist: 'SomaFM Space Station', genre: 'Ambient Downtempo', duration: 'LIVE', cover: '✨', url: 'https://ice1.somafm.com/spacestation-128-mp3' },
    { title: 'Acoustic Morning Blend', artist: 'Chillout Lounge', genre: 'Acoustic', duration: 'LIVE', cover: '🥐', url: 'https://streams.ilovemusic.de/iloveradio14.mp3' },
  ];

  const currentTrack = tracks[currentTrackIndex];

  // Effect to handle play/pause and volume changes
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error('Audio play failed:', e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, volume]);

  const handleNextTrack = () => {
    setIsPlaying(false);
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setTimeout(() => setIsPlaying(true), 100); // Resume play after changing source
  };

  return (
    <div className="max-w-md mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      {/* Hidden Audio Element for Streaming */}
      <audio ref={audioRef} src={currentTrack.url} preload="none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Acoustic Atmosphere
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Lo-Fi Café Radio
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Main Vinyl / Disc Player Card */}
      <div className="glass-card p-8 rounded-3xl border border-warm-border shadow-glass flex flex-col items-center text-center gap-6 relative overflow-hidden bg-white">
        {/* Animated Spinning Record */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className={`w-full h-full rounded-full bg-[#1C130D] border-4 border-caramel-500/30 p-3 shadow-xl flex items-center justify-center ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            <div className="w-full h-full rounded-full border border-dashed border-white/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-caramel-500 to-caramel-500 flex items-center justify-center text-3xl shadow-gold text-white">
                {currentTrack.cover}
              </div>
            </div>
          </div>
        </div>

        {/* Track Title */}
        <div>
          <h3 className="font-serif font-bold text-xl text-roast-900">
            {currentTrack.title}
          </h3>
          <p className="text-xs text-muted mt-1">
            {currentTrack.artist} • <span className="text-caramel-700 font-semibold">{currentTrack.genre}</span>
          </p>
        </div>

        {/* Ambient Visualizer Bars */}
        <div className="flex items-end justify-center gap-1.5 h-8 w-40">
          {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((h, idx) => (
            <div
              key={idx}
              className="w-1.5 bg-gradient-to-t from-caramel-500 to-amber-400 rounded-full transition-all duration-300"
              style={{
                height: isPlaying ? `${h}%` : '20%',
                opacity: isPlaying ? 1 : 0.4,
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full pt-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full btn-primary flex items-center justify-center shadow-gold hover:scale-105 transition-all text-white"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 ml-1 fill-white" />}
          </button>

          <button
            onClick={handleNextTrack}
            className="w-12 h-12 rounded-full glass-card hover:border-caramel-500 text-caramel-700 bg-white border border-warm-border flex items-center justify-center transition-all shadow-sm"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 w-full max-w-xs text-muted text-xs">
          <Volume2 className="w-4 h-4 text-caramel-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-caramel-500"
          />
          <span className="font-mono text-[10px] w-6 text-right font-bold text-roast-900">{volume}%</span>
        </div>
      </div>

      {/* Track Playlist */}
      <div className="glass-card p-5 rounded-3xl border border-warm-border bg-white flex flex-col gap-2 shadow-sm">
        <span className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 mb-1">
          Café Radio Lineup
        </span>
        {tracks.map((t, idx) => (
          <div
            key={t.title}
            onClick={() => {
              setCurrentTrackIndex(idx);
              setIsPlaying(true);
            }}
            className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
              idx === currentTrackIndex
                ? 'bg-caramel-50 border border-caramel-300 text-caramel-800'
                : 'hover:bg-warm-subtle text-muted border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{t.cover}</span>
              <div>
                <h4 className="text-xs font-bold text-roast-900">{t.title}</h4>
                <p className="text-[10px] text-muted">{t.artist}</p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-semibold text-roast-800">{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
