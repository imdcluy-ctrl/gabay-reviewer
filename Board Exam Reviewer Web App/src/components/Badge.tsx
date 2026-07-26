import React from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'teal' | 'gold' | 'correct' | 'incorrect' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'teal',
  children,
  className = '',
}) => {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
};
