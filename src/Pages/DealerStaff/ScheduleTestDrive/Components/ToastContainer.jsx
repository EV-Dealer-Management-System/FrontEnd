import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomToast from './CustomToast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration = 3000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration = 3000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999999 }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ marginBottom: index > 0 ? '10px' : '0' }}>
            <CustomToast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

