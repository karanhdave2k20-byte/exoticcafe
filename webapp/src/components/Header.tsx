'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/60 border-b border-warm-border px-4 py-3 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl p-[1.5px] shadow-gold group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
            <img 
              src="/tablehive_logo.jpg" 
              alt="TableHive Logo" 
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <span className="font-sans text-xl font-black tracking-tight text-roast-900 leading-none">
            TableHive
          </span>
        </Link>
      </div>
    </header>
  );
}
