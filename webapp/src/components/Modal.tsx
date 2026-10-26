'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      {/* Click outside to close backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div 
        className={`w-full ${maxWidth} bg-white border border-caramel-500/20 p-6 relative rounded-3xl shadow-2xl animate-scale-up overflow-hidden z-10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-crema-200">
          {title && <h3 className="text-xl font-serif font-bold text-roast-900 tracking-wide">{title}</h3>}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-crema-100 text-roast-700 transition-colors ml-auto cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto pr-1 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
