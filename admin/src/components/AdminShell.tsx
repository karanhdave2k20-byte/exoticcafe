'use client';

import React, { ReactNode } from 'react';
import { useStore } from '../context/StoreContext';
import Toast from './Toast';

export default function AdminShell({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useStore();

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
        {children}
      </div>
    </>
  );
}
