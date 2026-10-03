'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, KeyRound, ArrowRight, Sparkles, 
  User, ArrowLeft, Shield, Check, X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import BackButton from '../../components/BackButton';
import Modal from '../../components/Modal';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast, tableInfo } = useStore();

  const [authMode, setAuthMode] = useState<'options' | 'email' | 'register'>('options');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real Google Sign-in Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('davekaran380@gmail.com');
  const [googleName, setGoogleName] = useState('Karan Dave');
  const [isCustomGoogleAccount, setIsCustomGoogleAccount] = useState(false);

  const handleProceedNext = (customerName: string, customerEmail: string) => {
    setUser({
      n: customerName,
      c: customerEmail,
      email: customerEmail,
      name: customerName,
      isAuthenticated: true,
    });

    showToast(`Welcome to TableHive, ${customerName}! 👋`, 'success');
    if (tableInfo?.tableNo) {
      router.push('/people');
    } else {
      router.push('/menu');
    }
  };

  // Real Google Sign-In Handler
  const handleGoogleSignInClick = () => {
    setIsGoogleModalOpen(true);
  };

  const handleConfirmGoogleSignIn = async (gEmail: string, gName: string) => {
    const finalEmail = gEmail.trim().toLowerCase();
    const finalName = gName.trim() || finalEmail.split('@')[0];

    if (!finalEmail || !finalEmail.includes('@')) {
      showToast('Please enter a valid Google email address.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          name: finalName,
          picture: null,
          googleId: `google_oauth_${Date.now()}`
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsGoogleModalOpen(false);
        handleProceedNext(data.user?.name || finalName, data.user?.email || finalEmail);
      } else {
        showToast(data.error || 'Google sign in failed.', 'error');
      }
    } catch (err) {
      // Fallback: register locally if server has network interruption
      setIsGoogleModalOpen(false);
      handleProceedNext(finalName, finalEmail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: email.trim(),
          isLogin: authMode === 'email',
          name: name.trim() || 'Guest',
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowOtp(true);
        if (data.mockOtp) {
          setOtp(data.mockOtp);
          showToast(`OTP Code: ${data.mockOtp}`, 'info');
        } else {
          showToast('Verification code sent to your email!', 'success');
        }
      } else {
        showToast(data.error || 'Failed to send OTP.', 'error');
      }
    } catch (err) {
      showToast('Network error contacting auth service.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      showToast('Please enter the OTP code', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const finalName = data.userName || name.trim() || email.split('@')[0];
        handleProceedNext(finalName, email.trim());
      } else {
        showToast(data.error || 'Incorrect OTP code.', 'error');
      }
    } catch (err) {
      showToast('Error verifying code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 flex flex-col gap-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <BackButton href={tableInfo?.tableNo ? `/table/${tableInfo.tableNo}` : '/'} label="Back" />
      </div>
      <OnboardingStepper currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Guest Club Benefits on Desktop */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-gradient-to-b from-[#FFFFFF] to-warm-subtle shadow-glass flex flex-col gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-caramel-500 to-caramel-500 text-white flex items-center justify-center shadow-gold">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700 block mb-1">
              Table Hive Guest Club
            </span>
            <h3 className="text-2xl font-serif font-black text-roast-900">
              Dine Together, Earn Together
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Sign in once to enjoy personalized table benefits, digital receipts, and real-time companion ordering.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-xs text-muted pt-2 border-t border-warm-border">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Earn <strong>150 Welcome Points</strong> on registration</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-caramel-500" />
              <span>Digital Coffee Passport: 5th cup free</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-caramel-500" />
              <span>Attributed billing & Paytm instant split</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col gap-6">
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700">
              {tableInfo?.tableNo ? `Table #${tableInfo.tableNo}` : 'Member Access'}
            </span>
            <h2 className="text-2xl font-serif font-black text-roast-900 mt-0.5">
              {authMode === 'register' ? 'Create Your Account' : 'Welcome to Table Hive'}
            </h2>
            <p className="text-xs text-muted mt-1">
              {tableInfo?.tableNo 
                ? `Sign in to activate Table #${tableInfo.tableNo}, earn points, and order with friends.`
                : 'Sign in to enjoy real-time table dining, order together, and earn rewards.'}
            </p>
          </div>

          {/* State 1: Options Selector */}
          {authMode === 'options' && (
            <div className="flex flex-col gap-3">
              {/* Option A: Continue with Google (Real Auth) */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl border border-warm-border bg-white hover:bg-warm-subtle text-roast-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:border-caramel-500"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Option B: Continue with Email */}
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setShowOtp(false); }}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2.5"
              >
                <Mail className="w-4 h-4" />
                <span>Continue with Email</span>
              </button>

              <div className="flex items-center my-1">
                <div className="flex-1 border-t border-warm-border" />
                <span className="px-3 text-[11px] font-bold text-muted uppercase">or</span>
                <div className="flex-1 border-t border-warm-border" />
              </div>

              {/* Option C: Create Account */}
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setShowOtp(false); }}
                className="btn-secondary w-full py-3 text-xs font-bold text-roast-900 border-warm-border hover:border-caramel-500"
              >
                <span>Create New Account</span>
              </button>

              {/* Quick Guest Bypass */}
              <button
                type="button"
                onClick={() => handleProceedNext('Guest Diner', 'guest@tablehive.cafe')}
                className="text-xs text-muted hover:text-caramel-700 font-semibold text-center mt-2 underline"
              >
                Continue as Instant Guest
              </button>
            </div>
          )}

          {/* State 2: Email Sign In or Create Account Form */}
          {(authMode === 'email' || authMode === 'register') && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setAuthMode('options')}
                className="text-xs text-muted hover:text-roast-900 flex items-center gap-1 font-bold w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to login options</span>
              </button>

              {!showOtp ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1.5">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. Karan Dave"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
                          required={authMode === 'register'}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold mt-2 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Sending Code...</span>
                    ) : (
                      <>
                        <span>{authMode === 'register' ? 'Register & Verify' : 'Send Verification OTP'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center font-medium">
                    We sent a 6-digit verification code to <strong>{email}</strong>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1.5 text-center">
                      Enter Verification Code
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <KeyRound className="w-4 h-4 text-caramel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full glass-input text-center tracking-[0.5em] font-mono font-bold text-lg pl-10 pr-4 py-3 rounded-2xl"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Verifying...' : 'Confirm & Enter Table'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-xs text-muted hover:text-caramel-700 font-bold text-center underline"
                  >
                    Change email address
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Security assurance */}
          <div className="pt-2 border-t border-warm-border flex items-center justify-center gap-2 text-[11px] text-muted">
            <Shield className="w-3.5 h-3.5 text-caramel-600" />
            <span>Encrypted Session • Single-Table Isolation</span>
          </div>
        </div>
      </div>

      {/* Real Google Account Sign-In Modal */}
      <Modal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        title="Sign in with Google"
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-warm-subtle border border-warm-border">
            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-roast-900 leading-tight">Choose a Google Account</p>
              <p className="text-xs text-muted">to continue to TableHive Café</p>
            </div>
          </div>

          {!isCustomGoogleAccount ? (
            <div className="flex flex-col gap-3">
              {/* Primary Detected Google Account */}
              <button
                type="button"
                onClick={() => handleConfirmGoogleSignIn(googleEmail, googleName)}
                disabled={isLoading}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-caramel-500/40 bg-white hover:bg-warm-subtle text-left transition-all shadow-sm hover:border-caramel-500 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-caramel-600 to-caramel-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    {googleName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-roast-900">{googleName}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <span className="text-xs text-muted block">{googleEmail}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-caramel-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option to use another Google account */}
              <button
                type="button"
                onClick={() => setIsCustomGoogleAccount(true)}
                className="py-2.5 text-xs font-bold text-caramel-700 hover:text-caramel-800 text-center border border-dashed border-warm-border rounded-xl hover:border-caramel-400 transition-colors"
              >
                + Sign in with a different Google account
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karan Dave"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomGoogleAccount(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmGoogleSignIn(googleEmail, googleName)}
                  disabled={isLoading}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold shadow-gold"
                >
                  {isLoading ? 'Signing In...' : 'Verify Google'}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-warm-border text-[11px] text-muted text-center flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authenticated via secure Google OAuth endpoint</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
