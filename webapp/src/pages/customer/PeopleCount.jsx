import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Users, UserPlus, UserMinus, User } from 'lucide-react';
import { useStore } from '../../StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import WebAppHeader from '../../components/WebAppHeader';

export default function PeopleCount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tableInfo, setTableInfo, showToast, user } = useStore();
  
  const searchParams = new URLSearchParams(location.search);
  const step = parseInt(searchParams.get('step') || '1');

  const [count, setCount] = useState(tableInfo?.peopleCount || 1);
  const [names, setNames] = useState(() => {
    if (tableInfo?.guestNames && tableInfo.guestNames.length > 0) {
      return tableInfo.guestNames;
    }
    return [user?.n || ''];
  });

  const handleNextStep = () => {
    if (names.length !== count) {
      const newNames = Array(count).fill('');
      for (let i = 0; i < Math.min(names.length, count); i++) {
        newNames[i] = names[i];
      }
      if (newNames[0] === '' && user?.n) {
        newNames[0] = user.n;
      }
      setNames(newNames);
    }
    navigate('/people?step=2');
  };

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleFinish = async () => {
    const hasEmpty = names.some(n => n.trim() === '');
    if (hasEmpty) {
      showToast('Please enter all guest names before continuing.', 'error');
      return;
    }

    // Save to local context
    setTableInfo({ ...tableInfo, peopleCount: count, guestNames: names });
    
    // Save to Database so Admin can see
    if (tableInfo?.tableNo) {
      try {
        await fetch(`/api/database/tables/${tableInfo.tableNo}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestNames: names.filter(n => n.trim() !== '') })
        });
      } catch (err) {
        console.error("Failed to update guest names on server");
      }
    }

    navigate('/invite');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <WebAppHeader />

      {tableInfo?.tableNo && (
        <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
          <OnboardingStepper currentStep={3} />
        </div>
      )}

      <div style={{ maxWidth: '480px', margin: '2rem auto 0 auto', padding: '0 1.5rem' }}>

      
      {step === 1 ? (
        <>
          <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>Welcome!</h1>
            <p style={{ color: 'var(--text-muted)' }}>How many people are joining us today at Table {tableInfo?.tableNo || ''}?</p>
          </div>

          <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '2rem', flex: 1, justifyContent: 'center', border: '1px solid var(--primary-color)' }}>
            <Users size={64} color="var(--primary-color)" style={{ opacity: 0.8 }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
              <button 
                onClick={() => setCount(Math.max(1, count - 1))}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--primary-color)', color: 'var(--primary-color)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
              >
                <UserMinus size={24} />
              </button>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--text-main)', width: '60px', textAlign: 'center' }}>
                {count}
              </div>
              <button 
                onClick={() => setCount(Math.min(20, count + 1))}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', border: 'none', color: '#1a1a1a', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(212, 163, 115, 0.4)' }}
              >
                <UserPlus size={24} />
              </button>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button 
                onClick={handleNextStep} 
                className="btn btn-primary btn-block" 
                style={{ padding: '1.2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 10px 30px rgba(212, 163, 115, 0.4)' }}
              >
                NEXT <ArrowRight size={24} />
              </button>
          </div>
        </>
      ) : (
        <>
          <div className="animate-fade-in" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-color)' }}>Guest Names</h1>
            <p style={{ color: 'var(--text-muted)' }}>Enter the names of the {count} people for Table {tableInfo?.tableNo || ''}.</p>
          </div>

          <div className="animate-fade-in" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
            {names.map((name, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder={index === 0 ? "Primary Person Name" : `Guest ${index + 1} Name`}
                  value={name} 
                  onChange={(e) => handleNameChange(index, e.target.value)} 
                  autoComplete="off"
                  style={{ width: '100%', padding: '1rem', paddingLeft: '3.5rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem' }} 
                />
              </div>
            ))}
          </div>

          <div className="animate-fade-in" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <button 
                onClick={handleFinish} 
                className="btn btn-primary btn-block" 
                style={{ padding: '1.2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 10px 30px rgba(212, 163, 115, 0.4)' }}
              >
                INVITE FRIENDS & CONTINUE <ArrowRight size={24} />
              </button>
              <button 
                onClick={() => navigate('/people')} 
                style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                Back to Count
              </button>
          </div>
        </>
      )}

      </div>
    </div>
  );
}
