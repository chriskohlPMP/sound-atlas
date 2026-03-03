import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic } from "lucide-react";
import { usePlayback } from "../context/PlaybackContext";
import { EqualizerIcon } from "./EqualizerIcon";
import { playlist } from "../data/playlist";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    platform,
    isAuthenticated,
    isPlayerReady,
    isPlaying,
    currentTrackId,
    progressMs,
    durationMs,
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekTo,
    volume,
    setVolume,
    isMobile,
    autoAdvance,
    toggleAutoAdvance,
  } = usePlayback();

  // Only show for Spotify when authenticated and ready, or YouTube
  const showForSpotify = platform === "spotify" && isAuthenticated && isPlayerReady && !isMobile;
  const showForYoutube = platform === "youtube" && currentTrackId !== null;

  if (!showForSpotify && !showForYoutube) return null;
  if (!currentTrackId) return null;

  const track = playlist.find((t) => t.id === currentTrackId);
  if (!track) return null;

  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border">
      {/* Progress bar (clickable) */}
      <div
        className="h-1 bg-border cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          seekTo(ratio * durationMs);
        }}
      >
        <div
          className="h-full bg-accent transition-[width] duration-300 group-hover:bg-accent-hover"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Track info */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {isPlaying && <EqualizerIcon />}
          <div className="min-w-0">
            <p className="text-sm text-text-primary truncate font-medium">
              {track.title}
            </p>
            <p className="text-xs text-text-muted truncate">{track.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {(platform === "spotify" || platform === "youtube") && (
            <button
              onClick={skipPrevious}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={togglePlayPause}
            className="p-2 bg-text-primary text-background rounded-full hover:bg-accent transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          {(platform === "spotify" || platform === "youtube") && (
            <button
              onClick={skipNext}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {(platform === "spotify" || platform === "youtube") && (
            <button
              onClick={toggleAutoAdvance}
              className={`p-2 transition-colors ${
                autoAdvance
                  ? "text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
              aria-label={autoAdvance ? "Auto-advance on" : "Auto-advance off"}
              title={autoAdvance ? "Auto-advance on" : "Auto-advance off"}
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Time + Volume (desktop only) */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted min-w-0">
          <span className="tabular-nums">
            {formatTime(progressMs)} / {formatTime(durationMs)}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="p-1 hover:text-text-primary transition-colors"
              aria-label={volume > 0 ? "Mute" : "Unmute"}
            >
              {volume > 0 ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 accent-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
