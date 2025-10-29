import React, { useEffect, useState } from 'react';

const CustomToast = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#52c41a',
          icon: '✅',
        };
      case 'error':
        return {
          backgroundColor: '#ff4d4f',
          icon: '❌',
        };
      case 'warning':
        return {
          backgroundColor: '#faad14',
          icon: '⚠️',
        };
      case 'info':
        return {
          backgroundColor: '#1890ff',
          icon: 'ℹ️',
        };
      default:
        return {
          backgroundColor: '#1890ff',
          icon: 'ℹ️',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999999,
        backgroundColor: styles.backgroundColor,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        animation: isVisible ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-out',
        fontSize: '15px',
        fontWeight: '500',
      }}
    >
      <span style={{ fontSize: '20px' }}>{styles.icon}</span>
      <span>{message}</span>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CustomToast;

