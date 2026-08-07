import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, Menu as MenuIcon, X } from 'lucide-react';
import { useStore } from '../StoreContext';

const WebAppHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, user, tableInfo, theme, toggleTheme } = useStore();

  const isActive = (path) => location.pathname === path;

  // Calculate cart counts
  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <nav className="sticky-navbar" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand logo (goes to menu on webapp) */}
        <Link to="/menu" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          <img src="/logo.png" alt="Exotic Cafe" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <span>Exotic Café</span>
        </Link>

        {/* Web App Specific Center Status Badge */}
        {tableInfo?.tableNo && (
          <div style={{
            background: 'rgba(212, 163, 115, 0.15)',
            color: 'var(--primary-color)',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🍽️ Table {tableInfo.tableNo}
          </div>
        )}

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          
          {/* Dark Mode toggle */}
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart Icon */}
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
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

          {/* Profile/User name */}
          <button onClick={() => navigate(user ? '/menu' : '/login')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <User size={22} />
            {user && <span className="desktop-only" style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{user.n || 'User'}</span>}
          </button>

          {/* Mobile hamburger for webapp features */}
          <button className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
            {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (simulated overlay) - Webapp items only */}
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
          <Link to="/menu" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/menu') ? 'bold' : 'normal', color: isActive('/menu') ? 'var(--primary-color)' : 'inherit' }}>Menu</Link>
          <Link to="/media-suggest" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/media-suggest') ? 'bold' : 'normal', color: isActive('/media-suggest') ? 'var(--primary-color)' : 'inherit' }}>Entertainment</Link>
          <Link to="/fun" onClick={() => setIsOpen(false)} style={{ fontWeight: isActive('/fun') ? 'bold' : 'normal', color: isActive('/fun') ? 'var(--primary-color)' : 'inherit' }}>Play Area</Link>
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

export default WebAppHeader;
