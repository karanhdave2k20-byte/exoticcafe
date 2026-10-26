'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { 
  Mail, KeyRound, ArrowRight, Sparkles, 
  User, ArrowLeft, Shield
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import BackButton from '../../components/BackButton';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '485418282341-8e8s1kau42rnkch9aohq3cek56v4hiji.apps.googleusercontent.com';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast, tableInfo, setTableInfo } = useStore();

  const [authMode, setAuthMode] = useState<'options' | 'email' | 'register'>('options');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  const tokenClientRef = useRef<any>(null);

  // 1. Official Google Identity Services callback (From GIS iframe button)
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        await handleProceedNext(data.user.name, data.user.email);
      } else {
        showToast(data.error || 'Google login failed.', 'error');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      showToast('Could not verify Google account.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Initialize Google Identity Services & OAuth2 popup client
  const initializeGoogleGsi = () => {
    if (typeof window === 'undefined' || !(window as any).google?.accounts) return;

    try {
      // Initialize GIS ID service
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render official Google button into the container
      const btnElement = document.getElementById('googleSignInBtn');
      if (btnElement) {
        btnElement.innerHTML = ''; // clear any stale render
        (window as any).google.accounts.id.renderButton(btnElement, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'center',
        });
      }

      // Initialize OAuth2 Token Client for instant popup on click
      if ((window as any).google.accounts.oauth2) {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              setIsLoading(true);
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userProfile = await userRes.json();
                if (userProfile?.email) {
                  const authRes = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: userProfile.email,
                      name: userProfile.name || userProfile.email.split('@')[0],
                      picture: userProfile.picture,
                      googleId: userProfile.sub,
                    }),
                  });
                  const authData = await authRes.json();
                  const confirmedName = authData.user?.name || userProfile.name || 'Guest Diner';
                  const confirmedEmail = authData.user?.email || userProfile.email;
                  await handleProceedNext(confirmedName, confirmedEmail);
                }
              } catch (err) {
                console.error('Google profile fetch error:', err);
                showToast('Failed to retrieve Google profile.', 'error');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
      }

      setGisLoaded(true);
    } catch (e) {
      console.error('GIS Init Error:', e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      initializeGoogleGsi();
    } else {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
          initializeGoogleGsi();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [authMode]);

  // Click handler for fallback or custom button trigger
  const handleGoogleCustomClick = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      showToast('Connecting to Google...', 'info');
      initializeGoogleGsi();
    }
  };

  const handleProceedNext = async (customerName: any, customerEmail: any) => {
    const finalName = typeof customerName === 'string' && customerName.trim() ? customerName.trim() : 'Guest Diner';
    const finalEmail = typeof customerEmail === 'string' && customerEmail.trim() ? customerEmail.trim() : 'guest@tablehive.cafe';

    const userProfile = {
      n: finalName,
      c: finalEmail,
      email: finalEmail,
      name: finalName,
      isAuthenticated: true,
    };
    setUser(userProfile);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('th_user', JSON.stringify(userProfile));
      } catch (err) {}
    }

    const savedTableNo = typeof window !== 'undefined' ? localStorage.getItem('th_table_no') : null;
    const activeTable = tableInfo?.tableNo || savedTableNo || '7';

    if (setTableInfo) {
      setTableInfo(prev => ({
        ...prev,
        tableNo: String(activeTable),
      }));
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('th_table_no', String(activeTable));
    }

    showToast(`Welcome ${finalName}! Signed in successfully. 🎉`, 'success');

    // Route sequentially to Step 3: Party Size (/people)
    router.push('/people');
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
        {/* Left Column: Guest Club Benefits */}
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
              Sign in once with Google to enjoy personalized table benefits, digital receipts, and real-time companion ordering.
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
            <div className="flex flex-col gap-3.5">
              {/* Option A: Direct Official Google Sign-In */}
              <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
                {/* Official Google Identity Services Render Container */}
                <div id="googleSignInBtn" className="flex justify-center w-full" />
                
                {/* Immediate Clickable Fallback Button (Triggers native Google popup if iframe hasn't rendered yet) */}
                {!gisLoaded && (
                  <button
                    type="button"
                    onClick={handleGoogleCustomClick}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>

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
                className="text-xs text-muted hover:text-caramel-700 font-semibold text-center mt-2 underline cursor-pointer"
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
                className="text-xs text-muted hover:text-roast-900 flex items-center gap-1 font-bold w-fit cursor-pointer"
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
                          placeholder="e.g. Rahul Patel"
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
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold mt-2 flex items-center justify-center gap-2 cursor-pointer"
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
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-gold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? 'Verifying...' : 'Confirm & Enter Table'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-xs text-muted hover:text-caramel-700 font-bold text-center underline cursor-pointer"
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

      {/* Google Identity Services SDK for Real Google Account Popup */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogleGsi}
      />
    </div>
  );
}
