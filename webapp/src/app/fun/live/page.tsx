'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function LiveScorePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  // We use a key to force the iframe to reload when the user clicks refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshScores = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-6 animate-fade-in h-[85vh]">
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Real-Time Stadium Feed
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Live Cricket Scoreboard
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

      <div className="flex-1 w-full glass-card rounded-3xl border border-warm-border bg-white shadow-sm overflow-hidden flex flex-col relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-caramel-600" />
          </div>
        )}
        <iframe 
          key={refreshKey}
          src="https://widget.crictimes.org/" 
          style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none' }}
          frameBorder="0" 
          scrolling="yes"
          title="Live Cricket Scores"
          className="flex-1"
        />
      </div>
    </div>
  );
}
