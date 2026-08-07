import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, CheckCircle2, Timer, Coffee, 
  ChefHat, PackageCheck, UtensilsCrossed, 
  ArrowLeft, Info
} from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function TrackOrder() {
  const navigate = useNavigate();
  const { orderStatus, currentOrderId, adminOrders } = useStore();
  const [rotation, setRotation] = useState(0);

  // Find current order details for display
  const currentOrder = useMemo(() => {
    return adminOrders.find(o => o.o === currentOrderId) || null;
  }, [adminOrders, currentOrderId]);

  const statuses = [
    { key: 'received', label: 'Order Received', icon: PackageCheck, desc: 'We have received your order!' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Our chef is crafting your experience.' },
    { key: 'ready', label: 'Ready to Serve', icon: UtensilsCrossed, desc: 'Your order is hot and ready!' },
    { key: 'delivered', label: 'Enjoy!', icon: Coffee, desc: 'Served with love. Enjoy your meal!' }
  ];

  const currentIndex = statuses.findIndex(s => s.key === (orderStatus || 'received'));

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orderStatus === 'delivered') {
      const timer = setTimeout(() => navigate('/pay'), 6000);
      return () => clearTimeout(timer);
    }
  }, [orderStatus, navigate]);

  const getProgress = () => {
     if (currentIndex < 0) return 0;
     return ((currentIndex + 1) / statuses.length) * 100;
  };

  if (!currentOrderId) {
    return (
      <div className="mobile-wrapper" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>No Active Order</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>You haven't placed any orders yet. Head to the menu to explore our exotic collection!</p>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/menu')}>
           Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-wrapper" style={{ 
      display: 'flex', flexDirection: 'column', minHeight: '100vh', 
      background: 'var(--bg-color)', padding: '0 0 2rem 0',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '2rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(212, 163, 115, 0.05)',
        borderBottom: '1px solid rgba(212, 163, 115, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700', letterSpacing: '1px' }}>TRACK ORDER</h2>
      </div>

      <div style={{ perspective: '1000px', padding: '2rem 1.5rem' }}>
        {/* Main Status Card */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          borderRadius: '24px', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(212, 163, 115, 0.2)'
        }}>
          {/* Animated Ring */}
          <div style={{ 
            width: '180px', height: '180px', 
            borderRadius: '50%', 
            border: '4px solid rgba(212, 163, 115, 0.1)',
            margin: '0 auto 1.5rem auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
             <div style={{
               position: 'absolute',
               width: '100%', height: '100%',
               borderRadius: '50%',
               border: '4px solid transparent',
               borderTopColor: 'var(--primary-color)',
               transform: `rotate(${rotation}deg)`,
               transition: 'transform 0.1s linear'
             }}></div>
             
             {/* Dynamic Icon */}
             {React.createElement(statuses[Math.max(0, currentIndex)].icon, { size: 60, color: 'var(--primary-color)' })}
          </div>

          <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
            {statuses[Math.max(0, currentIndex)].label}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0' }}>
            {statuses[Math.max(0, currentIndex)].desc}
          </p>
          
          <div style={{ marginTop: '2rem' }}>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order ID: #{currentOrderId || '---'}</p>
             <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', left: 0, top: 0, height: '100%', 
                  width: `${getProgress()}%`, 
                  background: 'var(--primary-color)', 
                  boxShadow: '0 0 10px var(--primary-color)',
                  borderRadius: '3px',
                  transition: 'width 1s ease-in-out'
                }}></div>
             </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 1rem' }}>
          {statuses.map((s, index) => {
            const isCompleted = index <= currentIndex;
            const isActive = index === currentIndex;
            return (
              <div key={s.key} style={{ display: 'flex', gap: '1.5rem', opacity: isCompleted ? 1 : 0.3, transition: 'all 0.4s ease' }}>
                 <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', 
                      background: isCompleted ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 2
                    }}>
                       {isCompleted ? <CheckCircle2 size={16} color="#000" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />}
                    </div>
                    {index < statuses.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: index < currentIndex ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                    )}
                 </div>
                 <div style={{ paddingBottom: index < statuses.length - 1 ? '1.5rem' : 0 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: isActive ? 'var(--primary-color)' : 'var(--text-main)' }}>{s.label}</h4>
                    {isActive && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Working on it...</p>}
                 </div>
              </div>
            );
          })}
        </div>

        {/* Details Card */}
        {currentOrder && (
          <div className="glass-panel" style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
               <Info size={18} color="var(--primary-color)" />
               <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Order Summary</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic' }}>"{currentOrder.i}"</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.9rem' }}>
               <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
               <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{currentOrder.price}</span>
            </div>
          </div>
        )}

      </div>

      {/* Fun Section Fixed footer-like */}
      <div style={{ marginTop: 'auto', padding: '2rem 1.5rem' }}>
        <div 
          className="glass-panel animate-pulse-slow" 
          onClick={() => navigate('/fun')}
          style={{ 
            padding: '1.2rem', 
            background: 'linear-gradient(to right, rgba(212, 163, 115, 0.1), rgba(212, 163, 115, 0.02))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            borderLeft: '4px solid var(--primary-color)'
          }}
        >
          <div style={{ background: 'var(--primary-color)', padding: '0.8rem', borderRadius: '50%', color: '#000' }}>
            <Gamepad2 size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Bored While Waiting?</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discover movies & games</p>
          </div>
        </div>
      </div>
    </div>
  );
}
