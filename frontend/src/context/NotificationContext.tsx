import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import type { ReactNode } from 'react';
import type { ToastType } from '../components/Toast';

interface NotificationContextType {
  showNotification: (message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showNotification = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const handleClose = () => setToast(null);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={handleClose} />
      )}
    </NotificationContext.Provider>
  );
}; 