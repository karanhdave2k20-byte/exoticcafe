'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../context/StoreContext';

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: number) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-glass border transition-all animate-bounce-short"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              borderColor: isSuccess ? 'rgba(16, 185, 129, 0.4)' : isError ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-highlight)',
              color: 'var(--text-main)',
            }}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {isWarning && <AlertCircle className="w-5 h-5 text-caramel-600 flex-shrink-0" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-caramel-600 flex-shrink-0" />}

            <span className="text-sm font-medium flex-1">{toast.message}</span>

            <button
              onClick={() => onClose(toast.id)}
              className="p-1 rounded-full hover:bg-crema-200 text-roast-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
