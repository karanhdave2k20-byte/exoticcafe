'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PackageCheck, CheckCircle2, ChefHat, UtensilsCrossed, 
  Coffee, Clock, Bell, Gamepad2, ArrowRight, Sparkles, Receipt 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrder = searchParams.get('order');

  const { orderStatus, currentOrderId, adminOrders, tableInfo, callWaiter } = useStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const targetOrderId = queryOrder || currentOrderId;
  const activeOrder = useMemo(() => {
    return adminOrders.find(o => o.o === targetOrderId) || null;
  }, [adminOrders, targetOrderId]);

  // Exact 6 timeline stages from Section 11
  const timelineStages = [
    { key: 'placed', label: 'Order placed', icon: PackageCheck, desc: 'Ticket sent to kitchen' },
    { key: 'accepted', label: 'Order accepted', icon: CheckCircle2, desc: 'Kitchen acknowledged order' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Chef & barista crafting items' },
    { key: 'ready', label: 'Ready', icon: UtensilsCrossed, desc: 'Plated hot & ready at pass' },
    { key: 'served', label: 'Served', icon: Coffee, desc: 'Delivered to your table' },
    { key: 'completed', label: 'Completed', icon: Sparkles, desc: 'Order fulfilled & bill settled' },
  ];

  // Resolve current active stage index
  const resolvedStatus = (activeOrder?.s || orderStatus || 'New').toLowerCase();
  
  const getStageIndex = () => {
    if (resolvedStatus.includes('new') || resolvedStatus.includes('placed') || resolvedStatus.includes('received')) return 0;
    if (resolvedStatus.includes('accept')) return 1;
    if (resolvedStatus.includes('prep')) return 2;
    if (resolvedStatus.includes('ready')) return 3;
    if (resolvedStatus.includes('serv') || resolvedStatus.includes('deliver')) return 4;
    if (resolvedStatus.includes('complete') || resolvedStatus.includes('done')) return 5;
    return 0;
  };

  const currentStageIndex = getStageIndex();
  const progressPercent = Math.min(100, Math.max(16, ((currentStageIndex + 1) / timelineStages.length) * 100));

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!targetOrderId && !activeOrder) {
    return (
      <div className="max-w-md mx-auto py-10 flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-start">
          <BackButton href="/menu" label="Back to Menu" />
        </div>
        <div className="text-center flex flex-col items-center gap-4 glass-card rounded-3xl p-8 bg-white border border-warm-border shadow-glass">
        <div className="w-16 h-16 rounded-2xl bg-warm-subtle text-caramel-600 border border-warm-border flex items-center justify-center">
          <Clock className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700">
          Table #{tableInfo?.tableNo || '05'}
        </span>
        <h2 className="text-2xl font-serif font-black text-roast-900">
          No Active Order Yet
        </h2>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          No order is being prepped for Table #{tableInfo?.tableNo || '05'}. Browse the menu and place your order together!
        </p>
          <Link
            href="/menu"
            className="btn-primary px-8 py-3.5 text-xs font-bold shadow-gold mt-2"
          >
            Explore Café Menu 🍽️
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <BackButton href="/menu" label="Back to Menu" />
      </div>
      {/* Tracker Status Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col items-center text-center gap-6 relative overflow-hidden">
        {/* Progress bar top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-warm-subtle">
          <div 
            className="h-full bg-gradient-to-r from-caramel-500 via-caramel-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Order Info Badge */}
        <div className="flex items-center justify-between w-full text-xs text-muted pt-2 border-b border-warm-border pb-3">
          <div className="flex items-center gap-1.5 font-bold text-roast-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono">Order #{targetOrderId}</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-caramel-50 text-caramel-800 font-bold border border-caramel-200">
            Table #{tableInfo?.tableNo || activeOrder?.t || '05'}
          </span>
        </div>

        {/* Dynamic Status Icon Display */}
        <div className="w-20 h-20 rounded-3xl bg-warm-subtle text-caramel-600 border-2 border-caramel-500/40 flex items-center justify-center shadow-gold">
          {React.createElement(timelineStages[currentStageIndex].icon, {
            className: 'w-10 h-10 animate-pulse-subtle'
          })}
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700">
            Current Stage
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-roast-900 mt-0.5">
            {timelineStages[currentStageIndex].label}
          </h2>
          <p className="text-xs text-muted mt-1 max-w-sm">
            {timelineStages[currentStageIndex].desc}
          </p>
        </div>

        {/* Timer ticker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-subtle border border-warm-border text-xs font-bold text-roast-800 font-mono">
          <Clock className="w-3.5 h-3.5 text-caramel-600" />
          <span>Kitchen Active: {formatTimer(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Clean 6-Step Order Timeline (Section 11) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-caramel-700">
          Order Timeline
        </h3>

        <div className="relative pl-6 flex flex-col gap-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8DFD3]">
          {timelineStages.map((stage, idx) => {
            const isFinished = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            return (
              <div key={stage.key} className="relative flex items-start gap-4">
                {/* Node icon */}
                <div className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isFinished 
                    ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50' 
                    : isCurrent 
                    ? 'bg-caramel-500 text-white shadow-gold ring-4 ring-caramel-100 animate-pulse'
                    : 'bg-warm-subtle border border-warm-border text-muted'
                }`}>
                  {isFinished ? '✓' : idx + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-caramel-700 font-black' : isFinished ? 'text-roast-900' : 'text-muted'}`}>
                      {stage.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold text-caramel-600 tracking-wider bg-caramel-50 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/pay?order=${targetOrderId}`}
          className="glass-card p-4 rounded-2xl border border-warm-border bg-white hover:border-caramel-500 transition-all flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warm-subtle text-caramel-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-roast-900">Pay / Split Bill</h4>
              <p className="text-[11px] text-muted">Paytm, UPI or split per companion</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-caramel-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/fun"
          className="glass-card p-4 rounded-2xl border border-warm-border bg-white hover:border-caramel-500 transition-all flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warm-subtle text-caramel-600 flex items-center justify-center font-bold">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-roast-900">Entertainment Hub</h4>
              <p className="text-[11px] text-muted">Play mini-games & listen to Lo-Fi</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-caramel-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Quick Waiter Call Service */}
      <div className="p-4 rounded-2xl bg-warm-subtle border border-warm-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-muted">
          <Bell className="w-4 h-4 text-caramel-600" />
          <span>Need water, tissues, or cutlery?</span>
        </div>
        <button
          onClick={() => callWaiter('Quick Service Request')}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-warm-border text-roast-900 font-bold text-xs hover:border-caramel-500 transition-colors shadow-sm"
        >
          Summon Waiter
        </button>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto py-16 text-center text-caramel-600">
        <div className="w-8 h-8 rounded-full border-2 border-caramel-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted">Loading live kitchen timeline...</p>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
