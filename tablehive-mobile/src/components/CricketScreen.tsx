import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Flame, Plus, Sparkles, MapPin } from 'lucide-react';
import { CricketMatch, MenuItem } from '../types';

interface CricketScreenProps {
  onAddSnackToCart: (snackName: string) => void;
  tableNumber: number;
}

export const CricketScreen: React.FC<CricketScreenProps> = ({
  onAddSnackToCart,
  tableNumber,
}) => {
  const [matches, setMatches] = useState<CricketMatch[]>([
    {
      id: 'm-1',
      series: 'ICC Champions Trophy Warm-up / Super Clash',
      format: 'T20 International',
      team1: { name: 'India', fullScore: '188/4 (20.0 ov)' },
      team2: { name: 'Australia', fullScore: '142/6 (16.2 ov)' },
      status: 'Australia need 47 runs in 22 balls • Live Match',
      venue: 'Eden Gardens, Kolkata',
    },
    {
      id: 'm-2',
      series: 'IPL Pre-Season Thriller',
      format: 'T20 Match',
      team1: { name: 'Mumbai Indians', fullScore: '204/5 (20.0 ov)' },
      team2: { name: 'Chennai Super Kings', fullScore: '198/7 (20.0 ov)' },
      status: 'Mumbai Indians won by 6 runs',
      venue: 'Wankhede Stadium, Mumbai',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const cheerSnacks = [
    { name: 'Crispy Peri-Peri Fries', price: 160, desc: 'Hot & spicy crispy potato strips for the final death overs!', image: '/fries.jpg' },
    { name: 'Artisan Cappuccino', price: 180, desc: 'Freshly pulled espresso with velvety foam.', image: '/cappuccino.png' },
    { name: 'Wood-fired Margherita Pizza', price: 299, desc: 'San Marzano tomato sauce, fresh mozzarella & sweet basil.', image: '/margherita_pizza.jpg' },
  ];

  const fetchLiveMatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cricket/live');
      if (res.ok) {
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches);
        }
      }
    } catch (e) {
      // Use existing simulated match feed
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-xs text-slate-900">TableHive Match Lounge</h3>
            <p className="text-[11px] text-slate-500">Live cricket commentary for Table #{tableNumber}</p>
          </div>
        </div>

        <button
          onClick={fetchLiveMatches}
          disabled={isLoading}
          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Match Cards */}
      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl space-y-3 border border-slate-700/60"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-extrabold text-amber-400 uppercase tracking-wide">
                {m.format}
              </span>
              <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 font-black px-2 py-0.5 rounded-full border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                LIVE
              </span>
            </div>

            <p className="text-xs font-bold text-slate-200 truncate">{m.series}</p>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/10">
              <div>
                <p className="text-[11px] text-slate-400 font-bold">{m.team1.name}</p>
                <p className="text-base font-black text-white">{m.team1.fullScore || '188/4'}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-bold">{m.team2.name}</p>
                <p className="text-base font-black text-amber-400">{m.team2.fullScore || '142/6'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <p className="font-bold text-emerald-400">{m.status}</p>
              {m.venue && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {m.venue}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cheer Snacks Recommendation Section */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
          <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
            Match-Day Cheer Snacks
          </h4>
        </div>

        <div className="space-y-2">
          {cheerSnacks.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-slate-900 truncate">{s.name}</h5>
                  <p className="text-[10px] text-slate-500 truncate">{s.desc}</p>
                  <p className="font-black text-xs text-brand-700 mt-0.5">₹{s.price}</p>
                </div>
              </div>

              <button
                onClick={() => onAddSnackToCart(s.name)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ORDER</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
