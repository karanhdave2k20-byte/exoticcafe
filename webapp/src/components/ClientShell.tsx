'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Header from './Header';
import Toast from './Toast';

export default function ClientShell({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useStore();
  const pathname = usePathname();
  
  // Hide the FAB if we are already on the AI chat page
  const showFAB = pathname !== '/fun/ai-talk';

  return (
    <div className="min-h-screen flex flex-col relative pb-8">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4">
        {children}
      </main>
      
      {/* Global AI Chatbot FAB */}
      {showFAB && (
        <Link
          href="/fun/ai-talk"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-gold hover:scale-110 transition-transform cursor-pointer group border-2 border-caramel-300 overflow-hidden"
        >
          <img src="/ai_bot_logo.jpg" alt="AI Barista" className="w-full h-full object-cover" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 bg-roast-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
            Ask AI Sommelier
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-roast-900" />
          </div>
        </Link>
      )}

      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}
