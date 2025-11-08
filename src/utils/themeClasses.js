// Helper functions for theme-aware class names

export const getGlassClass = (isDark) => 
  isDark ? 'glass-dark' : 'glass-light shadow-lg';

export const getTextClass = (isDark, variant = 'primary') => {
  const classes = {
    dark: {
      primary: 'text-white',
      secondary: 'text-white/70',
      tertiary: 'text-white/50',
      muted: 'text-white/40',
    },
    light: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      muted: 'text-gray-400',
    }
  };
  
  return classes[isDark ? 'dark' : 'light'][variant];
};

export const getBorderClass = (isDark) =>
  isDark ? 'border-white/10' : 'border-gray-200';

export const getBgClass = (isDark, opacity = 'normal') => {
  const classes = {
    dark: {
      normal: 'bg-white/5',
      light: 'bg-white/10',
      lighter: 'bg-white/20',
    },
    light: {
      normal: 'bg-gray-50',
      light: 'bg-gray-100',
      lighter: 'bg-gray-200',
    }
  };
  
  return classes[isDark ? 'dark' : 'light'][opacity];
};
