import React from 'react';
import { useTheme } from '../context/ThemeContext';

const FlowingLines = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${
      isDark ? 'opacity-30' : 'opacity-20'
    }`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={isDark ? "#3b82f6" : "#10b981"} stopOpacity={isDark ? "0.6" : "0.4"} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={isDark ? "#8b5cf6" : "#059669"} stopOpacity={isDark ? "0.6" : "0.4"} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Flowing curved lines */}
        <path
          d="M 0 150 Q 200 100, 400 150 T 800 150 T 1200 150 T 1600 150"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse-slow"
        />
        <path
          d="M 0 200 Q 250 150, 500 200 T 1000 200 T 1500 200 T 2000 200"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M 0 250 Q 300 200, 600 250 T 1200 250 T 1800 250"
          stroke="url(#gradient1)"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />
        <path
          d="M 0 300 Q 200 250, 400 300 T 800 300 T 1200 300 T 1600 300"
          stroke="url(#gradient2)"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse-slow"
          style={{ animationDelay: '0.5s' }}
        />
        <path
          d="M 0 350 Q 350 300, 700 350 T 1400 350"
          stroke="url(#gradient1)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse-slow"
          style={{ animationDelay: '1.5s' }}
        />
      </svg>
    </div>
  );
};

export default FlowingLines;
