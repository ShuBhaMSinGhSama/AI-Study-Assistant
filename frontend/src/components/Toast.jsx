import { useState, useEffect } from 'react';
import './Toast.css';

// Global function to trigger toasts from anywhere (including api.js)
export const showToast = (message, type = 'error', duration = 4000) => {
  const event = new CustomEvent('app-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const newToast = {
        id: Date.now() + Math.random(),
        ...e.detail
      };
      
      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration);
      }
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => window.removeEventListener('app-toast', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type} animate-fade-in-up`}>
          <div className="toast-icon">
            {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : 'ℹ️'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
