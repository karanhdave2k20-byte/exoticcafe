import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Lock, KeyRound, Globe, Chrome } from 'lucide-react';
import { useStore } from '../../StoreContext';
import WebAppHeader from '../../components/WebAppHeader';
import OnboardingStepper from '../../components/OnboardingStepper';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, showToast, tableInfo, setTableInfo } = useStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleUser, setCustomGoogleUser] = useState({ name: '', email: '' });
  const [isAddingGoogleAccount, setIsAddingGoogleAccount] = useState(false);

  const [formData, setFormData] = useState({ name: '', contact: '', password: '', otp: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (forgotMode) {
      showToast('Password reset link sent to your contact! ✉️', 'success');
      setForgotMode(false);
      return;
    }

    if (!showOtp) {
      if (!formData.contact) return showToast("Contact (Phone/Email) is required", "error");
      
      // OTP send or password validation
      try {
        const response = await fetch(`/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contact: formData.contact, 
            isLogin,
            name: formData.name, 
            password: formData.password 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setShowOtp(true);
          if (data.mockOtp) {
            showToast(`OTP Auto-filled: ${data.mockOtp}`, 'success');
            setFormData(prev => ({ ...prev, otp: data.mockOtp })); 
          } else {
             showToast(`Verification code sent successfully!`, 'success');
          }
        } else {
          showToast(data.error || "Authentication failed.", 'error');
        }
      } catch (error) {
        showToast("Server Connection Error.", 'error');
      }
    } else {
      // OTP Verification
      try {
        const response = await fetch(`/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: formData.contact, otp: formData.otp })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          const finalName = data.userName || formData.name || 'Regular Customer';
          setUser({ n: finalName, c: formData.contact, isAuthenticated: true, token: data.token });
          showToast(`Welcome back, ${finalName}! 👋`, 'success');
          if (tableInfo?.tableNo) {
            navigate('/people');
          } else {
            navigate('/menu');
          }
        } else {
           showToast(data.error || "Incorrect code.", 'error');
        }
      } catch (error) {
        showToast("Verification Server Error.", 'error');
      }
    }
  };

  const handleGoogleLogin = () => {
    setShowGoogleChooser(true);
  };

  const handleSelectGoogleAccount = (name, email) => {
    setShowGoogleChooser(false);
    showToast("Connecting to Google authentication...", "info");
    setTimeout(() => {
      setUser({ n: name, c: email, isAuthenticated: true });
      showToast(`Logged in as ${name}! 🚀`, "success");
      if (tableInfo?.tableNo) {
        navigate('/people');
      } else {
        navigate('/menu');
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <WebAppHeader />

      {tableInfo?.tableNo && (
        <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
          <OnboardingStepper currentStep={2} />
        </div>
      )}

      <div style={{ maxWidth: '480px', margin: '3rem auto 0 auto', padding: '0 1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(212,163,115,0.2)' }}>
          
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '0.5rem', textAlign: 'center' }}>
            {forgotMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join the Club'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
            {forgotMode ? 'Enter your contact details to recover your account' : 'Order and earn premium loyalty rewards'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} autoComplete="off">
            
            {forgotMode ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email or Phone:</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Enter email or phone"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="off"
                    required 
                  />
                </div>
              </div>
            ) : (
              <>
                {!isLogin && !showOtp && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Full Name:</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        style={{ paddingLeft: '2.5rem' }}
                        autoComplete="off"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {!showOtp ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email or Phone:</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          placeholder="email@example.com or phone"
                          value={formData.contact}
                          onChange={(e) => setFormData({...formData, contact: e.target.value})}
                          style={{ paddingLeft: '2.5rem' }}
                          autoComplete="new-username"
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Password:</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          style={{ paddingLeft: '2.5rem' }}
                          autoComplete="new-password"
                          required 
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Verification Code (OTP):</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Enter 4-digit code"
                        value={formData.otp}
                        onChange={(e) => setFormData({...formData, otp: e.target.value})}
                        style={{ paddingLeft: '2.5rem' }}
                        required 
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Remember Me and Forgot Password links */}
            {!forgotMode && !showOtp && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} style={{ width: 'auto', accentColor: 'var(--primary-color)' }} />
                  Remember Me
                </label>
                <button type="button" onClick={() => setForgotMode(true)} style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem', marginTop: '0.5rem' }}>
              {forgotMode ? 'Send Reset Link' : showOtp ? 'Verify Code' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {/* Social login divider */}
          {!showOtp && !forgotMode && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR CONTINUES WITH</span>
                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }}></div>
              </div>

              <button onClick={handleGoogleLogin} className="btn btn-outline btn-block" style={{ gap: '0.8rem', padding: '0.8rem' }}>
                <Chrome size={18} /> Google Login
              </button>
            </>
          )}

          {/* Toggle form mode */}
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {forgotMode ? (
              <button onClick={() => setForgotMode(false)} style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                Back to Login
              </button>
            ) : (
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setShowOtp(false); }} 
                  style={{ color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

      {showGoogleChooser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '380px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowGoogleChooser(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: '1'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center' }}>
              <Chrome size={32} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', margin: '0 auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.2rem', marginTop: '0.5rem' }}>
                Sign in with Google
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                to continue to Exotic Café
              </p>
            </div>

            {!isAddingGoogleAccount ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button 
                  onClick={() => handleSelectGoogleAccount('Karan Dave', 'karanhdave2k20@gmail.com')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    color: '#121212',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    K
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Karan Dave</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>karanhdave2k20@gmail.com</div>
                  </div>
                </button>

                <button 
                  onClick={() => setIsAddingGoogleAccount(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.8rem',
                    border: '1px dashed var(--text-muted)',
                    borderRadius: '10px',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px dashed currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    +
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Use another account</div>
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customGoogleUser.name && customGoogleUser.email) {
                    handleSelectGoogleAccount(customGoogleUser.name, customGoogleUser.email);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Name:</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={customGoogleUser.name}
                    onChange={(e) => setCustomGoogleUser({ ...customGoogleUser, name: e.target.value })}
                    required
                    style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email Address:</label>
                  <input 
                    type="email" 
                    placeholder="name@gmail.com"
                    value={customGoogleUser.email}
                    onChange={(e) => setCustomGoogleUser({ ...customGoogleUser, email: e.target.value })}
                    required
                    style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.8rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsAddingGoogleAccount(false);
                      setCustomGoogleUser({ name: '', email: '' });
                    }} 
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
