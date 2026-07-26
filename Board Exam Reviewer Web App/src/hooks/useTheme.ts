import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('gabay-theme') as Theme) || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let activeTheme: 'light' | 'dark' = 'light';
      if (theme === 'dark') {
        activeTheme = 'dark';
      } else if (theme === 'light') {
        activeTheme = 'light';
      } else {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      }

      setEffectiveTheme(activeTheme);
      document.documentElement.setAttribute('data-theme', activeTheme);
      localStorage.setItem('gabay-theme', theme);
    };

    applyTheme();

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme, effectiveTheme };
}
