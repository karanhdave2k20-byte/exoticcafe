import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useStore } from '../StoreContext';

export default function FloatingAITalkButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tableInfo } = useStore();

  // Don't show on admin routes or if the user is already on the AI talk page or scanner/login
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname === '/fun/ai-talk' ||
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/scanner'
  ) {
    return null;
  }

  // Also ensure the user has scanned a table before showing it (optional, but good practice)
  if (!tableInfo?.tableNo && !user) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/fun/ai-talk')}
      className="animate-pulse"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#4caf50',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'transform 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      aria-label="Live AI Companion"
    >
      <Bot size={30} />
    </button>
  );
}
