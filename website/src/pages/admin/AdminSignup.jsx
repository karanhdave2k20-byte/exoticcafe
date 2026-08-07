import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, UserPlus, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function AdminSignup() {
  const navigate = useNavigate();
  const { showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    staffId: '',
    role: 'Staff' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, send to backend for approval
    try {
      showToast('Registration submitted for manager approval.', 'info');
      // Mocking submission success
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err) {
      showToast('Registration update failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem', border: '1px solid rgba(212, 163, 115, 0.1)', background: 'rgba(255,255,255,0.02)' }}>
        <button onClick={() => navigate('/admin/login')} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--primary-color)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(212, 163, 115, 0.3)' }}>
            <UserPlus size={40} color="#1a1a1a" />
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Staff Registration</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Request administrative access for Exotic Café</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input 
              name="fullName"
              type="text" 
              placeholder="Full Name" 
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.2rem' }} 
            />
            <input 
              name="staffId"
              type="text" 
              placeholder="Staff ID (e.g. ST10)" 
              value={formData.staffId}
              onChange={handleChange}
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.2rem' }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
             <Mail size={18} style={{ position: 'absolute', top: '17px', left: '16px', color: 'var(--primary-color)' }} />
             <input 
              name="email"
              type="email" 
              placeholder="Official Email Address" 
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', paddingLeft: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
             <Lock size={18} style={{ position: 'absolute', top: '17px', left: '16px', color: 'var(--primary-color)' }} />
             <input 
              name="password"
              type="password" 
              placeholder="Create Strong Password" 
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', paddingLeft: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>

          <select 
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '52px', border: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.2rem', color: 'var(--text-muted)' }}
          >
            <option value="Staff">Kitchen Staff / Waiter</option>
            <option value="Cashier">Cashier</option>
            <option value="Manager">Manager</option>
          </select>

          <button className="btn btn-primary btn-block" disabled={loading} style={{ padding: '1rem', height: '56px', fontSize: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
            {loading ? 'Submitting...' : 'Apply for Access'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="glass-panel" style={{ marginTop: '2.5rem', padding: '1rem', display: 'flex', gap: '0.8rem', background: 'rgba(212, 163, 115, 0.05)', border: 'none', borderRadius: '12px' }}>
          <ShieldAlert size={18} color="var(--primary-color)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Your registration is subject to verification by the café manager. Access will be granted after verification of your Staff ID and role designation.
          </p>
        </div>
      </div>
    </div>
  );
}
