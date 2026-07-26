import React from 'react';
import { useSound } from '../hooks/useSound';
import './SoundToggle.css';

export const SoundToggle: React.FC = () => {
  const { isMuted, toggle, isQuietHours } = useSound();

  return (
    <button
      className={`sound-toggle-btn ${isMuted ? 'muted' : ''}`}
      onClick={toggle}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      title={isQuietHours ? 'Quiet hours active (10PM - 7AM)' : (isMuted ? 'Sound is muted' : 'Sound is on')}
    >
      {isQuietHours ? '🌙' : isMuted ? '🔇' : '🔊'}
    </button>
  );
};
