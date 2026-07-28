import React, { useEffect, useState } from 'react';
import { useAmbientMusic } from '../hooks/useAmbientMusic';
import './AmbientMiniPlayer.css';

export const AmbientMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    settings,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    setEnabled,
    tracks,
  } = useAmbientMusic();

  const [showAttribution, setShowAttribution] = useState(false);
  const [hasBottomNav, setHasBottomNav] = useState(true);

  // Detect if BottomNav exists in the DOM
  useEffect(() => {
    const check = () => {
      setHasBottomNav(!!document.querySelector('.bottom-nav'));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Set/clear data attribute for page padding compensation
  useEffect(() => {
    if (settings.enabled) {
      document.documentElement.setAttribute('data-ambient-active', 'true');
    } else {
      document.documentElement.removeAttribute('data-ambient-active');
    }
    return () => document.documentElement.removeAttribute('data-ambient-active');
  }, [settings.enabled]);

  // Update page padding based on whether BottomNav is present
  useEffect(() => {
    const offset = hasBottomNav
      ? 'calc(var(--bottom-nav-height) + 56px)'
      : '56px';
    document.documentElement.style.setProperty('--ambient-bottom-padding', offset);
    return () => document.documentElement.style.removeProperty('--ambient-bottom-padding');
  }, [hasBottomNav]);

  // Don't render anything if ambient is disabled
  if (!settings.enabled) return null;

  return (
    <>
      <div
        className="ambient-mini-player"
        style={{ bottom: hasBottomNav ? 'var(--bottom-nav-height)' : '0px' }}
      >
        {/* Play / Pause */}
        <button
          className="ambient-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Previous track */}
        <button
          className="ambient-skip-btn"
          onClick={prevTrack}
          aria-label="Previous track"
          title="Previous track"
        >
          ⏮
        </button>

        {/* Track info — click to toggle play/pause */}
        <button className="ambient-track-info" onClick={togglePlay} title="Play / Pause">
          <span className="ambient-track-title">{currentTrack.title}</span>
          <span className="ambient-track-artist">{currentTrack.artist}</span>
        </button>

        {/* Next track */}
        <button
          className="ambient-skip-btn"
          onClick={nextTrack}
          aria-label="Next track"
          title="Next track"
        >
          ⏭
        </button>

        {/* Volume */}
        <div className="ambient-volume-wrap">
          <span className="ambient-volume-icon" title="Volume">
            {settings.volume === 0 ? '🔇' : settings.volume < 0.5 ? '🔉' : '🔊'}
          </span>
          <input
            type="range"
            className="ambient-volume-slider"
            min="0"
            max="100"
            value={Math.round(settings.volume * 100)}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            aria-label="Volume"
            title={`Volume: ${Math.round(settings.volume * 100)}%`}
          />
        </div>

        {/* Attribution button */}
        <button
          className="ambient-attribution-btn"
          onClick={() => setShowAttribution(true)}
          aria-label="Track attributions"
          title="Music credits"
        >
          ℹ️
        </button>

        {/* Close / disable */}
        <button
          className="ambient-close-btn"
          onClick={() => setEnabled(false)}
          aria-label="Close ambient music"
          title="Close player"
        >
          ✕
        </button>
      </div>

      {/* Attribution popover */}
      {showAttribution && (
        <div
          className="ambient-attribution-overlay"
          onClick={() => setShowAttribution(false)}
        >
          <div
            className="ambient-attribution-panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="ambient-attribution-header">
              <h3>🎵 Music Credits</h3>
              <button
                className="ambient-attribution-close"
                onClick={() => setShowAttribution(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="ambient-attribution-list">
              {tracks.map((track, i) => (
                <div
                  key={track.id}
                  className="ambient-attribution-item"
                  style={{
                    borderLeft:
                      track.id === currentTrack.id
                        ? '3px solid var(--color-brand-teal)'
                        : '3px solid transparent',
                  }}
                >
                  <span className="ambient-attribution-item-icon">
                    {i === settings.currentTrackIndex && isPlaying ? '♪' : '·'}
                  </span>
                  <div className="ambient-attribution-item-text">
                    <div className="ambient-attribution-item-title">
                      {track.title}
                    </div>
                    <div className="ambient-attribution-item-artist">
                      {track.artist}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ambient-attribution-footer">
              All tracks sourced from Free To Use Music (freetouse.com).
              <br />
              Optimized for web playback at ~64kbps Opus.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

