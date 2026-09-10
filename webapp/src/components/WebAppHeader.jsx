import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, Menu as MenuIcon, X, ChevronLeft, LogOut } from 'lucide-react';
import { useStore } from '../StoreContext';

const WebAppHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, user, setUser, tableInfo, setTableInfo, setCart, theme, toggleTheme, showToast } = useStore();

  const handleLogout = () => {
    localStorage.removeItem('aura-user');
    localStorage.removeItem('aura-table');
    localStorage.removeItem('aura-cart');
    localStorage.removeItem('aura-order-id');
    localStorage.removeItem('aura-recent-total');
    setUser(null);
    setTableInfo({ tableNo: null });
    setCart([]);
    setIsOpen(false);
    setShowProfileMenu(false);
    navigate('/');
    if (showToast) showToast('Logged out successfully! 👋', 'info');
  };

  const handleProfileClick = () => {
    if (user && user.isAuthenticated) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  // Calculate cart counts
  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

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
    <nav className="sticky-navbar" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand logo & back button (goes to menu on webapp) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isBackBtnVisible && (
            <button 
              onClick={handleBack} 
              aria-label="Go back"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--text-main)', 
                padding: '6px', 
                cursor: 'pointer',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                marginRight: '0.2rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary-color)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <Link 
            to="/menu" 
            className="brand-link"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontWeight: 'bold', 
              fontSize: '1.3rem', 
              fontFamily: 'var(--font-serif)', 
              color: 'var(--primary-color)',
            }}
          >
            <img src="/logo.png" alt="TableHive" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
            <span className="brand-text">TableHive</span>
          </Link>
        </div>

        {/* Web App Specific Center Status Badge */}
        {tableInfo?.tableNo && (
          <div style={{
            background: 'rgba(212, 163, 115, 0.15)',
            color: 'var(--primary-color)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap'
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
          <div style={{ position: 'relative' }}>
            <button onClick={handleProfileClick} style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <User size={22} />
              {user && user.isAuthenticated && location.pathname !== '/login' && (
                <span className="desktop-only" style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{user.n || 'User'}</span>
              )}
            </button>

            {showProfileMenu && user && user.isAuthenticated && (
              <div 
                className="glass-panel" 
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
              >
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.6rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--primary-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.n || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.2rem' }}>
                    {user.c || 'No contact info'}
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--primary-color)',
                    background: 'transparent',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-color)';
                    e.currentTarget.style.color = '#121212';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

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
        @media (max-width: 480px) {
          .brand-text {
            display: none !important;
          }
        }
        @media (min-width: 550px) {
          .brand-link {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default WebAppHeader;
