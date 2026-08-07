import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Feedback() {
  const navigate = useNavigate();
  const { user, showToast } = useStore();

  const handleSkipOrSubmit = () => {
    showToast(`Thanks for the feedback, ${user?.n || user?.name || 'Guest'}!`, 'success');
    navigate('/media-suggest');
  };

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Hi {user?.n || user?.name || 'there'}!</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Before you order, how is the environment today?</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <button className="btn-icon" onClick={handleSkipOrSubmit} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 163, 115, 0.1)' }}>
            <ThumbsUp size={40} color="var(--primary-color)" />
          </button>
          <button className="btn-icon" onClick={handleSkipOrSubmit} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 163, 115, 0.1)' }}>
            <ThumbsDown size={40} color="var(--primary-color)" />
          </button>
        </div>

        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Rate the café ambiance & music today!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
          {[1,2,3,4,5].map(star => (
            <Star key={star} size={32} color="var(--primary-color)" fill="var(--bg-card)" onClick={handleSkipOrSubmit} style={{ cursor: 'pointer' }} />
          ))}
        </div>

        <button className="btn btn-outline btn-block" onClick={handleSkipOrSubmit}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
