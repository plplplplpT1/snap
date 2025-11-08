import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-6 right-6 z-50 p-3 rounded-xl
        transition-all duration-300 hover:scale-110 active:scale-95
        ${isDark 
          ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
          : 'bg-black/5 hover:bg-black/10 border border-black/10 shadow-lg'
        }
      `}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
