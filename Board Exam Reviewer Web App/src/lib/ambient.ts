import type { AmbientTrack } from '../types/ambient';

/**
 * Ambient music playlist — 10 royalty-free lofi / chill tracks
 * All sourced from Free To Use Music (freetouse.com)
 * Optimized to ~64kbps Opus for fast web delivery (~14MB total)
 */
export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'avanti-mindwave',
    file: '/songs/Avanti - Mindwave (freetouse.com).opus',
    title: 'Mindwave',
    artist: 'Avanti',
  },
  {
    id: 'aventure-beautiful-garden',
    file: '/songs/Aventure - A Beautiful Garden (freetouse.com).opus',
    title: 'A Beautiful Garden',
    artist: 'Aventure',
  },
  {
    id: 'aylex-meditation',
    file: '/songs/Aylex - Meditation (freetouse.com).opus',
    title: 'Meditation',
    artist: 'Aylex',
  },
  {
    id: 'chillpulse-neon-sunset',
    file: '/songs/Chill Pulse - Neon Sunset (freetouse.com).opus',
    title: 'Neon Sunset',
    artist: 'Chill Pulse',
  },
  {
    id: 'lukrembo-apple-tree',
    file: '/songs/Lukrembo - Apple Tree (freetouse.com).opus',
    title: 'Apple Tree',
    artist: 'Lukrembo',
  },
  {
    id: 'massobeats-familiar-places',
    file: '/songs/massobeats - familiar places (freetouse.com).opus',
    title: 'familiar places',
    artist: 'massobeats',
  },
  {
    id: 'massobeats-hillside',
    file: '/songs/massobeats - hillside (freetouse.com).opus',
    title: 'hillside',
    artist: 'massobeats',
  },
  {
    id: 'massobeats-peach-prosecco',
    file: '/songs/massobeats - peach prosecco (freetouse.com).opus',
    title: 'peach prosecco',
    artist: 'massobeats',
  },
  {
    id: 'moavii-downtown',
    file: '/songs/Moavii - Downtown (freetouse.com).opus',
    title: 'Downtown',
    artist: 'Moavii',
  },
  {
    id: 'moavii-midnight-bliss',
    file: '/songs/Moavii - Midnight Bliss (freetouse.com).opus',
    title: 'Midnight Bliss',
    artist: 'Moavii',
  },
];

export const AMBIENT_STORAGE_KEY = 'gabay_ambient_settings';

export interface AmbientSettings {
  enabled: boolean;
  volume: number;       // 0–1
  currentTrackIndex: number;
}

export const DEFAULT_AMBIENT_SETTINGS: AmbientSettings = {
  enabled: true,
  volume: 0.2,
  currentTrackIndex: 0,
};

export function getAmbientSettings(): AmbientSettings {
  try {
    const raw = localStorage.getItem(AMBIENT_STORAGE_KEY);
    if (raw) return { ...DEFAULT_AMBIENT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_AMBIENT_SETTINGS;
}

export function saveAmbientSettings(settings: AmbientSettings): void {
  localStorage.setItem(AMBIENT_STORAGE_KEY, JSON.stringify(settings));
}
