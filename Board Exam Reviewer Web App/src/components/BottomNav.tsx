import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/study', label: 'Study', icon: '📖' },
    { path: '/review', label: 'Review', icon: '🔄' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname);

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
        {activeIndex !== -1 && (
          <div
            className="active-indicator"
            style={{
              left: `${(activeIndex * 100) / tabs.length}%`,
              width: `${100 / tabs.length}%`,
            }}
          />
        )}
      </div>
    </nav>
  );
};
