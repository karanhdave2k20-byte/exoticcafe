import React, { useState, useMemo } from 'react';
import { Search, Radio as RadioIcon, Play, RefreshCcw } from 'lucide-react';

const stations = [
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl', desc: 'Global study & chill beats' },
  { id: 'hHW1oY26kxQ', name: 'Morning Jazz', desc: 'Smooth instrumental coffee-shop jazz' },
  { id: 'fEvM-OUbaKs', name: 'Deep House', desc: 'Vibrant electronic lounge hits' },
  { id: 'X4B8pWpS7v8', name: '90s Bollywood', desc: 'Golden hits from the 90s era' },
  { id: '9fSj6E7pCts', name: 'Peaceful Piano', desc: 'Soothing piano for deep focus' },
  { id: 'aqZ0_6-89O4', name: 'Soulful Pop', desc: 'Classic global unplugged collection' }
];

export default function Radio() {
  const [currentId, setCurrentId] = useState(stations[0].id);
  const [currentName, setCurrentName] = useState(stations[0].name);
  const [currentDesc, setCurrentDesc] = useState(stations[0].desc);
  const [search, setSearch] = useState('');
  const [key, setKey] = useState(0); 

  const barHeights = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7].map((_, i) => {
      let seed = i + key;
      for (let j = 0; j < currentId.length; j++) {
        seed += currentId.charCodeAt(j);
      }
      const x = Math.sin(seed) * 10000;
      const val = x - Math.floor(x);
      return `${Math.max(20, val * 100)}%`;
    });
  }, [currentId, key]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search) {
      let id = search;
      if (search.includes('v=')) {
        id = search.split('v=')[1].split('&')[0];
      } else if (search.includes('youtu.be/')) {
        id = search.split('youtu.be/')[1].split('?')[0];
      }

      if (id.length >= 11) {
        setCurrentId(id);
        setCurrentName('Custom Selection');
        setCurrentDesc('Playing your personal choice');
        setSearch('');
        setKey(prev => prev + 1);
      } else {
        alert("Please paste a valid YouTube URL.");
      }
    }
  };

  const handleReload = () => setKey(prev => prev + 1);

  return (
    <div className="mobile-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>Cinema & Radio</h2>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
           <Search size={14} style={{ position: 'absolute', top: '11px', left: '12px', color: 'var(--text-muted)' }} />
           <input 
             placeholder="Paste Link here..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             onKeyDown={handleSearch}
             style={{ width: '100%', paddingLeft: '2.5rem', height: '36px', borderRadius: 'var(--radius-full)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'white' }}
           />
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#000', width: '100%', aspectRatio: '16/9', position: 'relative' }}>
          <iframe 
            key={key}
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${currentId}?autoplay=1&mute=0&rel=0&modestbranding=1`} 
            title="Exotic Radio Player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
          <button 
            onClick={handleReload}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', padding: '5px', borderRadius: '50%', color: 'white', cursor: 'pointer' }}
          >
            <RefreshCcw size={16} />
          </button>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-card)', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
           <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', height: '18px', marginBottom: '0.5rem' }}>
             {barHeights.map((h, i) => (
               <div key={i} style={{ width: '3px', background: 'var(--primary-color)', height: h, borderRadius: '2px', transition: 'height 0.3s ease' }}></div>
             ))}
           </div>
           <h3 style={{ color: 'var(--primary-color)', fontSize: '1.2rem', margin: '0' }}>{currentName}</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{currentDesc}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
           <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Switch Station</p>
           {stations.map(station => (
             <button 
               key={station.id}
               onClick={() => { setCurrentId(station.id); setCurrentName(station.name); setCurrentDesc(station.desc); setKey(prev => prev + 1); }}
               style={{ 
                 display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: 'var(--radius-md)', 
                 background: currentId === station.id ? 'rgba(212, 163, 115, 0.12)' : 'rgba(255,255,255,0.02)',
                 border: currentId === station.id ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.05)',
                 transition: 'all 0.3s ease', cursor: 'pointer', color: 'white'
               }}
             >
                <div style={{ background: currentId === station.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '50%', color: currentId === station.id ? '#1a1a1a' : 'var(--primary-color)' }}>
                   <RadioIcon size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                   <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{station.name}</h4>
                   <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{station.desc}</p>
                </div>
                {currentId === station.id && <div style={{ marginLeft: 'auto', color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 'bold' }}>PLAYING</div>}
             </button>
           ))}
           <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 60, 0, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 60, 0, 0.1)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Playback issue?</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                Some Bollywood live streams have strict copyright filters and might not play in all regions. We've added <b>90s Bollywood</b> as a stable alternative. You can also paste any link you want in the search above!
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
