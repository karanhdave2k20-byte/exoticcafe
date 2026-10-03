'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import BackButton from '../../../components/BackButton';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminUser, showToast } = useStore();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('aura2026');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Unified Admin portal authentication
    if ((u === 'admin' || u === 'manager') && (p === 'aura2026' || p === 'admin123')) {
      const admin = { u: 'admin', token: 'token-tablehive-admin-session' };
      setAdminUser(admin);
      showToast('Welcome to Table Hive Admin Portal! ☕', 'success');
      router.push('/admin');
    } else {
      showToast('Invalid administrator credentials.', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10 flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-start">
        <BackButton href="/" label="Back to Guest Café" />
      </div>
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-warm-subtle text-caramel-600 border border-warm-border mx-auto flex items-center justify-center mb-3 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700">
            Secure Portal 2 of 2
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-roast-900 mt-1">
            Table Hive Admin Portal
          </h1>
          <p className="text-xs text-muted mt-1.5 max-w-xs mx-auto">
            Authorized management for tables, live orders, menu catalog, payments, customer insights, and AI analytics.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold mt-2 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-warm-border flex items-center justify-between text-xs">
          <Link
            href="/"
            className="text-muted hover:text-caramel-700 transition-colors font-medium"
          >
            ← Customer Portal
          </Link>

          <span className="text-[11px] text-muted font-mono bg-warm-subtle px-2 py-0.5 rounded-md border border-warm-border">
            admin / aura2026
          </span>
        </div>
      </div>
    </div>
  );
}
