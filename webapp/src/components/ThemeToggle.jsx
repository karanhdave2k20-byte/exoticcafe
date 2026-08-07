import { Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../StoreContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useStore();
  const location = useLocation();

  // Pages that already render the Navbar and have the built-in theme toggle
  const pagesWithNavbar = [
    '/',
    '/login',
    '/people',
    '/invite',
    '/preference',
    '/menu',
    '/about',
    '/contact',
    '/cart',
    '/feedback',
    '/track',
    '/pay',
    '/suggest',
    '/thanks',
    '/media-suggest'
  ];

  const shouldHide = 
    pagesWithNavbar.includes(location.pathname) || 
    location.pathname.startsWith('/fun') || 
    location.pathname.startsWith('/admin');

  if (shouldHide) {
    return null;
  }

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle Theme"
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 5000,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        color: 'var(--primary-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)'
      }}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
