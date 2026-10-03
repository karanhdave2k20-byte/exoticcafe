'use client';

import React from 'react';
import { QrCode, LogIn, Users, Sparkles, Utensils, Check } from 'lucide-react';

interface StepperProps {
  currentStep: number; // 1: QR Scan, 2: Login, 3: People, 4: Invite/Vibe, 5: Menu
}

const steps = [
  { step: 1, label: 'Table Scan', icon: QrCode },
  { step: 2, label: 'Sign In', icon: LogIn },
  { step: 3, label: 'Party Size', icon: Users },
  { step: 4, label: 'Vibe & Share', icon: Sparkles },
  { step: 5, label: 'Menu & Order', icon: Utensils },
];

export default function OnboardingStepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full max-w-xl mx-auto py-3 px-3 mb-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting progress bar track */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-[#E8DFD3] -z-0" />
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-caramel-400 to-caramel-600 transition-all duration-500 -z-0"
          style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 24px)` }}
        />

        {steps.map(s => {
          const isDone = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          const Icon = s.icon;

          return (
            <div key={s.step} className="flex flex-col items-center gap-1.5 z-10">
              <div 
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold ${
                  isCurrent 
                    ? 'bg-caramel-500 text-white ring-4 ring-caramel-400/25 scale-110 shadow-gold' 
                    : isDone 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white text-muted border border-warm-border shadow-sm'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-center ${
                isCurrent ? 'text-caramel-800' : isDone ? 'text-emerald-700' : 'text-muted'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
