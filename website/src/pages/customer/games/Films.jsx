import React, { useState } from 'react';
import { Search, Clapperboard, MonitorPlay, Zap } from 'lucide-react';

const defaultFilms = [
  { title: 'The Coffee Story', desc: 'Bean to cup - A cinematic documentary.', videoId: 'P6Y-0iOnYF8' },
  { title: 'Nature 4K RELAX', desc: 'Breathtaking global scenery.', videoId: 'jgpJVI3tD5k' },
  { title: 'Avatar: Way of Water', desc: 'The cinematic movie trailer.', videoId: '5PSNL1qE6VY' },
  { title: 'Openheimer', desc: 'Nolan masterpiece official trailer.', videoId: 'uYPbbksJxIg' },
  { title: 'Bollywood Classics', desc: '90s iconic cinema moments.', videoId: '6EjGoP7llzU' }
];

export default function Films() {
  const [films, setFilms] = useState(defaultFilms);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search) {
       let id = search;
       if (search.includes('v=')) id = search.split('v=')[1].split('&')[0];
       else if (search.includes('youtu.be/')) id = search.split('youtu.be/')[1].split('?')[0];

       if (id.length >= 11) {
          const newFilm = { title: 'User Request', desc: 'Playing your shared video...', videoId: id };
          setFilms([newFilm, ...films]);
          setSearch('');
       } else {
         alert("Please paste a valid YouTube Link.");
       }
    }
  };

  return (
    <div className="mobile-wrapper" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>Exotic Cinema</h2>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Watch live summaries, trailers & movies</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
         <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
         <input 
           placeholder="Paste Movie Link here..."
           value={search}
           onChange={e => setSearch(e.target.value)}
           onKeyDown={handleSearch}
           style={{ width: '100%', paddingLeft: '2.5rem', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.85rem' }}
         />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '6rem' }}>
        {films.map((film, index) => (
          <div key={`${film.videoId}-${index}`} className="glass-panel animate-fade-in" style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)', padding: 0, minHeight: '100px' }}>
            {/* Aspect Ratio Container (for compatibility) */}
            <div style={{ background: '#000', width: '100%', paddingTop: '56.25%', position: 'relative' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${film.videoId}?rel=0&modestbranding=1&mute=0&autoplay=0`} 
                title={film.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                 <div style={{ background: 'var(--primary-color)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                    <Clapperboard size={14} color="#1a1a1a" />
                 </div>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{film.title}</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>{film.desc}</p>
            </div>
          </div>
        ))}
        
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(212, 163, 115, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-color)' }}>
           <Zap size={24} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
           <h4 style={{ margin: '0 0 0.5rem 0' }}>Request a Movie?</h4>
           <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
             Paste any YouTube video link in the search bar above to play your favorite trailers or shorts!
           </p>
        </div>
      </div>
    </div>
  );
}
