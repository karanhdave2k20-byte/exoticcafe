import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on landing page, scanner page, table scan page, main admin dashboard, or when browsing on the Website port (5173)
  const isWebsite = window.location.port === '5173' || window.location.port === '' || window.location.port === '80' || window.location.port === '443';
  if (
    isWebsite || 
    location.pathname === '/' || 
    location.pathname === '/scanner' || 
    location.pathname.startsWith('/table/') || 
    location.pathname === '/admin'
  ) return null;

  const handleBack = () => {
    const path = location.pathname;
    
    // Explicit wizard step-back routes to avoid browser redirect loops
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
    <button 
      onClick={handleBack} 
      className="back-btn"
      aria-label="Go back"
    >
      <ChevronLeft size={20} />
    </button>
  );
};

export default BackButton;
