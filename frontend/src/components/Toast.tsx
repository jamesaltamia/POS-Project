import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const typeStyles = {
  success: 'bg-green-100 text-green-800 border-green-400',
  error: 'bg-red-100 text-red-800 border-red-400',
  info: 'bg-blue-100 text-blue-800 border-blue-400',
};

const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 border-l-4 px-4 py-3 rounded shadow-lg transition-all ${typeStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-lg font-bold text-gray-400 hover:text-gray-700">&times;</button>
      </div>
    </div>
  );
};

export default Toast; 