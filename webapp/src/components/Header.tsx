'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Sparkles, Menu } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { setIsLeftAiChatOpen, setIsLeftNavOpen } = useStore();
  const pathname = usePathname();
  const isEnteringFlow = pathname === '/' || pathname === '/table-select' || pathname === '/login';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 border-b border-purple-100/80 px-4 sm:px-6 lg:px-8 py-2.5 backdrop-blur-xl shadow-xs transition-all">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Hamburger (Visible on mobile/tablet when inside session) */}
          {!isEnteringFlow && (
            <button
              onClick={() => setIsLeftNavOpen(true)}
              className="lg:hidden p-1.5 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 active:scale-95 transition-all"
              aria-label="Open Navigation Menu"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* TableHive Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl p-[1.5px] bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              <img 
                src="/tablehive_logo.jpg" 
                alt="TableHive Logo" 
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-lg sm:text-xl font-black tracking-tight text-roast-900 leading-none">
                TableHive
              </span>
              <span className="text-[10px] text-purple-700 font-bold tracking-widest uppercase hidden sm:inline">
                Social Dining
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: AI Chat button ONLY on /menu page */}
        {pathname === '/menu' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLeftAiChatOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Open AI Mitra Chat"
            >
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">AI Mitra</span>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
