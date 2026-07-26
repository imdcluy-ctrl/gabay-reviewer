import React from 'react';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'system', label: 'System', icon: '🖥️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
  ];

  const activeIndex = themes.findIndex(t => t.id === theme);

  return (
    <div className="theme-toggle-wrapper">
      <div className="theme-toggle-track">
        {themes.map(t => (
          <button
            key={t.id}
            className={`theme-btn ${theme === t.id ? 'active' : ''}`}
            onClick={() => setTheme(t.id)}
            aria-label={`Set ${t.label} theme`}
          >
            <span className="theme-icon">{t.icon}</span>
            <span className="theme-label">{t.label}</span>
          </button>
        ))}
        {activeIndex !== -1 && (
          <div
            className="theme-slider"
            style={{
              left: `${(activeIndex * 100) / themes.length}%`,
              width: `${100 / themes.length}%`,
            }}
          />
        )}
      </div>
    </div>
  );
};
