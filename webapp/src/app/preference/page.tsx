'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Trophy, Newspaper, Video, Music, Gamepad2, 
  Film, MoreHorizontal, ArrowRight, ArrowLeft, CheckCircle2 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import BackButton from '../../components/BackButton';

export default function PreferencePage() {
  const router = useRouter();
  const { tableInfo, setSessionInterests, showToast } = useStore();

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    tableInfo?.interests || ['Cricket', 'Music']
  );

  const interestOptions = [
    { id: 'Cricket', label: 'Cricket', icon: Trophy, desc: 'Live match scorecards & highlights', color: 'text-caramel-600 bg-caramel-50' },
    { id: 'News', label: 'News', icon: Newspaper, desc: 'Curated world, culinary & tech updates', color: 'text-blue-600 bg-blue-50' },
    { id: 'AI Barista', label: 'AI Barista', icon: Sparkles, desc: 'Chat with our Gemini Culinary Companion', color: 'text-amber-600 bg-amber-50' },
    { id: 'Short Videos', label: 'Short Videos', icon: Video, desc: 'Aesthetic café clips & food craft shorts', color: 'text-rose-600 bg-rose-50' },
    { id: 'Music', label: 'Music', icon: Music, desc: 'Ambient lo-fi beats & café jazz chords', color: 'text-purple-600 bg-purple-50' },
    { id: 'Games', label: 'Games', icon: Gamepad2, desc: '2048 café puzzle & table challenges', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'Movies', label: 'Movies', icon: Film, desc: 'Trending trailers & cinematic trivia', color: 'text-indigo-600 bg-indigo-50' },
    { id: 'Other', label: 'Other', icon: MoreHorizontal, desc: 'Trivia, conversation starters & jokes', color: 'text-stone-600 bg-stone-50' },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      showToast('Select at least one interest to personalize your wait!', 'warning');
      return;
    }

    await setSessionInterests(selectedInterests);
    showToast('Entertainment preferences saved! Opening menu... 🍽️', 'success');
    router.push('/menu');
  };

  return (
    <div className="max-w-5xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <BackButton href="/invite" label="Back" />
      </div>
      <OnboardingStepper currentStep={5} />

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col gap-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-50 border border-caramel-200 text-caramel-800 text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            <span>Personalized Table Ambiance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-roast-900">
            What would you like to explore?
          </h2>
          <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
            Select your table party&apos;s interests to personalize your waiting lounge and entertainment experience while your food is prepared.
          </p>
        </div>

        <form onSubmit={handleProceed} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {interestOptions.map(option => {
              const Icon = option.icon;
              const isSelected = selectedInterests.includes(option.id);

              return (
                <div
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-caramel-500 bg-caramel-50/70 shadow-sm'
                      : 'border-warm-border bg-white hover:border-caramel-400 hover:bg-warm-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${option.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-roast-900">{option.label}</h4>
                      <p className="text-[11px] text-muted">{option.desc}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-caramel-500 border-caramel-500 text-white'
                      : 'border-warm-border bg-white'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/invite')}
              className="btn-secondary py-3.5 px-4 text-xs font-bold text-muted hover:text-roast-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="submit"
              className="btn-primary flex-1 py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group"
            >
              <span>Explore Café Menu & Shared Cart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
