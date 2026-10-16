'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Menu, Bot, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { toggleLeftNav, setIsLeftAiChatOpen } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 border-b border-warm-border px-3 sm:px-4 py-2.5 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Left Navigator Menu Toggle Button */}
          <button
            onClick={toggleLeftNav}
            className="p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 border border-slate-200/80 transition-all flex items-center justify-center shadow-xs"
            title="Open Navigator"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* TableHive Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl p-[1.5px] shadow-gold group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              <img 
                src="/tablehive_logo.jpg" 
                alt="TableHive Logo" 
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className="font-sans text-lg sm:text-xl font-black tracking-tight text-roast-900 leading-none">
              TableHive
            </span>
          </Link>
        </div>

        {/* Right Actions: AI Chat button & Admin Panel */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeftAiChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all shadow-xs"
            title="Open AI Mitra Chat"
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">AI Mitra</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>
          
          <Link 
            href="/admin" 
            className="p-2 rounded-xl text-muted hover:text-purple-700 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200 flex items-center gap-1.5"
            title="Admin Panel"
          >
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Admin</span>
            <Shield className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
