import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Calendar, Info, Phone, Menu as MenuIcon, X, Moon, Sun, Coffee, ChevronLeft } from 'lucide-react';
import { useStore } from '../StoreContext';

export default function Navbar() {
  const { cart, user, theme, toggleTheme, tableInfo } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';
  const isWebApp = window.location.port === '5174';

  // Check if back button is visible
  const isWebsite = window.location.port === '5173' || window.location.port === '' || window.location.port === '80' || window.location.port === '443';
  const isBackBtnVisible = !(
    isWebsite || 
    location.pathname === '/' || 
    location.pathname === '/scanner' || 
    location.pathname.startsWith('/table/') || 
    location.pathname === '/admin'
  );

  const handleBack = () => {
    const path = location.pathname;
    if (path === '/login') {
      navigate('/');
    } else if (path === '/people') {
      navigate('/login');
    } else if (path === '/invite') {
      navigate('/people');
    } else if (path === '/preference') {
      navigate('/invite');
    } else {
      navigate(-1);
    }
  };

  return (
    <nav className={`sticky-navbar ${isHome ? 'landing-navbar' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand logo & back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isBackBtnVisible && (
            <button 
              onClick={handleBack} 
              aria-label="Go back"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: isHome ? '#F7F3EB' : 'var(--text-main)', 
                padding: '6px', 
                cursor: 'pointer',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: isHome ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                marginRight: '0.2rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = isHome ? '#C8A165' : 'var(--primary-color)';
                e.currentTarget.style.borderColor = isHome ? '#C8A165' : 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isHome ? '#F7F3EB' : 'var(--text-main)';
                e.currentTarget.style.borderColor = isHome ? 'rgba(255,255,255,0.1)' : 'var(--border-color)';
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <Link to={isWebApp ? '/menu' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: isHome ? '#C8A165' : 'var(--primary-color)' }}>
            <img src="/logo.png" alt="TableHive" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
            <span>TableHive</span>
          </Link>
        </div>

        {/* Desktop Links - Hidden in Web App Mode */}
        {!isWebApp && (
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Home</Link>
            <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Menu</Link>
            <Link to="/preference" className={`nav-link ${isActive('/preference') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Book Table</Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>About</Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Contact</Link>
            <Link to="/media-suggest" className={`nav-link ${isActive('/media-suggest') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Entertainment</Link>
            <Link to="/fun" className={`nav-link ${isActive('/fun') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Play Area</Link>
          </div>
        )}

        {/* Icons Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Dark Mode toggle */}
          <button onClick={toggleTheme} style={{ color: isHome ? '#F7F3EB' : 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart Icon */}
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: isHome ? '#F7F3EB' : 'var(--text-main)' }}>
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--primary-color)',
                color: '#121212',
                borderRadius: '50%',
                fontSize: '0.7rem',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile/Table link */}
          <button onClick={() => navigate(user ? '/menu' : '/login')} style={{ color: isHome ? '#F7F3EB' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={22} />
            {user && <span style={{ fontSize: '0.8rem', color: isHome ? '#C8A165' : 'var(--primary-color)' }}>{user.n || 'User'}</span>}
          </button>

          {/* Mobile hamburger */}
          <button className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', color: isHome ? '#F7F3EB' : 'var(--text-main)' }}>
            {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (simulated overlay) */}
      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderTop: '1px solid var(--border-color)',
          zIndex: 999
        }}>
          {isWebApp ? (
            <>
              <Link to="/menu" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/menu') ? 'bold' : 'normal', color: isActive('/menu') ? 'var(--primary-color)' : 'inherit' }}>Menu</Link>
              <Link to="/media-suggest" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/media-suggest') ? 'bold' : 'normal', color: isActive('/media-suggest') ? 'var(--primary-color)' : 'inherit' }}>Entertainment</Link>
              <Link to="/fun" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/fun') ? 'bold' : 'normal', color: isActive('/fun') ? 'var(--primary-color)' : 'inherit' }}>Play Area</Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/') ? 'bold' : 'normal', color: isActive('/') ? 'var(--primary-color)' : 'inherit' }}>Home</Link>
              <Link to="/menu" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/menu') ? 'bold' : 'normal', color: isActive('/menu') ? 'var(--primary-color)' : 'inherit' }}>Menu</Link>
              <Link to="/preference" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/preference') ? 'bold' : 'normal', color: isActive('/preference') ? 'var(--primary-color)' : 'inherit' }}>Book Table</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/about') ? 'bold' : 'normal', color: isActive('/about') ? 'var(--primary-color)' : 'inherit' }}>About</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/contact') ? 'bold' : 'normal', color: isActive('/contact') ? 'var(--primary-color)' : 'inherit' }}>Contact</Link>
              <Link to="/media-suggest" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/media-suggest') ? 'bold' : 'normal', color: isActive('/media-suggest') ? 'var(--primary-color)' : 'inherit' }}>Entertainment</Link>
              <Link to="/fun" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/fun') ? 'bold' : 'normal', color: isActive('/fun') ? 'var(--primary-color)' : 'inherit' }}>Play Area</Link>
            </>
          )}
        </div>
      )}

      {/* Styled inline media query support */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
