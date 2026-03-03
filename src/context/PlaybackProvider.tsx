import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import PlaybackContext from "./PlaybackContext";
import type { StreamingPlatform } from "../data/types";
import type { SpotifyUserProfile } from "../lib/spotify-api";
import { playlist } from "../data/playlist";
import {
  initiateLogin,
  handleCallback,
  getValidToken,
  clearAuth,
  isAuthenticated as checkAuth,
} from "../lib/spotify-auth";
import { loadSpotifySDK } from "../lib/spotify-player";
import { getUserProfile, playTracks } from "../lib/spotify-api";
import { loadYouTubeAPI } from "../lib/youtube-player";

const PLATFORM_KEY = "ohrwurm-platform";
const VOLUME_KEY = "ohrwurm-volume";
const APPLE_READY_KEY = "ohrwurm-apple-ready";

const isMobileBrowser = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function getInitialPlatform(): StreamingPlatform {
  try {
    const stored = localStorage.getItem(PLATFORM_KEY);
    if (stored === "spotify" || stored === "apple-music" || stored === "youtube") {
      return stored;
    }
  } catch {}
  return isMobileBrowser ? "youtube" : "spotify";
}

function getInitialVolume(): number {
  try {
    const stored = localStorage.getItem(VOLUME_KEY);
    if (stored) return Number(stored);
  } catch {}
  return 0.8;
}

// Build lookup: spotifyId -> playlist track id
const spotifyIdToTrackId = new Map<string, number>();
playlist.forEach((t) => {
  if (t.spotifyId) spotifyIdToTrackId.set(t.spotifyId, t.id);
});

// All spotify URIs in order (for queueing)
const allSpotifyIds = playlist
  .filter((t) => t.spotifyId)
  .map((t) => t.spotifyId!);

// All YouTube-playable track IDs in order
const youtubeTrackIds = playlist
  .filter((t) => t.youtubeId)
  .map((t) => t.id);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  // Platform
  const [platform, setPlatform] = useState<StreamingPlatform>(getInitialPlatform);

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);

  // Spotify player
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpotifyId, setCurrentSpotifyId] = useState<string | null>(null);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolumeState] = useState(getInitialVolume);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  const lastStateRef = useRef<{ position: number; timestamp: number } | null>(null);

  // YouTube player
  const youtubePlayerRef = useRef<YT.Player | null>(null);

  // Manual tracking (Apple Music / YouTube companion mode)
  const [manualCurrentTrack, setManualCurrentTrack] = useState<number | null>(null);

  // YouTube single-player: only one embed active at a time
  const [activeYoutubeTrackId, setActiveYoutubeTrackId] = useState<number | null>(null);

  // Apple Music UX gate
  const [appleMusicReady, setAppleMusicReady] = useState(() => {
    try { return localStorage.getItem(APPLE_READY_KEY) === "true"; } catch { return false; }
  });

  const confirmAppleMusicReady = useCallback(() => {
    setAppleMusicReady(true);
    try { localStorage.setItem(APPLE_READY_KEY, "true"); } catch {}
  }, []);

  const resetAppleMusicReady = useCallback(() => {
    setAppleMusicReady(false);
    try { localStorage.removeItem(APPLE_READY_KEY); } catch {}
  }, []);

  // Derived
  const currentTrackId = currentSpotifyId
    ? spotifyIdToTrackId.get(currentSpotifyId) ?? null
    : manualCurrentTrack;

  // --- Platform ---
  const changePlatform = useCallback((p: StreamingPlatform) => {
    setPlatform(p);
    try { localStorage.setItem(PLATFORM_KEY, p); } catch {}
  }, []);

  // --- Spotify OAuth callback on mount ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      handleCallback().then((tokenData) => {
        if (tokenData) {
          setIsAuthenticated(true);
          setPlatform("spotify");
          try { localStorage.setItem(PLATFORM_KEY, "spotify"); } catch {}
        }
      });
    }
  }, []);

  // --- Load user profile when authenticated ---
  useEffect(() => {
    if (!isAuthenticated) {
      setUserProfile(null);
      return;
    }

    getValidToken().then((token) => {
      if (token) getUserProfile(token).then(setUserProfile);
    });
  }, [isAuthenticated]);

  // --- Initialize Spotify SDK when authenticated + platform is spotify ---
  useEffect(() => {
    if (!isAuthenticated || platform !== "spotify" || isMobileBrowser) return;

    let destroyed = false;

    async function init() {
      await loadSpotifySDK();
      if (destroyed) return;

      const player = new window.Spotify.Player({
        name: "Ohrwurm",
        getOAuthToken: async (cb) => {
          const token = await getValidToken();
          if (token) cb(token);
        },
        volume: volume,
      });

      player.addListener("ready", ({ device_id }) => {
        if (destroyed) return;
        deviceIdRef.current = device_id;
        setIsPlayerReady(true);
      });

      player.addListener("not_ready", () => {
        if (destroyed) return;
        setIsPlayerReady(false);
      });

      player.addListener("player_state_changed", (state) => {
        if (destroyed || !state) return;

        const { current_track } = state.track_window;
        setCurrentSpotifyId(current_track.id);
        setIsPlaying(!state.paused);
        setDurationMs(state.duration);
        setProgressMs(state.position);
        lastStateRef.current = {
          position: state.position,
          timestamp: Date.now(),
        };
      });

      player.addListener("account_error", () => {
        if (destroyed) return;
        setIsPremiumRequired(true);
        setError("Spotify Premium is required for in-browser playback.");
      });

      player.addListener("initialization_error", ({ message }) => {
        if (destroyed) return;
        setError(`Player initialization failed: ${message}`);
      });

      player.addListener("authentication_error", () => {
        if (destroyed) return;
        clearAuth();
        setIsAuthenticated(false);
        setError("Authentication expired. Please sign in again.");
      });

      player.connect();
      playerRef.current = player;
    }

    init();

    return () => {
      destroyed = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
      deviceIdRef.current = null;
      setIsPlayerReady(false);
    };
  }, [isAuthenticated, platform]);

  // --- Initialize YouTube API when platform is youtube ---
  useEffect(() => {
    if (platform !== "youtube") return;
    loadYouTubeAPI();
  }, [platform]);

  // --- Progress timer (Spotify) ---
  useEffect(() => {
    if (!isPlaying || platform !== "spotify") return;

    const interval = setInterval(() => {
      if (lastStateRef.current) {
        const elapsed = Date.now() - lastStateRef.current.timestamp;
        setProgressMs(lastStateRef.current.position + elapsed);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, platform]);

  // --- Progress timer (YouTube) ---
  useEffect(() => {
    if (!isPlaying || platform !== "youtube") return;

    const interval = setInterval(() => {
      const player = youtubePlayerRef.current;
      if (!player) return;
      try {
        const current = player.getCurrentTime();
        const duration = player.getDuration();
        if (typeof current === "number") setProgressMs(current * 1000);
        if (typeof duration === "number" && duration > 0) setDurationMs(duration * 1000);
      } catch {}
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, platform]);

  // --- Controls ---
  const login = useCallback(async () => {
    await initiateLogin();
  }, []);

  const logout = useCallback(() => {
    playerRef.current?.disconnect();
    playerRef.current = null;
    deviceIdRef.current = null;
    clearAuth();
    setIsAuthenticated(false);
    setUserProfile(null);
    setIsPlayerReady(false);
    setCurrentSpotifyId(null);
    setIsPlaying(false);
  }, []);

  const playTrack = useCallback(
    async (trackIndex: number) => {
      const track = playlist.find((t) => t.id === trackIndex);
      if (!track) return;

      if (platform === "spotify" && isPlayerReady && deviceIdRef.current) {
        const token = await getValidToken();
        if (!token) return;

        // Find offset in the allSpotifyIds array
        const offset = allSpotifyIds.indexOf(track.spotifyId!);
        if (offset === -1) return;

        await playTracks(token, deviceIdRef.current, allSpotifyIds, offset);
      } else {
        // Companion mode — just mark the track
        setManualCurrentTrack(trackIndex);
      }
    },
    [platform, isPlayerReady]
  );

  const togglePlayPause = useCallback(() => {
    if (platform === "spotify" && playerRef.current) {
      playerRef.current.togglePlay();
    } else if (platform === "youtube" && youtubePlayerRef.current) {
      const state = youtubePlayerRef.current.getPlayerState();
      if (state === 1) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  }, [platform]);

  const seekTo = useCallback(
    (ms: number) => {
      if (platform === "spotify" && playerRef.current) {
        playerRef.current.seek(ms);
      } else if (platform === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(ms / 1000, true);
      }
    },
    [platform]
  );

  // YouTube single-player controls
  const registerYoutubePlayer = useCallback((player: YT.Player | null) => {
    // Only update the ref — component cleanup handles its own player.destroy()
    youtubePlayerRef.current = player;
  }, []);

  const setYoutubePlayState = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const playYoutubeTrack = useCallback((trackId: number) => {
    setActiveYoutubeTrackId(trackId);
    setManualCurrentTrack(trackId);
    setIsPlaying(true);
    setError(null);
  }, []);

  const stopYoutube = useCallback(() => {
    const player = youtubePlayerRef.current;
    if (player) {
      try { player.destroy(); } catch {}
      youtubePlayerRef.current = null;
    }
    setActiveYoutubeTrackId(null);
    setIsPlaying(false);
    setProgressMs(0);
    setDurationMs(0);
  }, []);

  const advanceYoutube = useCallback(() => {
    if (activeYoutubeTrackId === null) return;
    const idx = youtubeTrackIds.indexOf(activeYoutubeTrackId);
    if (idx === -1 || idx >= youtubeTrackIds.length - 1) {
      stopYoutube();
      return;
    }
    playYoutubeTrack(youtubeTrackIds[idx + 1]);
  }, [activeYoutubeTrackId, stopYoutube, playYoutubeTrack]);

  const skipNext = useCallback(() => {
    if (platform === "spotify" && playerRef.current) {
      playerRef.current.nextTrack();
    } else if (platform === "youtube" && activeYoutubeTrackId !== null) {
      const idx = youtubeTrackIds.indexOf(activeYoutubeTrackId);
      if (idx !== -1 && idx < youtubeTrackIds.length - 1) {
        playYoutubeTrack(youtubeTrackIds[idx + 1]);
      }
    }
  }, [platform, activeYoutubeTrackId, playYoutubeTrack]);

  const skipPrevious = useCallback(() => {
    if (platform === "spotify" && playerRef.current) {
      playerRef.current.previousTrack();
    } else if (platform === "youtube" && activeYoutubeTrackId !== null) {
      const idx = youtubeTrackIds.indexOf(activeYoutubeTrackId);
      if (idx > 0) {
        playYoutubeTrack(youtubeTrackIds[idx - 1]);
      }
    }
  }, [platform, activeYoutubeTrackId, playYoutubeTrack]);

  const setVolume = useCallback(
    (v: number) => {
      setVolumeState(v);
      try { localStorage.setItem(VOLUME_KEY, String(v)); } catch {}
      if (platform === "spotify" && playerRef.current) {
        playerRef.current.setVolume(v);
      } else if (platform === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.setVolume(v * 100);
      }
    },
    [platform]
  );

  return (
    <PlaybackContext.Provider
      value={{
        platform,
        changePlatform,
        isAuthenticated,
        userProfile,
        login,
        logout,
        isPlayerReady,
        isPlaying,
        currentTrackId,
        currentSpotifyId,
        progressMs,
        durationMs,
        playTrack,
        togglePlayPause,
        skipNext,
        skipPrevious,
        seekTo,
        volume,
        setVolume,
        manualCurrentTrack,
        setManualCurrentTrack,
        appleMusicReady,
        confirmAppleMusicReady,
        resetAppleMusicReady,
        isMobile: isMobileBrowser,
        error,
        isPremiumRequired,
        youtubePlayerRef,
        activeYoutubeTrackId,
        playYoutubeTrack,
        stopYoutube,
        registerYoutubePlayer,
        setYoutubePlayState,
        advanceYoutube,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}
