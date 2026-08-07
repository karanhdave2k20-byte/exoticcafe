import React from 'react';
import { Radio } from 'lucide-react';

export default function LiveScore() {
  
  return (
    <div className="mobile-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff3d00' }} className="animate-pulse" />
          <h2 style={{ margin: '0', fontSize: '1.4rem', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>Live Sports</h2>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Live Score Updates</p>
          <iframe 
            src="https://www.scorebat.com/embed/livescore/" 
            frameBorder="0" 
            width="100%" 
            height="500" 
            allowFullScreen 
            style={{ width: '100%', height: '500px', borderRadius: 'var(--radius-sm)', background: 'white' }}
          />
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={20} color="var(--primary-color)" /> Live Commentary
          </h3>
          <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
             <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>🏏 <strong>Latest Update:</strong> Team A needs 45 runs from 30 balls to win.</p>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time feed synced with global broadcasters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
