import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Star, Mic, Heart, ArrowUpDown, Languages
} from 'lucide-react';
import { useStore } from '../../StoreContext';
import WebsiteNavbar from '../../components/WebsiteNavbar';

export default function Menu() {
  const navigate = useNavigate();
  const { 
    mockMenu, showToast, favorites, toggleFavorite
  } = useStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState('en');
  
  // Advanced Filter & Sort states
  const [sortBy, setSortBy] = useState('popular'); // 'low-to-high', 'high-to-low', 'popular', 'rating'
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedTag, setSelectedTag] = useState('all'); // 'all', 'bestseller', 'new', 'promo'

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    showToast(`Language set to ${next === 'en' ? 'English' : 'हिंदी'}`, 'info');
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => showToast('Listening...', 'info');
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      showToast(`Searching for "${transcript}"`, 'success');
    };
    recognition.start();
  };

  const categories = ['All', 'Coffee', 'Pizza', 'Burger', 'Dessert', 'Cold Drinks', 'Breakfast', 'Fast Food'];

  // Enhanced Filtering and Sorting Logic
  const filteredAndSortedMenu = useMemo(() => {
    let result = [...mockMenu];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory);
    }



    // Search query filter
    if (searchQuery) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price Filter
    result = result.filter(item => item.price <= maxPrice);

    // Filter tags (Best Seller, Popular, New)
    if (selectedTag === 'bestseller') {
      result = result.filter(item => item.isBestSeller);
    } else if (selectedTag === 'new') {
      result = result.filter(item => item.isNew);
    } else if (selectedTag === 'promo') {
      result = result.filter(item => item.discount > 0);
    }

    // Sorting
    if (sortBy === 'low-to-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'popular') {
      // Prioritize popular items, then best sellers
      result.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
    }

    return result;
  }, [mockMenu, activeCategory, searchQuery, maxPrice, selectedTag, sortBy]);

  const aiSuggestions = useMemo(() => {
    return [...mockMenu].filter(item => item.isPopular).slice(0, 4);
  }, [mockMenu]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '6rem', background: 'var(--bg-color)' }}>
      {/* 2. Navbar */}
      <WebsiteNavbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Profile info header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: 'rgba(111, 78, 55, 0.1)', 
            color: 'var(--primary-color)', 
            padding: '0.4rem 1rem', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            ✨ MENU PREVIEW
          </div>
          <h2 style={{ fontSize: '2.4rem', margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>Our Culinary Delights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>Explore our hand-crafted selection of beverages and dishes</p>
        </div>

        {/* 4. Search and Voice Search */}
        <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
          <Search size={20} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search delicious coffees, pizzas, burgers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '3rem', paddingRight: '3rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: 'none', height: '50px', fontSize: '1rem', boxShadow: 'var(--shadow-sm)' }} 
          />
          <Mic 
            size={20} 
            onClick={startVoiceSearch}
            style={{ position: 'absolute', top: '15px', right: '16px', color: 'var(--primary-color)', cursor: 'pointer' }} 
          />
        </div>

        {/* Filters and Sorting control panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.2rem', flex: 1 }}>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)} 
                  className={activeCategory === cat ? 'btn btn-primary' : 'btn'} 
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1.2rem', background: activeCategory === cat ? '' : 'var(--bg-card-hover)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={16} color="var(--primary-color)" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '160px', padding: '0.4rem 0.8rem', background: 'var(--bg-card-hover)', fontSize: '0.85rem', border: 'none' }}
              >
                <option value="popular">Popularity</option>
                <option value="rating">Highest Rated</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Price Filter slider and special badge filter */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Price:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{maxPrice}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="1000" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ accentColor: 'var(--primary-color)', height: '4px', cursor: 'pointer', padding: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tags:</span>
              <button 
                onClick={() => setSelectedTag(selectedTag === 'bestseller' ? 'all' : 'bestseller')}
                style={{ 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: 'var(--radius-full)', 
                  background: selectedTag === 'bestseller' ? 'var(--primary-color)' : 'var(--bg-card-hover)', 
                  color: selectedTag === 'bestseller' ? '#121212' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                Best Seller
              </button>
              <button 
                onClick={() => setSelectedTag(selectedTag === 'new' ? 'all' : 'new')}
                style={{ 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: 'var(--radius-full)', 
                  background: selectedTag === 'new' ? 'var(--primary-color)' : 'var(--bg-card-hover)', 
                  color: selectedTag === 'new' ? '#121212' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                New Items
              </button>
              <button 
                onClick={() => setSelectedTag(selectedTag === 'promo' ? 'all' : 'promo')}
                style={{ 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: 'var(--radius-full)', 
                  background: selectedTag === 'promo' ? 'var(--primary-color)' : 'var(--bg-card-hover)', 
                  color: selectedTag === 'promo' ? '#121212' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                Deals
              </button>

            </div>
          </div>
        </div>

        {/* AI Recommendations Banner */}
        <h3 style={{ fontSize: '1.3rem', marginTop: '2.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: '700' }}>
          <Star size={22} fill="var(--primary-color)" /> AI Coffee & Food Recommendations
        </h3>
        <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '1.2rem', scrollbarWidth: 'none', marginBottom: '2.5rem' }}>
          {aiSuggestions.map(item => (
            <div key={item.id} className="glass-panel" style={{ minWidth: '180px', padding: '1rem', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                <img src={item.img} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }} />
                {item.isVeg && (
                  <div style={{ position: 'absolute', top: '15px', left: '15px', width: '12px', height: '12px', border: '1px solid green', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '2px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'green', borderRadius: '50%' }}></div>
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price}</span>
                </div>
            </div>
          ))}
        </div>


        {/* 5. Product Cards Grid */}
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>Menu Items</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredAndSortedMenu.map(item => {
            const isFav = favorites.includes(item.id);
            return (
              <div key={item.id} className="glass-panel product-card-premium" style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                
                {/* Discount Badge */}
                {item.discount > 0 && <span className="discount-badge">{item.discount}% OFF</span>}

                {/* Favorite Button */}
                <button 
                  onClick={() => toggleFavorite(item.id)} 
                  className={`favorite-btn ${isFav ? 'active' : ''}`}
                >
                  <Heart size={18} fill={isFav ? 'currentColor' : 'transparent'} />
                </button>

                {/* Card Image */}
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', height: '160px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {item.isVeg && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', border: '1px solid green', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '2px', zIndex: 1 }}>
                      <div style={{ width: '10px', height: '10px', background: 'green', borderRadius: '50%' }}></div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 'bold' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                      ⏱️ {item.prepTime || 10} mins
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>{item.desc || 'No description available.'}</p>
                  
                  {/* Rating & Details display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary-color)' }}>
                      <Star size={14} fill="var(--primary-color)" />
                      <span>{item.rating || '4.5'}</span>
                    </div>
                    {item.calories && <span style={{ color: 'var(--text-muted)' }}>🔥 {item.calories}</span>}
                    {item.strength && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Strength: {Array(item.strength).fill('🫘').join('')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Cart control */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if nothing matches filters */}
        {filteredAndSortedMenu.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No items match your selected filters.</p>
            <button className="btn btn-outline" onClick={() => { setActiveCategory('All'); setSearchQuery(''); setSelectedTag('all'); setMaxPrice(1000); }}>
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
