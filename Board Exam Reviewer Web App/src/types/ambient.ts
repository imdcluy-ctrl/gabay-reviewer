export interface AmbientTrack {
  /** Unique identifier for the track */
  id: string;
  /** URL path to the Opus file in public/songs/ */
  file: string;
  /** Display title */
  title: string;
  /** Artist name */
  artist: string;
}
