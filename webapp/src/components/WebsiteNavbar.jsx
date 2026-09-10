import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X } from 'lucide-react';

const WebsiteNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';

  return (
    <nav className={`sticky-navbar ${isHome ? 'landing-navbar' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: isHome ? '#C8A165' : 'var(--primary-color)' }}>
          <img src="/logo.png" alt="TableHive" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <span>TableHive</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Home</Link>
          <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Menu</Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>About</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} style={isHome ? { color: 'rgba(247, 243, 235, 0.8)' } : {}}>Contact</Link>
        </div>

        {/* Mobile menu trigger */}
        <button className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: isHome ? '#F7F3EB' : 'var(--text-main)' }}>
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
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
          <Link to="/" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/') ? 'bold' : 'normal', color: isActive('/') ? 'var(--primary-color)' : 'inherit' }}>Home</Link>
          <Link to="/menu" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/menu') ? 'bold' : 'normal', color: isActive('/menu') ? 'var(--primary-color)' : 'inherit' }}>Menu</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/about') ? 'bold' : 'normal', color: isActive('/about') ? 'var(--primary-color)' : 'inherit' }}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/contact') ? 'bold' : 'normal', color: isActive('/contact') ? 'var(--primary-color)' : 'inherit' }}>Contact</Link>
        </div>
      )}

      {/* Styled inline media query support */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default WebsiteNavbar;
