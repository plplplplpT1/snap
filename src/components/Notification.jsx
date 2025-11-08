import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Notification = ({ type, message, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div className={`
        rounded-xl p-4 shadow-2xl border max-w-md
        ${isDark
          ? isSuccess 
            ? 'glass-dark border-emerald-500/50 bg-emerald-500/10' 
            : 'glass-dark border-red-500/50 bg-red-500/10'
          : isSuccess
            ? 'bg-emerald-50 border-emerald-300'
            : 'bg-red-50 border-red-300'
        }
      `}>
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <CheckCircle className={`w-6 h-6 flex-shrink-0 ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
          ) : (
            <XCircle className={`w-6 h-6 flex-shrink-0 ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`} />
          )}
          
          <p className={`flex-1 font-medium ${
            isDark ? 'text-white' : isSuccess ? 'text-emerald-900' : 'text-red-900'
          }`}>
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className={`w-5 h-5 ${
              isDark ? 'text-white/60' : 'text-gray-500'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
