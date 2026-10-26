import React from 'react';
import { Utensils, ShoppingBag, Sparkles, Music2, Trophy } from 'lucide-react';

export type TabType = 'menu' | 'cart' | 'ai' | 'music' | 'cricket';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
  isPlayingMusic: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  isPlayingMusic,
}) => {
  const navItems = [
    { id: 'menu' as TabType, label: 'Menu', icon: Utensils },
    { id: 'cart' as TabType, label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { id: 'ai' as TabType, label: 'AI Mitra', icon: Sparkles, highlight: true },
    { id: 'music' as TabType, label: 'Music', icon: Music2, isLiveAudio: isPlayingMusic },
    { id: 'cricket' as TabType, label: 'Cricket', icon: Trophy, liveDot: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-50 px-3 py-2 pb-safe shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-brand-600 scale-105 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  } ${item.highlight && isActive ? 'text-purple-600' : ''}`}
                />

                {/* Cart Badge */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {item.badge}
                  </span>
                )}

                {/* Audio Equalizer Mini Icon */}
                {item.isLiveAudio && (
                  <span className="absolute -top-1 -right-2 flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-amber-500 animate-equalizer-1" />
                    <span className="w-0.5 bg-amber-500 animate-equalizer-2" />
                    <span className="w-0.5 bg-amber-500 animate-equalizer-3" />
                  </span>
                )}

                {/* Cricket Live Red Dot */}
                {item.liveDot && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  isActive ? 'font-bold' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-brand-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
