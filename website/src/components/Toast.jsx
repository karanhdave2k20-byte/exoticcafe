import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // 2 Seconds exact
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} className="toast-success" />,
    error: <AlertCircle size={20} className="toast-error" />,
    info: <Info size={20} className="toast-info" />
  };

  return (
    <div className={`toast toast-${type}`}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ opacity: 0.5, marginLeft: '0.5rem' }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
