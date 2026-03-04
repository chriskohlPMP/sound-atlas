import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, ExternalLink, Search, AlertTriangle, ChevronDown } from "lucide-react";
import type { Track } from "../data/types";
import { usePlayback } from "../context/PlaybackContext";
import { loadYouTubeAPI } from "../lib/youtube-player";

interface YouTubeEmbedProps {
  track: Track;
}

export function YouTubeEmbed({ track }: YouTubeEmbedProps) {
  const {
    activeYoutubeTrackId,
    playYoutubeTrack,
    registerYoutubePlayer,
    setYoutubePlayState,
    advanceYoutube,
    autoAdvance,
    togglePlayPause,
    isPlaying,
    volume,
    isMobile,
  } = usePlayback();

  const isActive = activeYoutubeTrackId === track.id;
  const wrapperRef = useRef<HTMLDivElement>(null);
  // hostRef is always in the DOM (hidden when inactive) so the click handler
  // can create the YT.Player synchronously — preserving the user-gesture chain
  // that mobile browsers require for autoplay.
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const destroyedRef = useRef(false);
  const createdInClickRef = useRef(false);
  const [embedError, setEmbedError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Build a YT.Player inside the host div
  const createPlayer = useCallback(() => {
    if (!hostRef.current || !track.youtubeId || !window.YT?.Player) return false;

    hostRef.current.innerHTML = "";
    destroyedRef.current = false;

    const target = document.createElement("div");
    hostRef.current.appendChild(target);

    new window.YT.Player(target, {
      videoId: track.youtubeId,
      width: "100%",
      height: 220,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          if (destroyedRef.current) return;
          playerRef.current = event.target;
          registerYoutubePlayer(event.target);
          event.target.setVolume(volume * 100);
          if (track.youtubeStart) {
            event.target.seekTo(track.youtubeStart, true);
          }
        },
        onStateChange: (event) => {
          if (destroyedRef.current) return;
          const state = event.data;
          if (state === YT.PlayerState.PLAYING) {
            setYoutubePlayState(true);
          } else if (state === YT.PlayerState.PAUSED) {
            setYoutubePlayState(false);
          } else if (state === YT.PlayerState.ENDED) {
            setYoutubePlayState(false);
            if (autoAdvance) advanceYoutube();
          }
        },
        onError: (event) => {
          if (destroyedRef.current) return;
          const code = event.data;
          if (code === 101 || code === 150 || code === 100) {
            setEmbedError(true);
            setYoutubePlayState(false);
          }
        },
      },
    });

    return true;
  }, [track.youtubeId, track.youtubeStart, volume, registerYoutubePlayer, setYoutubePlayState, autoAdvance, advanceYoutube]);

  // Click handler — on mobile, insert a plain iframe (browser allows autoplay
  // from iframes inserted directly in a click handler). On desktop, use the
  // YT.Player API for full programmatic control.
  const handleActivate = useCallback(() => {
    if (!track.youtubeId || !hostRef.current) return;
    setEmbedError(false);
    playYoutubeTrack(track.id);

    if (isMobile) {
      // Plain iframe — the iframe load is gesture-initiated so autoplay works
      hostRef.current.innerHTML = "";
      const iframe = document.createElement("iframe");
      const params = new URLSearchParams({
        autoplay: "1",
        playsinline: "1",
        rel: "0",
        modestbranding: "1",
      });
      if (track.youtubeStart) params.set("start", String(track.youtubeStart));
      if (track.youtubeEnd) params.set("end", String(track.youtubeEnd));
      iframe.src = `https://www.youtube.com/embed/${track.youtubeId}?${params}`;
      iframe.width = "100%";
      iframe.height = "220";
      iframe.allow = "autoplay; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.style.border = "none";
      iframe.style.borderRadius = "0.5rem";
      hostRef.current.appendChild(iframe);
      createdInClickRef.current = true;
    } else {
      // Desktop: use YT.Player API for progress, skip, volume control
      if (createPlayer()) {
        createdInClickRef.current = true;
      }
    }
  }, [track.id, track.youtubeId, track.youtubeStart, track.youtubeEnd, isMobile, playYoutubeTrack, createPlayer]);

  // Fallback creation (desktop, API wasn't loaded at click time) + cleanup
  useEffect(() => {
    if (!isActive || !track.youtubeId) return;

    let localDestroyed = false;

    if (createdInClickRef.current) {
      // Player/iframe was already created in click handler — skip
      createdInClickRef.current = false;
    } else if (!isMobile) {
      // Desktop fallback: API wasn't ready during click — load async and create
      (async () => {
        await loadYouTubeAPI();
        if (localDestroyed || !hostRef.current) return;
        setEmbedError(false);
        createPlayer();
      })();
    }

    return () => {
      localDestroyed = true;
      destroyedRef.current = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      if (hostRef.current) hostRef.current.innerHTML = "";
      registerYoutubePlayer(null);
    };
  }, [isActive, track.youtubeId]);

  // Stop at youtubeEnd timestamp — pause always, advance only if enabled
  useEffect(() => {
    if (!isActive || !track.youtubeEnd || !isPlaying) return;

    const interval = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const current = playerRef.current.getCurrentTime();
        if (current >= track.youtubeEnd!) {
          playerRef.current.pauseVideo();
          setYoutubePlayState(false);
          if (autoAdvance) advanceYoutube();
        }
      } catch {}
    }, 500);

    return () => clearInterval(interval);
  }, [isActive, isPlaying, track.youtubeEnd, autoAdvance, advanceYoutube, setYoutubePlayState]);

  // IntersectionObserver for sticky mini-player
  useEffect(() => {
    if (!isActive) {
      setIsVisible(true);
      return;
    }
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isActive]);

  if (!track.youtubeId) return null;

  const searchQuery = encodeURIComponent(`${track.artist} ${track.title}`);
  const showStickyBar = isActive && isPlaying && !isVisible && !embedError;

  return (
    <div ref={wrapperRef}>
      {/* Error fallback */}
      {isActive && embedError && (
        <div className="w-full h-[220px] rounded-lg bg-surface border border-border flex flex-col items-center justify-center gap-3 text-center px-4">
          <AlertTriangle className="w-8 h-8 text-text-muted" />
          <p className="text-sm text-text-muted">
            This video can't be embedded. Open it directly:
          </p>
          <div className="flex items-center gap-3">
            <a
              href={`https://music.youtube.com/watch?v=${track.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              YouTube Music
            </a>
            <a
              href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-surface-hover text-text-secondary hover:text-text-primary border border-border transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              YouTube
            </a>
          </div>
        </div>
      )}

      {/* Host div always in DOM so click handler can create player synchronously */}
      <div
        ref={hostRef}
        className={`rounded-lg overflow-hidden ${(!isActive || embedError) ? "hidden" : ""}`}
      />

      {/* Thumbnail (only when not active) */}
      {!isActive && (
        <button
          onClick={handleActivate}
          className="relative w-full h-[220px] rounded-lg overflow-hidden group cursor-pointer bg-black"
        >
          <img
            src={`https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`}
            alt={track.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </button>
      )}

      <div className="flex items-center gap-3 mt-2">
        <a
          href={`https://music.youtube.com/watch?v=${track.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          YouTube Music
        </a>
        <a
          href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          YouTube
        </a>
        <a
          href={`https://www.youtube.com/results?search_query=${searchQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <Search className="w-3 h-3" />
          More versions
        </a>
      </div>

      {/* Sticky mini-player when scrolled past */}
      {showStickyBar && (
        <div className="fixed bottom-14 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3">
            <img
              src={`https://img.youtube.com/vi/${track.youtubeId}/default.jpg`}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate font-medium">{track.title}</p>
              <p className="text-xs text-text-muted truncate">{track.artist}</p>
            </div>
            <button
              onClick={togglePlayPause}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Scroll to video"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
