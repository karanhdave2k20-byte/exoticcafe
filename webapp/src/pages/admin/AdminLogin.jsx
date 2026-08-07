import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { showToast, setAdminUser } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, we check against the backend
    try {
      // Manager Access
      if (formData.username === 'manager' && formData.password === 'aura2026') {
        const staffData = { n: 'Admin Manager', r: 'manager', id: 'MGR001' };
        setAdminUser(staffData);
        localStorage.setItem('aura-admin', JSON.stringify(staffData));
        showToast('Manager Access Granted - Full Control', 'success');
        navigate('/admin');
      } 
      // Staff Access
      else if (formData.username === 'staff' && formData.password === 'staff123') {
        const staffData = { n: 'Staff User', r: 'staff', id: 'STF001' };
        setAdminUser(staffData);
        localStorage.setItem('aura-admin', JSON.stringify(staffData));
        showToast('Staff Access Granted - Order Management', 'info');
        navigate('/admin');
      }
      else {
        showToast('Invalid credentials. Access Denied.', 'error');
      }
    } catch {
      showToast('Login Error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white', padding: '1rem' }}>
      <div className="glass-panel scale-up" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem', border: '1px solid rgba(212, 163, 115, 0.1)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--primary-color)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(212, 163, 115, 0.3)' }}>
            <ShieldCheck size={40} color="#1a1a1a" />
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Staff Login</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Secure access to Exotic Café Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--primary-color)' }} />
            <input 
              name="username"
              type="text" 
              placeholder="Username / Staff ID" 
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%', paddingLeft: '3.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--primary-color)' }} />
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', paddingLeft: '3.5rem', paddingRight: '3.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '15px', right: '16px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} style={{ padding: '1rem', height: '56px', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
            {loading ? 'Verifying...' : 'Login to Dashboard'} <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          New staff? <Link to="/admin/signup" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>Request Access</Link>
        </div>
      </div>
    </div>
  );
}
