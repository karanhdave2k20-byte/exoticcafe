'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, Utensils, Coffee, ShoppingBag, Clock, 
  Gamepad2, User, ChevronRight, X, Bot, Shield, Flame
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function LeftNavigator() {
  const pathname = usePathname();
  const { 
    cart, 
    tableInfo, 
    isLeftAiChatOpen, 
    toggleLeftAiChat, 
    setIsLeftAiChatOpen,
    isLeftNavOpen, 
    setIsLeftNavOpen 
  } = useStore();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const currentTable = tableInfo?.tableNo || '1';

  const navItems = [
    {
      label: 'Menu',
      href: '/menu',
      icon: Utensils,
      description: 'Dishes, Drinks & Combos',
    },
    {
      label: 'My Table',
      href: `/table/${currentTable}`,
      icon: Coffee,
      description: `Table #${currentTable} Session`,
    },
    {
      label: 'Shared Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: totalCartCount > 0 ? totalCartCount : null,
      description: 'Review & Split Bill',
    },
    {
      label: 'Track Order',
      href: '/track',
      icon: Clock,
      description: 'Live Kitchen Progress',
    },
    {
      label: 'Fun Hub',
      href: '/fun',
      icon: Gamepad2,
      description: 'Games, Radio & Films',
    },
    {
      label: 'My Profile',
      href: '/profile',
      icon: User,
      description: 'Loyalty & Coffee Stamps',
    },
  ];

  return (
    <>
      {/* 1. Left Edge AI Chat Quick Tab (Only on mobile/tablet when rail is hidden) */}
      {!isLeftAiChatOpen && (
        <button
          onClick={() => setIsLeftAiChatOpen(true)}
          className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 pl-2.5 pr-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-r-2xl shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-200 group border-y border-r border-purple-400/30"
          title="Open AI Mitra Chat"
          aria-label="Open AI Mitra Chat"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide flex items-center gap-1">
            AI Mitra
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
        </button>
      )}

      {/* 2. Desktop Left Navigation Rail (Persistent sleek sidebar on lg+ screens) */}
      <aside className="hidden lg:flex fixed left-0 top-[65px] bottom-0 z-30 w-16 hover:w-56 bg-white/80 hover:bg-white backdrop-blur-xl border-r border-slate-200/90 flex-col justify-between py-4 transition-all duration-300 ease-in-out shadow-sm group overflow-hidden">
        {/* Top: AI Chat Primary Feature Button */}
        <div className="px-2 space-y-3">
          <button
            onClick={() => setIsLeftAiChatOpen(true)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 ${
              isLeftAiChatOpen
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-900 border border-purple-200/80 shadow-sm'
            }`}
            title="Open AI Mitra Chat"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              isLeftAiChatOpen ? 'bg-white text-purple-600' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
            }`}>
              <Bot className="w-4 h-4" />
            </div>

            <div className="flex-1 text-left opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold leading-tight">AI Mitra</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-purple-600 text-white leading-none">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-purple-700/80 leading-tight">Café Mitra Companion</p>
            </div>
          </button>

          <div className="h-px bg-slate-200 mx-1" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Table info & admin shortcut */}
        <div className="px-2 pt-2 border-t border-slate-200 space-y-1">
          <Link
            href={`/table/${currentTable}`}
            className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors"
            title={`Table #${currentTable}`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
              #{currentTable}
            </div>
            <div className="text-left opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              <p className="text-xs font-bold text-slate-900 leading-none">Table #{currentTable}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Session Active</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* 3. Mobile / Tablet Left Navigation Drawer (When hamburger or menu is tapped) */}
      {isLeftNavOpen && (
        <>
          <div 
            onClick={() => setIsLeftNavOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden transition-opacity"
            aria-hidden="true"
          />

          <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between py-4 px-3 lg:hidden animate-slide-right">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm">
                    <img src="/tablehive_logo.jpg" alt="TableHive" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-none">TableHive</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Table #{currentTable}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLeftNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile AI Chat Featured Button */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    setIsLeftNavOpen(false);
                    setIsLeftAiChatOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md hover:shadow-purple-500/20 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Bot className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">AI Mitra Chat</span>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </div>
                      <p className="text-[10px] text-purple-200">Dish pairings & café friend</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-200" />
                </button>
              </div>

              {/* Navigation items list */}
              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsLeftNavOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-slate-900 text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-xs font-semibold leading-tight">{item.label}</p>
                          <p className={`text-[10px] leading-tight ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-1">
              <Link 
                href="/admin" 
                onClick={() => setIsLeftNavOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-700"
              >
                <Shield className="w-4 h-4" />
                Staff Admin
              </Link>
              <span className="text-[10px] text-slate-400 font-mono">v1.0 • TableHive</span>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
