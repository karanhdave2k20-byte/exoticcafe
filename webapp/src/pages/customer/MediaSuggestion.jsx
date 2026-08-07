import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Music, Film, Newspaper, HelpCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function MediaSuggestion() {
  const navigate = useNavigate();
  const { user, showToast, tableInfo, setTableInfo } = useStore();
  
  const pureGuests = tableInfo?.guestNames && tableInfo?.guestNames.length > 0 ? tableInfo.guestNames : ['Guest'];
  const guests = pureGuests.map(g => g.split(' (')[0].trim());
  
  const [selections, setSelections] = useState(
    guests.map(g => ({ name: g, selected: '', customSuggest: '' }))
  );

  const handleSelection = (index, value) => {
    const newSels = [...selections];
    newSels[index].selected = value;
    if (value !== 'Other') newSels[index].customSuggest = '';
    setSelections(newSels);
  };

  const handleCustom = (index, value) => {
    const newSels = [...selections];
    newSels[index].customSuggest = value;
    setSelections(newSels);
  };

  const handleSkipOrSubmit = async () => {
    // Determine final vibes for each user
    const finalVibes = selections.map(s => {
       const suggestion = s.selected === 'Other' ? s.customSuggest : s.selected;
       return suggestion ? suggestion : 'None';
    });

    const newGuestNames = guests.map((g, i) => finalVibes[i] !== 'None' ? `${g} (${finalVibes[i]})` : g);
    setTableInfo({ ...tableInfo, guestNames: newGuestNames });

    if (tableInfo?.tableNo) {
      try {
        await fetch(`/api/database/tables/${tableInfo.tableNo}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestNames: newGuestNames })
        });
      } catch (err) { }
    }

    const feedbackStrs = guests.map((g, i) => finalVibes[i] !== 'None' ? `${g}: ${finalVibes[i]}` : null).filter(Boolean);
    if (feedbackStrs.length > 0) {
      showToast(`Thanks! Your preferences have been sent.`, 'success');
      try {
        await fetch(`/api/database/feedback`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: `Table ${tableInfo?.tableNo || '?'}`, rating: 5, msg: `Vibes: ${feedbackStrs.join(' | ')}` })
        });
      } catch(err) {}
    } else {
      showToast(`Welcome! Enjoy your stay.`, 'info');
    }
    navigate('/preference');
  };

  const options = [
    { name: 'Cricket', icon: Tv },
    { name: 'Music', icon: Music },
    { name: 'Movie', icon: Film },
    { name: 'News', icon: Newspaper },
    { name: 'Other', icon: HelpCircle }
  ];

  return (
    <div className="mobile-wrapper" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Set the Vibe!</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>What would everyone like to see or hear on the cafe screens today?</p>
        
        {selections.map((sel, idx) => (
          <div key={idx} style={{ marginBottom: '2.5rem', borderBottom: idx < selections.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: idx < selections.length - 1 ? '1.5rem' : '0' }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.2rem' }}>{sel.name}</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {options.map(opt => (
                <button 
                  key={opt.name}
                  onClick={() => handleSelection(idx, opt.name)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', 
                    width: '65px', padding: '1rem 0', borderRadius: 'var(--radius-md)', 
                    background: sel.selected === opt.name ? 'var(--primary-color)' : 'rgba(212, 163, 115, 0.1)',
                    color: sel.selected === opt.name ? 'var(--bg-color)' : 'var(--primary-color)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                >
                  <opt.icon size={24} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{opt.name}</span>
                </button>
              ))}
            </div>

            {sel.selected === 'Other' && (
              <div className="animate-fade-in">
                <input 
                  type="text" 
                  placeholder="Direct us! (e.g. 90s Pop)" 
                  value={sel.customSuggest}
                  onChange={(e) => handleCustom(idx, e.target.value)}
                  style={{ width: '100%', textAlign: 'center' }}
                />
              </div>
            )}
          </div>
        ))}

        <button 
          className="btn btn-block" 
          onClick={handleSkipOrSubmit} 
          style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', 
            padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem',
            background: selections.some(s => s.selected) ? 'var(--primary-color)' : 'transparent',
            color: selections.some(s => s.selected) ? 'var(--bg-color)' : 'var(--primary-color)',
            border: `1px solid var(--primary-color)`
          }}
        >
          {selections.some(s => s.selected) ? 'Submit Suggestions' : 'Skip for now'} {selections.some(s => s.selected) && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
