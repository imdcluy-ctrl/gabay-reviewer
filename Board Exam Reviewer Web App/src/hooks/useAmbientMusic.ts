import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AMBIENT_TRACKS,
  type AmbientSettings,
  getAmbientSettings,
  saveAmbientSettings,
} from '../lib/ambient';
import type { AmbientTrack } from '../types/ambient';

// ── Module-level singleton audio instance ──────────────────────

let ambientAudio: HTMLAudioElement | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function getAudio(): HTMLAudioElement {
  if (!ambientAudio) {
    ambientAudio = new Audio();
    ambientAudio.preload = 'none';
    ambientAudio.loop = false;
  }
  return ambientAudio;
}

function clearFadeTimer() {
  if (fadeTimer !== null) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

/** Fade in from 0 → target volume over `durationMs`. */
function startFadeIn(targetVolume: number, durationMs = 2000) {
  clearFadeTimer();
  const audio = getAudio();
  const steps = 20;
  const stepMs = durationMs / steps;
  const increment = targetVolume / steps;
  let step = 0;
  audio.volume = 0;
  fadeTimer = setInterval(() => {
    step++;
    if (step >= steps) {
      audio.volume = targetVolume;
      clearFadeTimer();
    } else {
      audio.volume = Math.min(targetVolume, step * increment);
    }
  }, stepMs);
}

// ── Reactive store ────────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

interface AmbientState {
  settings: AmbientSettings;
  isPlaying: boolean;
  currentTrack: AmbientTrack;
  duration: number;
  tracks: readonly AmbientTrack[];
}

const initialSettings = getAmbientSettings();
let cachedState: AmbientState = {
  settings: initialSettings,
  isPlaying: false,
  currentTrack:
    AMBIENT_TRACKS[initialSettings.currentTrackIndex] ?? AMBIENT_TRACKS[0]!,
  duration: 0,
  tracks: AMBIENT_TRACKS,
};
let cachedSettings: AmbientSettings = cachedState.settings;
let cachedIsPlaying = false;
let cachedTrackDuration = 0;

function notify() {
  listeners.forEach(fn => fn());
}

function buildState(settings: AmbientSettings, isPlaying: boolean): AmbientState {
  return {
    settings,
    isPlaying,
    currentTrack:
      AMBIENT_TRACKS[settings.currentTrackIndex] ?? AMBIENT_TRACKS[0]!,
    duration: cachedTrackDuration,
    tracks: AMBIENT_TRACKS,
  };
}

function updateCache(settings: AmbientSettings, isPlaying: boolean) {
  cachedSettings = settings;
  cachedIsPlaying = isPlaying;
  cachedState = buildState(settings, isPlaying);
  notify();
}

// ── Module-level audio controls ────────────────────────────────

function loadAndPlay(index: number, withFadeIn = false) {
  const audio = getAudio();
  const track = AMBIENT_TRACKS[index];
  if (!track) return;

  clearFadeTimer();
  audio.src = track.file;
  audio.load();

  audio.oncanplaythrough = () => {
    audio.play().catch(() => updateCache(cachedSettings, false));
    if (withFadeIn) startFadeIn(cachedSettings.volume);
    else audio.volume = cachedSettings.volume;
  };

  audio.onended = () => {
    const nextIndex = (index + 1) % AMBIENT_TRACKS.length;
    const nextSettings = { ...cachedSettings, currentTrackIndex: nextIndex };
    saveAmbientSettings(nextSettings);
    loadAndPlay(nextIndex);
  };

  audio.ondurationchange = () => {
    cachedTrackDuration = audio.duration || 0;
  };

  audio.onerror = () => {
    const nextIndex = (index + 1) % AMBIENT_TRACKS.length;
    const nextSettings = { ...cachedSettings, currentTrackIndex: nextIndex };
    saveAmbientSettings(nextSettings);
    loadAndPlay(nextIndex);
  };

  updateCache(cachedSettings, true);
}

function modulePlay(withFadeIn = false) {
  const audio = getAudio();
  if (audio.src && audio.src !== window.location.href) {
    audio.play().catch(() => updateCache(cachedSettings, false));
    if (withFadeIn) startFadeIn(cachedSettings.volume);
    else audio.volume = cachedSettings.volume;
  } else {
    loadAndPlay(cachedSettings.currentTrackIndex, withFadeIn);
  }
  updateCache(cachedSettings, true);
}

function modulePause() {
  clearFadeTimer();
  getAudio().pause();
  updateCache(cachedSettings, false);
}

function moduleSetVolume(vol: number) {
  const clamped = Math.max(0, Math.min(1, vol));
  getAudio().volume = clamped;
  const newSettings = { ...cachedSettings, volume: clamped };
  saveAmbientSettings(newSettings);
  updateCache(newSettings, cachedIsPlaying);
}

function moduleSetEnabled(enabled: boolean) {
  const newSettings = { ...cachedSettings, enabled };
  saveAmbientSettings(newSettings);
  if (!enabled) modulePause();
  updateCache(newSettings, cachedIsPlaying);
}

function moduleNextTrack() {
  const nextIndex = (cachedSettings.currentTrackIndex + 1) % AMBIENT_TRACKS.length;
  const newSettings = { ...cachedSettings, currentTrackIndex: nextIndex };
  saveAmbientSettings(newSettings);
  if (cachedIsPlaying) loadAndPlay(nextIndex);
  else { getAudio().src = ''; updateCache(newSettings, false); }
}

function modulePrevTrack() {
  const prevIndex =
    (cachedSettings.currentTrackIndex - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
  const newSettings = { ...cachedSettings, currentTrackIndex: prevIndex };
  saveAmbientSettings(newSettings);
  if (cachedIsPlaying) loadAndPlay(prevIndex);
  else { getAudio().src = ''; updateCache(newSettings, false); }
}

function moduleSeekToTrack(index: number) {
  const clamped = Math.max(0, Math.min(AMBIENT_TRACKS.length - 1, index));
  const newSettings = { ...cachedSettings, currentTrackIndex: clamped };
  saveAmbientSettings(newSettings);
  if (cachedIsPlaying) loadAndPlay(clamped);
  else { getAudio().src = ''; updateCache(newSettings, false); }
}

// ── React hook (uses useState subscription, NOT useSyncExternalStore) ──

export function useAmbientMusic() {
  const [, forceUpdate] = useState(0);

  // Subscribe to module-level state changes
  useEffect(() => {
    const cb = () => forceUpdate(n => n + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  // Auto-play with fade-in on first mount (if enabled)
  const hasAutoPlayed = useRef(false);
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    if (cachedSettings.enabled && !cachedIsPlaying) {
      const t = setTimeout(() => modulePlay(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Restore volume on mount
  useEffect(() => {
    getAudio().volume = cachedSettings.volume;
  }, []);

  const play = useCallback(() => modulePlay(), []);
  const pause = useCallback(() => modulePause(), []);
  const togglePlay = useCallback(() => {
    if (cachedIsPlaying) modulePause();
    else modulePlay();
  }, []);
  const nextTrack = useCallback(() => moduleNextTrack(), []);
  const prevTrack = useCallback(() => modulePrevTrack(), []);
  const seekToTrack = useCallback((i: number) => moduleSeekToTrack(i), []);
  const setVolume = useCallback((v: number) => moduleSetVolume(v), []);
  const setEnabled = useCallback((e: boolean) => moduleSetEnabled(e), []);
  const toggleEnabled = useCallback(
    () => moduleSetEnabled(!cachedSettings.enabled),
    [],
  );

  return {
    currentTrack: cachedState.currentTrack,
    isPlaying: cachedIsPlaying,
    settings: cachedSettings,
    duration: cachedTrackDuration,
    tracks: AMBIENT_TRACKS,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    seekToTrack,
    setVolume,
    setEnabled,
    toggleEnabled,
  } as const;
}

