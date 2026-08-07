import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Star } from 'lucide-react';

import { useStore } from '../../StoreContext';

export default function Suggestion() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState('');

  const handleFinish = async (e) => {
    e.preventDefault();
    if (rating > 0 || msg) {
      try {
        await fetch(`/api/database/feedback`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: user?.n || user?.name || 'Anonymous', rating: rating || 5, msg })
        });
      } catch(err) { console.error(err); }
    }
    navigate('/thanks');
  };

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Meal Completed!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We hope you enjoyed the experience at Exotic Cafe.</p>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: '1px dashed var(--primary-color)', textAlign: 'center' }}>
         <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loyalty Points Earned</h4>
         <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            + 250 PTS
         </div>
         <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Check your profile next time for rewards!</p>
      </div>

      <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>We Value Your Thoughts</h3>
      
      <form onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>How was the food &amp; service?</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[1,2,3,4,5].map(star => (
              <Star 
                key={star} 
                size={40} 
                color="var(--primary-color)" 
                fill={star <= rating ? "var(--primary-color)" : "var(--bg-card)"} 
                onClick={() => setRating(star)} 
                style={{ cursor: 'pointer' }} 
              />
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MessageSquare size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: 'var(--text-muted)' }} />
          <textarea 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Tell us what you liked or how we can improve (e.g. Add new dishes, faster service)..." 
            style={{ paddingLeft: '3rem', paddingTop: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: 'none', resize: 'none', flex: 1, minHeight: '150px' }} 
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '2rem', padding: '1.2rem', fontSize: '1.2rem' }}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
