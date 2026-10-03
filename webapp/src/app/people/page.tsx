'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, User, ArrowRight, ArrowLeft, Sparkles, UserPlus, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import BackButton from '../../components/BackButton';

export default function PeopleCountPage() {
  const router = useRouter();
  const { tableInfo, startTableSession, showToast, user } = useStore();

  const [count, setCount] = useState<number>(tableInfo?.peopleCount || 2);
  const [step, setStep] = useState<1 | 2>(1);

  const initialNames = () => {
    if (tableInfo?.guestNames && tableInfo.guestNames.length > 0) {
      return tableInfo.guestNames;
    }
    return [user?.n || user?.name || 'Karan'];
  };

  const [names, setNames] = useState<string[]>(initialNames());

  const handleSelectCount = (num: number) => {
    setCount(num);
  };

  const handleNextToNames = () => {
    const adjustedNames = Array(count).fill('');
    for (let i = 0; i < Math.min(names.length, count); i++) {
      adjustedNames[i] = names[i];
    }
    if (!adjustedNames[0]) {
      adjustedNames[0] = user?.n || user?.name || 'Host';
    }
    setNames(adjustedNames);
    setStep(2);
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...names];
    updated[index] = val;
    setNames(updated);
  };

  const handleFinish = async () => {
    const cleanedNames = names.map(n => n.trim()).filter(Boolean);
    const finalNames = cleanedNames.length > 0 ? cleanedNames : [user?.n || 'Guest'];

    const tableNo = tableInfo?.tableNo || '1';
    await startTableSession(tableNo, finalNames, count);

    showToast(`Table #${tableNo} party registered with ${finalNames.length} guests! 🎉`, 'success');
    router.push('/invite');
  };

  const presetCounts = [
    { num: 1, label: '1 Person' },
    { num: 2, label: '2 People' },
    { num: 3, label: '3 People' },
    { num: 4, label: '4 People' },
    { num: 5, label: '5+ People' },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <BackButton href="/login" label="Back" />
      </div>
      <OnboardingStepper currentStep={3} />

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-glass">
        {step === 1 ? (
          <div className="flex flex-col items-center text-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-50 border border-caramel-200 text-caramel-800 text-xs font-bold tracking-widest uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
                <span>Table #{tableInfo?.tableNo || '05'} Session</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-roast-900">
                How many people are sitting at this table?
              </h2>
              <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
                Setting your party count helps our kitchen prepare table place settings and configures the collaborative shared cart.
              </p>
            </div>

            {/* Quick Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
              {presetCounts.map(item => (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => handleSelectCount(item.num)}
                  className={`py-3.5 px-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    count === item.num
                      ? 'border-caramel-500 bg-caramel-50 text-caramel-800 shadow-sm scale-102 font-black'
                      : 'border-warm-border bg-warm-subtle text-roast-800 hover:border-caramel-500 hover:bg-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-caramel-600" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleNextToNames}
              className="btn-primary w-full max-w-md py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group mt-2"
            >
              <span>Next: Enter Seated Names ({count} {count === 1 ? 'person' : 'people'})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-muted hover:text-roast-900 flex items-center gap-1 font-bold mb-2 mx-auto w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change party size ({count} guests)</span>
              </button>
              <h3 className="text-2xl font-serif font-black text-roast-900">
                Who is seated at Table #{tableInfo?.tableNo || '05'}?
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Enter names to attribute dishes in the shared cart and personalize order splits.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
              {names.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-caramel-50 text-caramel-700 border border-caramel-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    #{i + 1}
                  </div>
                  <div className="relative flex-1">
                    <User className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={i === 0 ? "Your Name (e.g. Karan)" : `Friend #${i + 1} Name`}
                      value={name}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 max-w-md mx-auto w-full">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary py-3.5 px-5 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="btn-primary flex-1 py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group"
              >
                <span>Confirm & Invite Friends</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
