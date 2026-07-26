import { useCallback, useSyncExternalStore } from 'react';

type SoundType = 'correct' | 'wrong' | 'transition' | 'complete' | 'streak' | 'achievement';

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
  quietMode: boolean;
}

const STORAGE_KEY = 'gabay_sound_settings';

function getSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.6,
  quietMode: true,
};

let globalSettings = getSettings();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

function saveSettings(settings: SoundSettings) {
  globalSettings = settings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  notifyListeners();
}

function subscribeToSettings(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): SoundSettings {
  return globalSettings;
}

// --- Web Audio API Tone Generation ---

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}


function playNoteSequence(
  notes: { freq: number; time: number; duration: number; type?: OscillatorType; volOffset?: number }[],
) {
  const ctx = getAudioContext();
  notes.forEach(({ freq, time, duration, type = 'sine', volOffset = 0 }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
    gain.gain.setValueAtTime(Math.min(1, Math.max(0, (globalSettings.volume + volOffset))), ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + duration);
  });
}

// --- Sound Generators ---

function playCorrectSound() {
  playNoteSequence([
    { freq: 523.25, time: 0, duration: 0.15 },    // C5
    { freq: 659.25, time: 0.1, duration: 0.15 },   // E5
    { freq: 783.99, time: 0.2, duration: 0.25 },   // G5
  ]);
}

function playWrongSound() {
  playNoteSequence([
    { freq: 220, time: 0, duration: 0.2, type: 'sawtooth', volOffset: -0.15 },
    { freq: 164.81, time: 0.12, duration: 0.3, type: 'sawtooth', volOffset: -0.15 },
  ]);
}

function playTransitionSound() {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(globalSettings.volume * 0.15, ctx.currentTime);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

function playCompleteSound() {
  playNoteSequence([
    { freq: 523.25, time: 0, duration: 0.2 },
    { freq: 659.25, time: 0.15, duration: 0.2 },
    { freq: 783.99, time: 0.3, duration: 0.2 },
    { freq: 1046.5, time: 0.45, duration: 0.4 },
  ]);
}

function playStreakSound() {
  playNoteSequence([
    { freq: 659.25, time: 0, duration: 0.1 },
    { freq: 783.99, time: 0.08, duration: 0.1 },
    { freq: 1046.5, time: 0.16, duration: 0.3, type: 'triangle' },
  ]);
}

function playAchievementSound() {
  playNoteSequence([
    { freq: 784, time: 0, duration: 0.12, type: 'triangle' },
    { freq: 988, time: 0.1, duration: 0.12, type: 'triangle' },
    { freq: 1175, time: 0.2, duration: 0.12, type: 'triangle' },
    { freq: 1319, time: 0.3, duration: 0.3, type: 'triangle' },
    { freq: 1568, time: 0.4, duration: 0.5, type: 'sine', volOffset: 0.05 },
  ]);
}

function isQuietHours(): boolean {
  if (!globalSettings.quietMode) return false;
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
}

export function useSound() {
  const settings = useSyncExternalStore(subscribeToSettings, getSnapshot);

  const play = useCallback((type: SoundType) => {
    if (!settings.enabled || isQuietHours()) return;
    switch (type) {
      case 'correct': playCorrectSound(); break;
      case 'wrong': playWrongSound(); break;
      case 'transition': playTransitionSound(); break;
      case 'complete': playCompleteSound(); break;
      case 'streak': playStreakSound(); break;
      case 'achievement': playAchievementSound(); break;
    }
  }, [settings.enabled]);

  const toggle = useCallback(() => {
    saveSettings({ ...globalSettings, enabled: !globalSettings.enabled });
  }, []);

  const setVolume = useCallback((volume: number) => {
    saveSettings({ ...globalSettings, volume: Math.max(0, Math.min(1, volume)) });
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    saveSettings({ ...globalSettings, enabled });
  }, []);

  return {
    play,
    toggle,
    setVolume,
    setEnabled,
    isMuted: !settings.enabled,
    volume: settings.volume,
    isQuietHours: isQuietHours(),
  };
}

