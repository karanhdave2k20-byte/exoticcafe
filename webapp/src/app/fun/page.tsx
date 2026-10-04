'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Gamepad2, Music, Film, Newspaper, Trophy, Bot, 
  Sparkles, ArrowRight, Zap, Coffee, HeartHandshake, Info 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

export default function FunHubPage() {
  const { orderStatus, tableInfo, currentOrderId } = useStore();

  const userInterests = tableInfo?.interests || ['Cricket', 'Music'];

  const channels = [
    {
      id: 'Cricket',
      title: 'Live Cricket Scorecard',
      desc: 'Real-time ball-by-ball commentary & tournament scorecards for ongoing matches.',
      icon: Trophy,
      color: 'from-caramel-500 to-amber-700',
      badge: 'Cricket Live',
      href: '/fun/live',
    },
    {
      id: 'News',
      title: 'Curated Café & World News',
      desc: 'Stay informed with hand-selected headlines across gastronomy, culture, and tech.',
      icon: Newspaper,
      color: 'from-blue-500 to-indigo-600',
      badge: 'News Flash',
      href: '/fun/news',
    },
    {
      id: 'Short Videos',
      title: 'Short Videos & Micro-Reels',
      desc: 'Engaging, aesthetic culinary craft videos and entertaining short clips.',
      icon: Film,
      color: 'from-rose-500 to-pink-600',
      badge: 'Shorts Lounge',
      href: '/fun/films',
    },
    {
      id: 'Music',
      title: 'Lo-Fi Café Radio',
      desc: 'Immerse your table in calming lo-fi beats, chill jazz chords, and acoustic sets.',
      icon: Music,
      color: 'from-purple-500 to-violet-700',
      badge: 'Ambient Music',
      href: '/fun/radio',
    },
    {
      id: 'Games',
      title: '2048 Café Edition Mini-Game',
      desc: 'Slide roasted espresso beans and artisanal pastries to reach the legendary 2048 cup!',
      icon: Gamepad2,
      color: 'from-emerald-500 to-teal-700',
      badge: 'Table Challenge',
      href: '/fun/game',
    },
    {
      id: 'Tic-Tac-Toe',
      title: 'Tabletop Tic-Tac-Toe',
      desc: 'Settle the debate of who pays the bill with a quick game of classic Tic-Tac-Toe!',
      icon: Gamepad2,
      color: 'from-blue-400 to-indigo-500',
      badge: 'Multiplayer',
      href: '/fun/tictactoe',
    },
    {
      id: 'AI Barista',
      title: 'Gemini AI Culinary Companion',
      desc: 'Chat with our AI Sommelier powered by Gemini. Ask pairing advice, dish secrets, or jokes!',
      icon: Bot,
      color: 'from-yellow-500 to-amber-600',
      badge: 'Gemini AI',
      href: '/fun/ai-talk',
    },
  ];

  // Prioritize channels that match the user's onboarding interests
  const prioritizedChannels = [...channels].sort((a, b) => {
    const aMatch = userInterests.includes(a.id);
    const bMatch = userInterests.includes(b.id);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <BackButton href="/menu" label="Back to Menu" />
      </div>
      {/* Live Order Ribbon if an order is in progress */}
      {(orderStatus || currentOrderId) && (
        <Link
          href="/track"
          className="glass-card p-4 rounded-2xl border border-caramel-500/40 bg-caramel-50/70 flex items-center justify-between gap-3 group shadow-glass"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-caramel-500 text-white font-bold flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-extrabold text-caramel-700">
                Order #{currentOrderId || 'Active'} • {orderStatus?.toUpperCase() || 'PREPARING'}
              </p>
              <p className="text-[11px] text-muted">
                Your dishes are being handcrafted in the kitchen. Tap to view the live timeline.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-caramel-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-50 text-caramel-700 border border-caramel-200 text-xs font-bold tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Table #{tableInfo?.tableNo || '05'} Waiting Lounge</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-roast-900">
          Unwind, Play & Explore
        </h1>
        <p className="text-xs text-muted mt-1 max-w-md mx-auto">
          Personalized entertainment channels based on your table party&apos;s interests ({userInterests.join(', ')}).
        </p>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prioritizedChannels.map(item => {
          const Icon = item.icon;
          const isPreferred = userInterests.includes(item.id);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`glass-card p-5 rounded-3xl border bg-white flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass group relative overflow-hidden ${
                isPreferred ? 'border-caramel-500/60 ring-1 ring-caramel-200' : 'border-warm-border'
              }`}
            >
              {isPreferred && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-caramel-50 text-caramel-800 border border-caramel-200 text-[9px] font-black uppercase tracking-wider">
                  ★ Picked For You
                </div>
              )}

              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-caramel-700 tracking-wider">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-roast-900 group-hover:text-caramel-600 transition-colors mt-0.5">
                    {item.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                {item.desc}
              </p>

              <div className="flex items-center text-xs font-bold text-caramel-700 group-hover:text-caramel-800 transition-colors pt-1 border-t border-warm-border/60">
                <span>Launch Channel</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Café Story & Information Card (Section 13) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-gradient-to-br from-[#FAF6EE] to-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-caramel-500 text-white flex items-center justify-center flex-shrink-0 shadow-gold">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-serif font-black text-roast-900">
              The Table Hive Philosophy at Exotic Café
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed max-w-lg">
              Dining is inherently social. By turning each table into a collaborative hub, you and your companions order in sync, share dishes transparently, and split the bill effortlessly. All beans are sustainably sourced Arabica, roasted weekly in small batches.
            </p>
          </div>
        </div>

        <Link
          href="/menu"
          className="btn-primary px-6 py-3 text-xs font-bold shadow-gold whitespace-nowrap"
        >
          Add More Dishes ☕
        </Link>
      </div>
    </div>
  );
}
