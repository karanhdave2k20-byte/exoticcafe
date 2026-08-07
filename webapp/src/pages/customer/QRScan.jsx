import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { useStore } from '../../StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';

export default function QRScan() {
  const { id: tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tableInfo, setTableInfo } = useStore();
  const [isOccupied, setIsOccupied] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const isInvite = new URLSearchParams(location.search).get('invite') === 'true';

  useEffect(() => {
    const checkTableStatus = async () => {
      if (tableId) {
        try {
          const res = await fetch(`/api/database/tables/${tableId}`);
          const data = await res.json();

          let bMsg = '';
          try {
            const syncRes = await fetch('/api/database/sync');
            const syncData = await syncRes.json();
            const tableBookings = syncData.bookings?.filter(b => parseInt(b.tableId) === parseInt(tableId)) || [];
            
            const now = new Date();
            for (const b of tableBookings) {
              if (!b.time) continue;
              
              // Robust time parsing (Supports "12:30 PM", "14:30", "12:30")
              let finalTime;
              const timeStr = b.time.toLowerCase();
              if (timeStr.includes('am') || timeStr.includes('pm')) {
                 const [time, modifier] = timeStr.split(' ');
                 let [hours, minutes] = time.split(':').map(Number);
                 if (modifier === 'pm' && hours < 12) hours += 12;
                 if (modifier === 'am' && hours === 12) hours = 0;
                 finalTime = { h: hours, m: minutes };
              } else {
                 const [h, m] = timeStr.split(':').map(Number);
                 finalTime = { h, m };
              }

              const bookingDate = new Date();
              bookingDate.setHours(finalTime.h, finalTime.m, 0, 0);
              
              const diffMins = Math.floor((bookingDate.getTime() - now.getTime()) / 60000);
              
              // If booking is within next 1 hour, block scan
              if (diffMins > 0 && diffMins <= 60) {
                bMsg = `This table is booked! Customer arrives in ${diffMins} min (${b.time}).`;
                setBookingMessage(bMsg);
                break;
              }
            }
          } catch(err) { console.error("Booking check error:", err); }

          // Bypass occupied check if friend is joining via invite link
          if (!isInvite && (bMsg || (data && (data.status === 'Occupied' || data.status === 'Reserved')))) {
            setIsOccupied(true);
          } else {
             setTableInfo({ ...tableInfo, tableNo: tableId });
             // Auto-redirect to login if free, or if invite is active
             if (isInvite || (data && data.status === 'Free' && !bMsg)) {
                setTimeout(() => navigate('/login'), 1500); 
             }
          }
        } catch(err) {
          console.error("Failed to check table status:", err);
          setTableInfo({ ...tableInfo, tableNo: tableId });
          setTimeout(() => navigate('/login'), 1500); // Fail-safe auto-redirect
        }
      }
    };
    checkTableStatus();
    const interval = setInterval(checkTableStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [tableId, setTableInfo, navigate, tableInfo]);

  return (
    <div className="mobile-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundImage: 'url(/hero_coffee_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ padding: '1rem 1rem 0 1rem' }}>
        <OnboardingStepper currentStep={1} />
      </div>
      <div style={{ flex: 1, background: 'linear-gradient(to top, var(--bg-color) 20%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem' }}>
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: 'var(--primary-color)' }}>Exotic</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '2px', margin: '0 0 2rem 0' }}>COFFEE EXPERIENCES</h2>
          
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Welcome to Table {tableId}</p>
            {isOccupied ? (
              <div style={{ marginTop: '0.5rem', color: 'var(--danger-color)', fontWeight: 'bold' }}>
                ⚠️ {bookingMessage || 'This table is currently marked as occupied. Please talk to the staff or choose another seat.'}
              </div>
            ) : (
              <p style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Scan successful. Prepare for the finest flavors.</p>
            )}
          </div>

          <button 
            className="btn btn-primary btn-block" 
            onClick={() => navigate('/login')} 
            disabled={isOccupied}
            style={{ padding: '1rem', fontSize: '1.2rem', opacity: isOccupied ? 0.5 : 1 }}
          >
            {isOccupied ? (bookingMessage ? 'Table Booked' : 'Table Occupied') : <><Coffee size={24} /> Get Started</>}
          </button>
        </div>
      </div>
    </div>
  );
}
