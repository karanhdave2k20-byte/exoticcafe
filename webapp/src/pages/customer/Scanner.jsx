import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, QrCode, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function Scanner() {
  const navigate = useNavigate();
  const { adminTables, showToast, serverIp, tunnelUrl } = useStore();

  // Mode: 'grid' or 'scan'
  const [mode, setMode] = useState('grid');
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [detectedTable, setDetectedTable] = useState(null);
  
  // State for showing a QR Code image modal
  const [activeQrTable, setActiveQrTable] = useState(null);

  const handleTableSelect = (tableNo) => {
    showToast(`Entering Table ${tableNo}`, 'success');
    navigate(`/table/${tableNo}`);
  };

  const handleScanSuccess = useCallback(() => {
    const table = adminTables?.find(t => t.status === 'Free')?.id || Math.floor(Math.random() * 8) + 1;
    setDetectedTable(table);
    setIsScanning(false);
    setIsConfirmModalOpen(true);
  }, [adminTables]);

  useEffect(() => {
    let interval;
    if (mode === 'scan' && isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            handleScanSuccess();
            return 100;
          }
          return prev + 1; // Faster simulated scan
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [mode, isScanning, handleScanSuccess]);

  const startScanning = () => {
    setScanProgress(0);
    setIsScanning(true);
    setIsConfirmModalOpen(false);
    setMode('scan');
  };

  const finalizeScan = () => {
    showToast(`Entering Table ${detectedTable}`, 'success');
    navigate(`/table/${detectedTable}`);
  };

  if (mode === 'scan') {
    return (
      <div className="mobile-wrapper" style={{ 
        background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Scanner Header */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
          <button onClick={() => setMode('grid')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.8rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          <span style={{ color: 'white', fontWeight: 'bold', letterSpacing: '2px' }}>SCAN TABLE QR</span>
          <button onClick={startScanning} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.8rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}>
            <RefreshCw size={24} className={isScanning ? 'animate-spin-slow' : ''} />
          </button>
        </div>

        {/* Scanner Body Area */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', marginTop: '4rem' }}>
          <div style={{ width: '100%', maxWidth: '300px', aspectRatio: '1/1', border: '2px solid rgba(212, 163, 115, 0.5)', borderRadius: '30px', position: 'relative', overflow: 'hidden' }}>
            {isScanning && <div style={{ position: 'absolute', top: `${scanProgress}%`, left: 0, right: 0, height: '4px', background: 'var(--primary-color)', boxShadow: '0 0 20px var(--primary-color)', zIndex: 5, transition: 'top 50ms linear' }}></div>}
            <div style={{ position: 'absolute', inset: 0, background: 'url(/hero_coffee_bg.png)', backgroundSize: 'cover', opacity: 0.4 }}></div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={100} color="rgba(255,255,255,0.2)" />
            </div>
          </div>
        </div>

        {/* Scanner Footer */}
        <div style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 10 }}>
          {isScanning ? (
            <div style={{ marginBottom: '1.5rem' }}>
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
        </div>

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
                <button onClick={() => { setIsConfirmModalOpen(false); setMode('grid'); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', textDecoration: 'underline', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Choose Table Manually
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-color)', 
      color: 'var(--text-main)',
      display: 'flex', 
      flexDirection: 'column',
      padding: '2rem 1.5rem'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(212, 163, 115, 0.1)', padding: '1.2rem', borderRadius: '50%', marginBottom: '1.2rem' }}>
          <Coffee size={40} color="var(--primary-color)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0, color: 'var(--primary-color)' }}>TableHive</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Choose your table or scan the QR code to begin ordering
        </p>
      </div>

      {/* Grid Header and Scan Switcher */}
      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
            Available Tables
          </h3>
          <button 
            onClick={startScanning} 
            className="btn btn-primary"
            style={{ 
              padding: '0.6rem 1.2rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}
          >
            <QrCode size={16} /> Scan QR Code
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '1.2rem', 
          marginBottom: '3rem' 
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
            const tableStatus = adminTables?.find(t => t.id === n)?.status || 'Free';
            const isOccupied = tableStatus === 'Occupied';
            
            return (
              <div 
                key={n}
                onClick={() => handleTableSelect(n)}
                className="glass-panel"
                style={{
                  padding: '2rem 1.5rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isOccupied ? '1px solid rgba(255, 60, 60, 0.2)' : '1px solid rgba(212, 163, 115, 0.2)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  background: isOccupied ? 'rgba(255, 60, 60, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                }}
              >
                {/* QR Code Display Trigger */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveQrTable(n); 
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color)',
                    cursor: 'pointer'
                  }}
                  title="Show QR Code"
                >
                  <QrCode size={16} />
                </button>

                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {n}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Table Number
                </div>
                <span style={{ 
                  display: 'inline-block',
                  fontSize: '0.7rem', 
                  marginTop: '0.8rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  background: isOccupied ? 'rgba(255,60,60,0.15)' : 'rgba(76,175,80,0.15)',
                  color: isOccupied ? '#ff4d4d' : '#4caf50'
                }}>
                  {tableStatus}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Display Modal */}
      {activeQrTable && (
        <div 
          className="animate-fade-in" 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.92)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem' 
          }} 
          onClick={() => setActiveQrTable(null)}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '340px', 
              padding: '2rem', 
              borderRadius: '24px', 
              border: '1px solid var(--primary-color)', 
              textAlign: 'center' 
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Table {activeQrTable} QR Code</h3>
              <X size={24} color="var(--text-muted)" onClick={() => setActiveQrTable(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
              {(() => {
                const host = tunnelUrl && tunnelUrl.startsWith('http')
                  ? tunnelUrl
                  : serverIp && serverIp !== 'localhost' && serverIp !== '127.0.0.1'
                    ? `http://${serverIp}:${window.location.port || '5174'}`
                    : window.location.origin;
                const qrTarget = `${host}/table/${activeQrTable}`;
                return (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrTarget)}`} 
                    alt={`Table ${activeQrTable} QR`} 
                    style={{ width: '200px', height: '200px', display: 'block' }}
                  />
                );
              })()}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Scan this QR code with a mobile camera to join Table {activeQrTable}
            </p>
          </div>
        </div>
      )}

      {/* Styled inline hover effects */}
      <style>{`
        .glass-panel:hover {
          transform: translateY(-4px);
          border-color: var(--primary-color) !important;
          box-shadow: 0 4px 20px rgba(212, 163, 115, 0.15);
        }
      `}</style>
    </div>
  );
}
