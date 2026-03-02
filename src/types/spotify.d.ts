// --- Spotify Web Playback SDK ---

declare namespace Spotify {
  interface PlayerOptions {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface WebPlaybackTrack {
    uri: string;
    id: string;
    type: string;
    media_type: string;
    name: string;
    is_playable: boolean;
    album: {
      uri: string;
      name: string;
      images: { url: string; height: number; width: number }[];
    };
    artists: { uri: string; name: string }[];
  }

  interface WebPlaybackState {
    context: { uri: string; metadata: Record<string, string> | null } | null;
    disallows: Record<string, boolean>;
    paused: boolean;
    position: number;
    duration: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: WebPlaybackTrack;
      previous_tracks: WebPlaybackTrack[];
      next_tracks: WebPlaybackTrack[];
    };
  }

  interface WebPlaybackError {
    message: string;
  }

  interface ReadyEvent {
    device_id: string;
  }

  class Player {
    constructor(options: PlayerOptions);
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<WebPlaybackState | null>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
    addListener(event: "ready", callback: (data: ReadyEvent) => void): boolean;
    addListener(event: "not_ready", callback: (data: ReadyEvent) => void): boolean;
    addListener(
      event: "player_state_changed",
      callback: (state: WebPlaybackState | null) => void
    ): boolean;
    addListener(
      event:
        | "initialization_error"
        | "authentication_error"
        | "account_error"
        | "playback_error",
      callback: (error: WebPlaybackError) => void
    ): boolean;
    removeListener(event: string, callback?: Function): boolean;
  }
}

// --- YouTube IFrame Player API ---

declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { data: number; target: Player }) => void;
      onError?: (event: { data: number }) => void;
    };
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    loadVideoById(videoId: string, startSeconds?: number): void;
    cueVideoById(videoId: string, startSeconds?: number): void;
    getPlayerState(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getVolume(): number;
    setVolume(volume: number): void;
    destroy(): void;
  }
}

// --- Global Window Extensions ---

interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: typeof Spotify;
  onYouTubeIframeAPIReady: () => void;
  YT: typeof YT;
}
