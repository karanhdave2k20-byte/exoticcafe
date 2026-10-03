'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Activity, RefreshCw, Flame } from 'lucide-react';

interface Match {
  id: string;
  tournament: string;
  status: 'LIVE' | 'COMPLETED' | 'UPCOMING';
  team1: { name: string; score: string; overs: string; flag: string };
  team2: { name: string; score: string; overs: string; flag: string };
  summary: string;
}

const initialMatches: Match[] = [
  {
    id: 'm1',
    tournament: 'T20 International Championship',
    status: 'LIVE',
    team1: { name: 'India', score: '194/4', overs: '18.2 ov', flag: '🇮🇳' },
    team2: { name: 'Australia', score: '188/8', overs: '20.0 ov', flag: '🇦🇺' },
    summary: 'India need 6 runs in 10 balls to win the trophy!',
  },
  {
    id: 'm2',
    tournament: 'Premier League Football',
    status: 'LIVE',
    team1: { name: 'Arsenal', score: '2', overs: '78\'', flag: '⚽' },
    team2: { name: 'Chelsea', score: '1', overs: '78\'', flag: '⚽' },
    summary: 'Saka scores a curling screamer from outside the box.',
  },
];

export default function LiveScorePage() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshScores = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMatches(prev => prev.map(m => {
        if (m.id === 'm1') {
          return {
            ...m,
            team1: { ...m.team1, score: '196/4', overs: '18.4 ov' },
            summary: 'BOUNDARY! India win by 6 wickets with 8 balls to spare! 🏆🎉',
          };
        }
        return m;
      }));
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Real-Time Stadium Feed
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Live Sports Scoreboard
          </h1>
        </div>
        <button
          onClick={refreshScores}
          className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border"
          title="Refresh Scores"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-caramel-600' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {matches.map(m => (
          <div
            key={m.id}
            className="glass-card p-6 rounded-3xl border border-warm-border bg-white shadow-sm flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Match Header */}
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <span className="text-xs font-semibold text-muted tracking-wide">
                {m.tournament}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase border border-rose-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                <span>{m.status}</span>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{m.team1.flag}</span>
                  <span className="font-bold text-base text-roast-900">{m.team1.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-serif font-black text-xl text-caramel-700 font-mono">
                    {m.team1.score}
                  </span>
                  <span className="text-[10px] text-muted ml-1.5 font-mono">({m.team1.overs})</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{m.team2.flag}</span>
                  <span className="font-bold text-base text-roast-900">{m.team2.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-serif font-black text-xl text-roast-800 font-mono">
                    {m.team2.score}
                  </span>
                  <span className="text-[10px] text-muted ml-1.5 font-mono">({m.team2.overs})</span>
                </div>
              </div>
            </div>

            {/* Live Match Summary Banner */}
            <div className="p-3 rounded-2xl bg-caramel-50 border border-caramel-200 text-xs text-caramel-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-caramel-600 flex-shrink-0" />
              <span className="font-medium">{m.summary}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
