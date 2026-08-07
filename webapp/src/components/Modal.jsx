import React from 'react';

const Modal = ({ isOpen, onClose, children, title, message, onConfirm, type = 'primary', footer }) => {
  if (!isOpen) return null;

  const accentColor = type === 'danger' ? 'var(--danger-color)' : 'var(--primary-color)';

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '2rem',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel" 
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '2.5rem',
          border: `1px solid ${accentColor}`,
          position: 'relative',
          animation: 'modal-pop 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: '1.5rem', color: accentColor, textAlign: 'center', fontSize: '1.5rem' }}>{title}</h3>
        
        <div style={{ marginBottom: '2rem', textAlign: children ? 'left' : 'center' }}>
          {children || <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{message}</p>}
        </div>
        
        {footer !== undefined ? footer : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-outline" 
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              className="btn" 
              onClick={handleConfirm}
              style={{ 
                flex: 1, 
                backgroundColor: accentColor, 
                color: type === 'danger' ? 'white' : '#1a1a1a',
                border: 'none',
                fontWeight: 'bold'
              }}
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
