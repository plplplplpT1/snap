import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'OK', cancelText = 'Batal' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={`relative rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up border ${
        isDark ? 'glass-dark border-white/20' : 'bg-white border-gray-200'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          <X className={`w-5 h-5 ${
            isDark ? 'text-white/60' : 'text-gray-500'
          }`} />
        </button>

        {/* Icon */}
        <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${
          isDark ? 'bg-red-500/20' : 'bg-red-100'
        }`}>
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-bold text-center mb-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>

        {/* Message */}
        <p className={`text-center mb-6 whitespace-pre-line ${
          isDark ? 'text-white/70' : 'text-gray-600'
        }`}>
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-colors ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
