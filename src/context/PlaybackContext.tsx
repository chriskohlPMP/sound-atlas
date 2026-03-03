import { createContext, useContext } from "react";
import type { StreamingPlatform } from "../data/types";
import type { SpotifyUserProfile } from "../lib/spotify-api";

export interface PlaybackContextValue {
  // Platform
  platform: StreamingPlatform;
  changePlatform: (p: StreamingPlatform) => void;

  // Auth (Spotify)
  isAuthenticated: boolean;
  userProfile: SpotifyUserProfile | null;
  login: () => Promise<void>;
  logout: () => void;

  // Player state
  isPlayerReady: boolean;
  isPlaying: boolean;
  currentTrackId: number | null; // playlist track id (1-52)
  currentSpotifyId: string | null;
  progressMs: number;
  durationMs: number;

  // Player controls
  playTrack: (trackIndex: number) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seekTo: (ms: number) => void;
  volume: number;
  setVolume: (v: number) => void;

  // Apple Music / YouTube manual tracking
  manualCurrentTrack: number | null;
  setManualCurrentTrack: (id: number | null) => void;

  // Apple Music UX gate
  appleMusicReady: boolean;
  confirmAppleMusicReady: () => void;
  resetAppleMusicReady: () => void;

  // Mobile
  isMobile: boolean;

  // Errors
  error: string | null;
  isPremiumRequired: boolean;

  // YouTube
  youtubePlayerRef: React.MutableRefObject<YT.Player | null> | null;
  activeYoutubeTrackId: number | null;
  playYoutubeTrack: (trackId: number) => void;
  stopYoutube: () => void;
  registerYoutubePlayer: (player: YT.Player | null) => void;
  setYoutubePlayState: (playing: boolean) => void;
  advanceYoutube: () => void;
  autoAdvance: boolean;
  toggleAutoAdvance: () => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function usePlayback(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used within PlaybackProvider");
  return ctx;
}

export default PlaybackContext;
