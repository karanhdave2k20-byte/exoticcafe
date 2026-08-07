import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Film, Music, Newspaper, Coffee, Zap, ArrowRight } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Fun() {
  const navigate = useNavigate();
  const { tableInfo, orderStatus } = useStore();

  const chosenVibes = [];
  if (tableInfo?.guestNames) {
    tableInfo.guestNames.forEach(g => {
      const match = g.match(/\(([^)]+)\)$/);
      if (match) {
        chosenVibes.push(match[1]);
      }
    });
  }

  const hasChoices = chosenVibes.length > 0;
  const knownVibes = ['Music', 'Movie', 'News', 'Cricket'];
  const hasOther = chosenVibes.some(v => !knownVibes.includes(v));

  const showGame = !hasChoices || hasOther || chosenVibes.includes('Game');
  const showMovie = !hasChoices || hasOther || chosenVibes.includes('Movie');
  const showMusic = !hasChoices || hasOther || chosenVibes.includes('Music');
  const showNews = !hasChoices || hasOther || chosenVibes.includes('News');
  const showCricket = !hasChoices || hasOther || chosenVibes.includes('Cricket');

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0', flex: 1, color: 'var(--primary-color)' }}>Bored? <span style={{ color: 'var(--text-main)' }}>Have fun!</span></h2>
      </div>

      {orderStatus && (
        <div 
          onClick={() => navigate('/track')}
          className="glass-panel animate-pulse-slow" 
          style={{ 
            padding: '1rem', marginBottom: '2rem', 
            background: 'rgba(212, 163, 115, 0.15)', 
            border: '1px solid var(--primary-color)',
            display: 'flex', alignItems: 'center', gap: '1rem',
            cursor: 'pointer'
          }}
        >
           <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '50%' }}>
              <Zap size={18} color="#1a1a1a" fill="#1a1a1a" />
           </div>
           <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>LIVE STATUS: {orderStatus.toUpperCase()}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to see detailed tracking</p>
           </div>
           <ArrowRight size={18} color="var(--primary-color)" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {showGame && (
        <div className="glass-panel" onClick={() => navigate('/fun/game')} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}>
          <div style={{ background: 'var(--primary-color)', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 15px rgba(212, 163, 115, 0.4)' }}>
            <Gamepad2 size={32} color="#2b3424" />
          </div>
          <p style={{ fontWeight: '600' }}>Play 2048</p>
        </div>
        )}

        {showMovie && (
        <div className="glass-panel" onClick={() => navigate('/fun/films')} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '50%' }}>
            <Film size={32} color="var(--primary-color)" />
          </div>
          <p style={{ fontWeight: '600' }}>Short Films</p>
        </div>
        )}

        {showMusic && (
        <div className="glass-panel" onClick={() => navigate('/fun/radio')} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '50%' }}>
            <Music size={32} color="var(--primary-color)" />
          </div>
          <p style={{ fontWeight: '600' }}>Lofi Radio</p>
        </div>
        )}

        {showNews && (
        <div className="glass-panel" onClick={() => navigate('/fun/news')} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '50%' }}>
            <Newspaper size={32} color="var(--primary-color)" />
          </div>
          <p style={{ fontWeight: '600' }}>Live World News</p>
        </div>
        )}
        
        {showCricket && (
        <div className="glass-panel" onClick={() => navigate('/fun/live')} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', gridColumn: 'span 2', transition: 'transform 0.2s ease-in-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <div style={{ background: 'rgba(255, 60, 0, 0.1)', border: '1px solid #ff3d00', padding: '0.8rem', borderRadius: '50%' }}>
               <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff3d00' }} className="animate-pulse" />
             </div>
             <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#ff3d00' }}>LIVE Real-time Sports Score</p>
          </div>
        </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Today's Mystery Offer</h3>
        <p style={{ color: 'var(--text-muted)' }}>Scan the QR at the counter after your meal to get a 10% discount coupon!</p>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => navigate('/track')} style={{ marginTop: 'auto', padding: '1.2rem', fontSize: '1.2rem' }}>
        Back to Tracking <Coffee size={20} />
      </button>
    </div>
  );
}
