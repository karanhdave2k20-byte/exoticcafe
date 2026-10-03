'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Coffee, Heart, CheckCircle2, QrCode, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

export default function ThankYouPage() {
  const { user, loyaltyPoints, logoutCustomer } = useStore();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F3C56C', '#E5A93C', '#10B981', '#ffffff'],
      });
    } catch (e) {}
  }, []);

  return (
    <div className="max-w-md mx-auto py-8 text-center flex flex-col items-center gap-6 animate-fade-in">
      <div className="w-full flex items-center justify-start">
        <BackButton href="/menu" label="Back to Menu" />
      </div>
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-caramel-400 to-caramel-600 p-1 shadow-gold flex items-center justify-center animate-bounce-short">
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center border border-caramel-200 shadow-inner">
          <Heart className="w-12 h-12 text-caramel-500 fill-caramel-500" />
        </div>
      </div>

      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-caramel-600">
          Heartfelt Thanks
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-roast-900 mt-1">
          Thank You, {user?.n || user?.name || 'Friend'}!
        </h1>
        <p className="text-xs text-muted mt-2 leading-relaxed max-w-xs mx-auto">
          We hope you had a memorable culinary journey with us at Exotic Café. Your presence makes our café vibrant.
        </p>
      </div>

      {/* Loyalty Reward Card */}
      <div className="w-full glass-card p-5 rounded-3xl border border-caramel-500/20 shadow-glass flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-caramel-600">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Loyalty Club Balance</span>
        </div>
        <span className="text-4xl font-serif font-black text-roast-900 font-mono">
          {loyaltyPoints} PTS
        </span>
        <p className="text-[11px] text-muted">
          Redeem on your next visit for artisanal pastries and hand-dripped coffees.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full flex flex-col gap-3 mt-2">
        <Link
          href="/menu"
          className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold"
        >
          <Coffee className="w-4 h-4" />
          <span>Order More Coffee or Food</span>
        </Link>

        <button
          onClick={() => {
            logoutCustomer();
            window.location.href = '/';
          }}
          className="btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Complete Visit & Leave Table</span>
        </button>
      </div>
    </div>
  );
}
