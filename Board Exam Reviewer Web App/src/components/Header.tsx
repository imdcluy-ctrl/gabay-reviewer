import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'GABAY',
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        {showBack && (
          <button className="header-back-btn" onClick={onBack} aria-label="Go back">
            ←
          </button>
        )}
        <div className="header-titles">
          <div className="header-brand-box">
            {!imgFailed ? (
              <img
                src="/logo.jpg"
                alt="GABAY Logo"
                className="header-logo-img"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="header-logo-fallback">🎓</span>
            )}
            <h1 className="header-title">{title}</h1>
          </div>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div className="header-right">{rightAction}</div>}
    </header>
  );
};
