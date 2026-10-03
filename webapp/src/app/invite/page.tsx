'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Send, CheckCircle2, Users, ArrowRight, Sparkles, 
  ArrowLeft, Clock, AlertCircle, ShieldCheck, Copy, Check 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import BackButton from '../../components/BackButton';

export default function InviteFriendsPage() {
  const router = useRouter();
  const { tableInfo, currentSession, sendEmailInvite, showToast, serverIp } = useStore();

  const [emailInput, setEmailInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const tableNo = tableInfo?.tableNo || '05';
  const sessionId = currentSession?.sessionId || '';

  const tableInviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/table/${tableNo}?session=${sessionId}&invite=true`
    : `http://${serverIp}:5174/table/${tableNo}?session=${sessionId}&invite=true`;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsSending(true);
    const success = await sendEmailInvite(emailInput.trim());
    setIsSending(false);

    if (success) {
      setInvitedEmails(prev => [...prev, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableInviteUrl);
    setCopied(true);
    showToast('Direct table session link copied! 📋', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleContinue = () => {
    router.push('/preference');
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <BackButton href="/people" label="Back" />
      </div>
      <OnboardingStepper currentStep={4} />

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col gap-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-50 border border-caramel-200 text-caramel-800 text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            <span>Active Table #{tableNo} Session</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-roast-900">
            Invite Your Friends
          </h2>
          <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
            Invite companions to join your active table session via email. When they open the link, they enter directly into your shared table cart!
          </p>
        </div>

        {/* Email Only Invitation Form (as specified in Section 4) */}
        <div className="p-5 rounded-2xl bg-warm-subtle border border-warm-border flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider font-extrabold text-caramel-700">
            Send Email Invitation
          </span>

          <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="friend@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="btn-primary py-3 px-6 text-xs font-bold shadow-gold flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </form>

          {/* Delivered Invites History */}
          {invitedEmails.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-muted">Invitations Sent:</span>
              <div className="flex flex-wrap gap-2">
                {invitedEmails.map((em, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{em}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seated Table Members */}
        {tableInfo?.guestNames && tableInfo.guestNames.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-caramel-600" />
                <span>Seated at Table #{tableNo} ({tableInfo.guestNames.length}):</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">● Active Session</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tableInfo.guestNames.map((name, i) => (
                <div
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-warm-border text-roast-800 text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-caramel-500" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Session Link for manual copying */}
        <div className="p-3.5 rounded-2xl border border-dashed border-warm-border flex items-center justify-between gap-3 text-xs">
          <div className="truncate text-muted">
            <span className="font-bold text-roast-900 block text-[11px]">Table Session Link:</span>
            <span className="font-mono text-[11px] truncate block max-w-xs">{tableInviteUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="p-2.5 rounded-xl bg-white border border-warm-border text-roast-900 hover:border-caramel-500 transition-all font-bold text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Progression buttons without restarting */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/people')}
            className="btn-secondary py-3.5 px-4 text-xs font-bold text-muted hover:text-roast-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary flex-1 py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group"
          >
            <span>Continue to Entertainment & Interests</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
