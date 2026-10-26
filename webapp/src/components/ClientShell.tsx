'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Header from './Header';
import Toast from './Toast';

import LeftNavigator from './LeftNavigator';
import LeftAiChatDrawer from './LeftAiChatDrawer';

export default function ClientShell({ children }: { children: ReactNode }) {
  const { toasts, removeToast, setIsLeftAiChatOpen, isLeftAiChatOpen, currentSession, user } = useStore();
  const pathname = usePathname();
  
  // During table scan and onboarding steps, do not show Left Navigator rail
  const isEnteringFlow = pathname === '/' || pathname === '/login' || pathname === '/people' || pathname === '/preference' || pathname === '/invite' || pathname.startsWith('/table/') || pathname.startsWith('/auth');

  // AI Mitra option ONLY on /menu page as explicitly required
  const showFAB = pathname === '/menu' && !isLeftAiChatOpen;

  return (
    <div className="min-h-screen flex flex-col relative pb-8">
      <Header />
      
      {/* Left Navigation Rail & Drawer (Only after user enters table session) */}
      {!isEnteringFlow && <LeftNavigator />}

      {/* Interactive Left-sliding AI Chat Drawer (Only on /menu page) */}
      {pathname === '/menu' && <LeftAiChatDrawer />}

      {/* Main Content Area: dynamically offsets on desktop when AI Mitra is open side-by-side */}
      <main 
        className={`flex-1 w-full mx-auto px-3 sm:px-6 py-4 min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out ${
          pathname === '/' ? 'max-w-[1920px] px-4 sm:px-6 lg:px-8' : isEnteringFlow ? 'max-w-5xl' 
            : (isLeftAiChatOpen && pathname === '/menu')
              ? 'lg:pl-[490px] xl:pl-[510px] max-w-[1920px]' 
              : 'lg:pl-20 max-w-7xl'
        }`}
      >
        {children}
      </main>
      
      {/* Global AI Chatbot FAB - ONLY on /menu page */}
      {showFAB && (
        <button
          onClick={() => setIsLeftAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-gold hover:scale-110 transition-transform cursor-pointer group border-2 border-purple-400 overflow-hidden"
          title="Open AI Mitra Chat"
          aria-label="Open AI Mitra Chat"
        >
          <img src="/ai_bot_logo.jpg" alt="AI Mitra" className="w-full h-full object-cover" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            Ask AI Mitra
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
          </div>
        </button>
      )}

      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}
