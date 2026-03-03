import { useEffect, useRef, useState } from "react";
import { Play, ExternalLink, Search, AlertTriangle } from "lucide-react";
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
    volume,
  } = usePlayback();

  const isActive = activeYoutubeTrackId === track.id;
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [embedError, setEmbedError] = useState(false);

  // Create YT.Player when this track becomes active
  useEffect(() => {
    if (!isActive || !track.youtubeId) return;

    let destroyed = false;

    async function init() {
      await loadYouTubeAPI();
      if (destroyed || !containerRef.current) return;

      const player = new window.YT.Player(containerRef.current, {
        videoId: track.youtubeId!,
        width: "100%",
        height: 220,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (destroyed) return;
            playerRef.current = event.target;
            registerYoutubePlayer(event.target);
            event.target.setVolume(volume * 100);
          },
          onStateChange: (event) => {
            if (destroyed) return;
            const state = event.data;
            if (state === YT.PlayerState.PLAYING) {
              setYoutubePlayState(true);
            } else if (state === YT.PlayerState.PAUSED) {
              setYoutubePlayState(false);
            } else if (state === YT.PlayerState.ENDED) {
              setYoutubePlayState(false);
              advanceYoutube();
            }
          },
          onError: (event) => {
            if (destroyed) return;
            // 101/150 = embedding blocked, 100 = not found
            const code = event.data;
            if (code === 101 || code === 150 || code === 100) {
              setEmbedError(true);
              setYoutubePlayState(false);
            }
          },
        },
      });
    }

    setEmbedError(false);
    init();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      registerYoutubePlayer(null);
    };
  }, [isActive, track.youtubeId]);

  if (!track.youtubeId) return null;

  const searchQuery = encodeURIComponent(`${track.artist} ${track.title}`);

  return (
    <div>
      {isActive ? (
        embedError ? (
          // Fallback for non-embeddable videos
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
        ) : (
          // YT.Player renders into this div
          <div ref={containerRef} className="rounded-lg overflow-hidden" />
        )
      ) : (
        // Thumbnail with play button
        <button
          onClick={() => playYoutubeTrack(track.id)}
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
    </div>
  );
}
