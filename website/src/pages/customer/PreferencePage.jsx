import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Phone, Users, Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../StoreContext';
import Navbar from '../../components/Navbar';
import OnboardingStepper from '../../components/OnboardingStepper';

export default function PreferencePage() {
  const navigate = useNavigate();
  const { user, showToast, addReservation, tableInfo } = useStore();

  const [name, setName] = useState(user?.n || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(tableInfo?.peopleCount || 2);
  const [area, setArea] = useState('Lounge');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reservationDetails = {
      name,
      phone,
      date,
      time,
      guests,
      area,
      tableNo: tableInfo?.tableNo || null,
      createdAt: new Date()
    };

    const success = await addReservation(reservationDetails);
    setIsSubmitting(false);

    if (success) {
      navigate('/menu');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <Navbar />

      {tableInfo?.tableNo && (
        <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
          <OnboardingStepper currentStep={4} />
        </div>
      )}

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', border: '1px solid rgba(212, 163, 115, 0.2)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(212, 163, 115, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <Calendar size={36} color="var(--primary-color)" />
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
              Book a Table
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Reserve your premium dining spot at Exotic Café
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Name:</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name" 
                  style={{ paddingLeft: '2.5rem' }} 
                  required 
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Contact Phone:</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Your Phone Number" 
                  style={{ paddingLeft: '2.5rem' }} 
                  required 
                />
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Date:</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Time:</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Guests & Seating Vibe */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Guests:</label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(Number(e.target.value))}
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Seating Vibe:</label>
                <select 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="Lounge">Cosy Lounge 🛋️</option>
                  <option value="Terrace">Outdoor Terrace 🌿</option>
                  <option value="Window">Window View 🪟</option>
                  <option value="Bar">Coffee Bar Counter ☕</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem', gap: '0.6rem' }}
            >
              {isSubmitting ? 'Reserving Spot...' : 'Confirm Reservation'} <Sparkles size={18} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
