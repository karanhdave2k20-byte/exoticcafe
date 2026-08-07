import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, X, QrCode, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Scanner() {
  const navigate = useNavigate();
  const { showToast, adminTables } = useStore();
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [detectedTable, setDetectedTable] = useState(null);
  const [manualTable, setManualTable] = useState('');

  const handleScanSuccess = useCallback(() => {
    const table = selectedTable || adminTables?.find(t => t.status === 'Free')?.id || Math.floor(Math.random() * 5) + 1;
    setDetectedTable(table);
    setIsScanning(false);
    setIsConfirmModalOpen(true);
  }, [selectedTable, adminTables]);

  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            handleScanSuccess();
            return 100;
          }
          return prev + 0.25; // Slower progress for ~20s duration
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning, handleScanSuccess]);

  const handleManualAction = (val) => {
     if (!val) return;
     setSelectedTable(Number(val));
     setScanProgress(100);
     setIsManualModalOpen(false);
     
     // Trigger detection immediately
     const table = Number(val);
     setDetectedTable(table);
     setIsScanning(false);
     setIsConfirmModalOpen(true);
  };

  const finalizeScan = () => {
     showToast(`Entering Table ${detectedTable}`, 'success');
     navigate(`/table/${detectedTable}`);
  };

  return (
    <div className="mobile-wrapper" style={{ 
      background: '#000', height: '100vh', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.8rem', borderRadius: '50%', color: 'white' }}>
          <X size={24} />
        </button>
        <span style={{ color: 'white', fontWeight: 'bold', letterSpacing: '2px' }}>SCAN TABLE QR</span>
        <button onClick={() => { setScanProgress(0); setIsScanning(true); setIsConfirmModalOpen(false); setSelectedTable(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.8rem', borderRadius: '50%', color: 'white' }}>
          <RefreshCw size={24} className={isScanning ? 'animate-spin-slow' : ''} />
        </button>
      </div>

      {/* Screen Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '300px', aspectRatio: '1/1', border: '2px solid rgba(212, 163, 115, 0.5)', borderRadius: '30px', position: 'relative', overflow: 'hidden' }}>
          {isScanning && <div style={{ position: 'absolute', top: `${scanProgress}%`, left: 0, right: 0, height: '4px', background: 'var(--primary-color)', boxShadow: '0 0 20px var(--primary-color)', zIndex: 5, transition: 'top 50ms linear' }}></div>}
          <div style={{ position: 'absolute', inset: 0, background: 'url(/hero_coffee_bg.png)', backgroundSize: 'cover', opacity: 0.4 }}></div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={100} color="rgba(255,255,255,0.2)" />
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 10 }}>
        {isScanning ? (
           <div style={{ marginBottom: '1.5rem', animate: 'pulse 2s infinite' }}>
              <p style={{ color: 'var(--primary-color)', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                 {scanProgress < 30 ? 'Searching for QR...' : 
                  scanProgress < 60 ? 'Optimizing Focus...' : 
                  scanProgress < 90 ? 'Decoding Data...' : 'Table Detected!'}
              </p>
              <div style={{ width: '100px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem auto', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', inset: 0, background: 'var(--primary-color)', width: `${scanProgress}%`, transition: 'width 0.2s' }}></div>
              </div>
           </div>
        ) : (
           <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Align QR code within the frame</p>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <button onClick={() => setIsManualModalOpen(true)} className="btn btn-primary" style={{ padding: '1.2rem' }}>
             CHOOSE YOUR TABLE TO START
          </button>
        </div>
      </div>

      {/* Manual Modal */}
      {isManualModalOpen && (
        <div className="animate-fade-in" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
           <div className="glass-panel" style={{ width: '100%', padding: '2rem', borderRadius: '24px', border: '1px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                 <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Simulation Options</h3>
                 <X size={24} color="var(--text-muted)" onClick={() => setIsManualModalOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                 {[1,2,3,4,5,6,7,8].map(n => (
                    <button key={n} onClick={() => handleManualAction(n)} style={{ padding: '1rem 0', borderRadius: '12px', border: '1px solid rgba(212, 163, 115, 0.3)', background: 'rgba(212, 163, 115, 0.05)', color: 'white', fontWeight: 'bold' }}>{n}</button>
                 ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Or enter manually:</p>
              <form onSubmit={(e) => { e.preventDefault(); handleManualAction(manualTable); }} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                 <input type="number" placeholder="No." value={manualTable} onChange={e => setManualTable(e.target.value)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white' }} />
                 <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>Go</button>
              </form>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="animate-fade-in" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem' }}>
           <div className="glass-panel" style={{ width: '100%', padding: '2.5rem', borderRadius: '30px', border: '1px solid var(--primary-color)', textAlign: 'center' }}>
              <div style={{ background: 'var(--primary-color)', width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <CheckCircle2 size={35} color="#000" />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Scan Successful!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Detected Table No: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>{detectedTable}</span></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <button onClick={finalizeScan} className="btn btn-primary btn-block" style={{ padding: '1.2rem', fontSize: '1.2rem' }}>
                    Confirm & Start
                 </button>
                 <button onClick={() => { setIsConfirmModalOpen(false); setIsManualModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                    Not Table {detectedTable}? Change it
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
