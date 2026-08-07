import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Game2048() {
  const navigate = useNavigate();
  // We will embed an iframe for the best 2048 experience without breaking React state complexity.
  // If iframe is blocked, fallback to a message or simple game.
  
  return (
    <div className="mobile-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', background: 'var(--bg-card)' }}>
        <button onClick={() => navigate('/fun')} style={{ padding: '0.5rem', background: 'var(--bg-color)', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: '0 0 0 1rem', flex: 1, fontSize: '1.2rem' }}>2048</h2>
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe 
          src="https://www.crazygames.com/embed/2048" 
          title="2048 Game"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="gamepad *;"
        />
      </div>
    </div>
  );
}
