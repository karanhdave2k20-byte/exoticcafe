import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Heart } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function ThankYou() {
  const { user, tableInfo, setUser, setTableInfo, setCart, setOrderStatus, setCurrentOrderId } = useStore();
  const navigate = useNavigate();
  
  // Capture values for persistent display after logout
  const [sessionName] = useState(user?.n || user?.name || 'Guest');
  const [sessionTable] = useState(tableInfo?.tableNo);

  const handleShare = async () => {
    const shareData = {
      title: 'Exotic Cafe experience!',
      text: `I just had an amazing coffee at Exotic Cafe! Check it out.`,
      url: window.location.origin
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const releaseTable = async () => {
      if (tableInfo?.tableNo) {
        try {
          await fetch(`/api/database/tables/${tableInfo.tableNo}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Free' })
          });
          
          // Clear everything locally now that the session is officially over
          localStorage.removeItem('aura-user');
          localStorage.removeItem('aura-table');
          localStorage.removeItem('aura-cart');
          localStorage.removeItem('aura-order-id');
          localStorage.removeItem('aura-recent-total');
          
          // Slight delay to prevent immediate flash
          setTimeout(() => {
            setUser(null);
            setTableInfo({ tableNo: null });
            setCart([]);
            setOrderStatus(null);
            setCurrentOrderId(null);
          }, 50);
          
        } catch (err) {
          console.error("Error releasing table:", err);
        }
      }
    };
    releaseTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only once on mount

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(/hero_coffee_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 13, 13, 0.85)' }} />
      
      <div className="animate-fade-in" style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'var(--primary-color)', padding: '1.5rem', borderRadius: '50%', marginBottom: '2rem' }}>
          <Heart size={40} color="#1a1a1a" />
        </div>
        
        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>Thank You</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 300, margin: '0 0 2rem 0' }}>Visit Again, {sessionName}! 😊</h2>
        
        <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', color: '#4ade80' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
             Table {sessionTable} has been released (Free)
          </div>
          <h3 style={{ color: 'var(--primary-color)' }}>Loyalty Reward Attached!</h3>
          <p style={{ color: 'var(--text-muted)' }}>Show this screen on your next visit for a complimentary cookie.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <button className="btn btn-outline" style={{ flex: 1, padding: '1rem' }} onClick={handleShare}>
            <Share2 size={20} /> Share
          </button>
          <button className="btn btn-primary" style={{ flex: 1, padding: '1rem' }} onClick={() => navigate('/menu')}>
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}
