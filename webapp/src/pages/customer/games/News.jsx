import React, { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, Film, Swords, Zap, Languages } from 'lucide-react';

const categories = [
  { id: 'world', name: 'World', icon: Zap, query: '' },
  { id: 'war', name: 'Conflicts', icon: Swords, query: 'war+conflict' },
  { id: 'bollywood', name: 'B-Town', icon: Film, query: 'bollywood' },
  { id: 'local', name: 'Gujarat', icon: MapPin, query: 'ahmedabad+surat' },
  { id: 'custom', name: 'Search', icon: Search, query: '' }
];

const languages = [
  { id: 'en', name: 'English', params: 'hl=en-IN&gl=IN&ceid=IN:en' },
  { id: 'hi', name: 'हिंदी', params: 'hl=hi-IN&gl=IN&ceid=IN:hi' },
  { id: 'gu', name: 'ગુજરાતી', params: 'hl=gu-IN&gl=IN&ceid=IN:gu' }
];

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activeLang, setActiveLang] = useState(languages[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchNews = useCallback(async (query = '', lang) => {
    const targetLang = lang || activeLang;
    try {
      setLoading(true);
      const rssUrl = query 
        ? `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${targetLang.params}`
        : `https://news.google.com/rss?${targetLang.params}`;
      
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const formatted = data.items.map(item => ({
          title: item.title,
          summary: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
          time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          url: item.link,
          source: item.author || 'Google News'
        }));
        setNews(formatted);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeLang]);

  useEffect(() => {
    fetchNews(activeCategory.query, activeLang);

    const interval = setInterval(() => {
      fetchNews(activeCategory.id === 'custom' ? customQuery : activeCategory.query, activeLang);
    }, 120000);

    return () => clearInterval(interval);
  }, [activeCategory, activeLang, fetchNews, customQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchNews(customQuery, activeLang);
    }
  };

  return (
    <div className="mobile-wrapper" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>Exotic Live News</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
           <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Language Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: 'var(--radius-full)' }}>
         {languages.map(lang => (
           <button 
             key={lang.id} 
             onClick={() => setActiveLang(lang)}
             style={{ 
               flex: 1, padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
               background: activeLang.id === lang.id ? 'var(--primary-color)' : 'transparent',
               color: activeLang.id === lang.id ? '#1a1a1a' : 'var(--text-muted)',
               fontWeight: 'bold', transition: 'all 0.3s ease'
             }}
           >
             {lang.name}
           </button>
         ))}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1.2rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveCategory(cat)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeCategory.id === cat.id ? 'var(--primary-color)' : 'var(--bg-card)',
              color: activeCategory.id === cat.id ? '#1a1a1a' : 'var(--text-main)',
              fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.85rem'
            }}
          >
            <cat.icon size={14} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Custom Search Box */}
      {activeCategory.id === 'custom' && (
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
           <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
           <input 
             placeholder="Search in your language..."
             value={customQuery}
             onChange={e => setCustomQuery(e.target.value)}
             onKeyDown={handleSearch}
             style={{ width: '100%', paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)', height: '42px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'white' }}
           />
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingBottom: '5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
             <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
             <p style={{ color: 'var(--text-muted)' }}>Fetching {activeLang.name} headlines...</p>
          </div>
        ) : news.length > 0 ? (
          news.map((item, index) => (
            <div key={index} className="glass-panel animate-fade-in" style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${activeCategory.id === 'war' ? 'var(--danger-color)' : 'var(--primary-color)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{item.source}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.time}</span>
              </div>
              <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1rem', lineHeight: '1.4' }}>{item.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.summary}</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem', width: '100%' }}
                onClick={() => window.open(item.url, '_blank')}
              >
                {activeLang.id === 'en' ? 'Read Full Story' : (activeLang.id === 'hi' ? 'पूरी कहानी पढ़ें' : 'પૂરી વાર્તા વાંચો')}
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No news found. Try switching categories or languages!
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0.8rem', marginTop: 'auto', border: '1px dashed var(--primary-color)' }}>
         <p style={{ fontSize: '0.75rem', margin: 0, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Languages size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Browse news in <b>English</b>, <b>Hindi</b>, or <b>Gujarati</b>!
         </p>
      </div>
    </div>
  );
}
