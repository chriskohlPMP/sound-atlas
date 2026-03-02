import { Play, Pause, ExternalLink } from "lucide-react";
import type { Track } from "../data/types";
import { usePlayback } from "../context/PlaybackContext";
import { EqualizerIcon } from "./EqualizerIcon";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { TrackNotes } from "./TrackNotes";

interface TrackCardProps {
  track: Track;
  trackRef?: (el: HTMLElement | null) => void;
}

export function TrackCard({ track, trackRef }: TrackCardProps) {
  const {
    platform,
    isAuthenticated,
    isPlayerReady,
    isPlaying,
    currentTrackId,
    playTrack,
    togglePlayPause,
    isMobile,
  } = usePlayback();

  const isCurrentTrack = currentTrackId === track.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const canPlayInBrowser =
    platform === "spotify" && isAuthenticated && isPlayerReady && !isMobile;

  const { programNotes } = track;

  // Deep link URLs
  const spotifyUrl = track.spotifyId
    ? `https://open.spotify.com/track/${track.spotifyId}`
    : null;
  const appleMusicUrl = track.appleMusicId
    ? `https://music.apple.com/us/song/${track.appleMusicId}`
    : null;
  function handlePlay() {
    if (isCurrentTrack && canPlayInBrowser) {
      togglePlayPause();
    } else {
      playTrack(track.id);
    }
  }

  return (
    <article
      ref={trackRef}
      className={`py-8 md:py-10 transition-colors duration-300 ${
        isCurrentTrack
          ? "border-l-2 border-l-accent bg-accent/5 pl-4 -ml-4 rounded-r-lg"
          : ""
      }`}
    >
      {/* Track header */}
      <div className="flex items-baseline gap-4 mb-4">
        <span
          className={`font-mono text-sm w-8 shrink-0 text-right transition-colors ${
            isCurrentTrack ? "text-accent font-bold" : "text-text-muted"
          }`}
        >
          {String(track.id).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isThisPlaying && <EqualizerIcon />}
            <h4 className="font-display text-xl md:text-2xl text-text-primary leading-tight">
              {track.title}
            </h4>
          </div>
          <p className="font-body text-sm text-text-muted mt-1">
            {track.artist} &middot;{" "}
            <span className="italic">{track.album}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* Play button (Spotify in-browser) */}
          {canPlayInBrowser && track.spotifyId && (
            <button
              onClick={handlePlay}
              className={`p-2 rounded-full transition-all ${
                isCurrentTrack
                  ? "bg-accent text-background"
                  : "bg-surface hover:bg-accent/20 text-text-muted hover:text-accent"
              }`}
              aria-label={isThisPlaying ? "Pause" : "Play"}
            >
              {isThisPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          )}

          <span className="text-xs text-text-muted">{track.duration}</span>
          <span className="bg-surface px-2 py-0.5 rounded text-xs text-text-muted">
            {track.genre}
          </span>
        </div>
      </div>

      {/* Mobile play button */}
      {canPlayInBrowser && track.spotifyId && (
        <div className="ml-12 mb-4 sm:hidden">
          <button
            onClick={handlePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              isCurrentTrack
                ? "bg-accent text-background"
                : "bg-surface text-text-muted hover:text-accent"
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isThisPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}

      {/* YouTube embed (inline player) */}
      {platform === "youtube" && track.youtubeId && (
        <div className="ml-12 mb-5">
          <YouTubeEmbed track={track} />
        </div>
      )}

      {/* Deep links for companion modes */}
      {(platform === "apple-music" ||
        (platform === "spotify" && (isMobile || !isAuthenticated))) && (
        <div className="ml-12 mb-4 flex flex-wrap gap-3">
          {platform === "apple-music" && appleMusicUrl && (
            <a
              href={appleMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Apple Music
            </a>
          )}
          {platform === "spotify" && spotifyUrl && (isMobile || !isAuthenticated) && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Spotify
            </a>
          )}
        </div>
      )}

      {/* Program notes */}
      <div className="ml-12 grid gap-5 md:grid-cols-3">
        <div>
          <h5 className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-body font-medium">
            Program Notes
          </h5>
          <p className="text-sm text-text-secondary leading-relaxed">
            {programNotes.notes}
          </p>
        </div>
        <div>
          <h5 className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-body font-medium">
            Listen For
          </h5>
          <p className="text-sm text-text-secondary leading-relaxed">
            {programNotes.listenFor}
          </p>
        </div>
        <div>
          <h5 className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-body font-medium">
            The Story
          </h5>
          <p className="text-sm text-text-secondary leading-relaxed">
            {programNotes.story}
          </p>
        </div>
      </div>

      {/* User notes */}
      <div className="ml-12 mt-4">
        <TrackNotes trackId={track.id} />
      </div>
    </article>
  );
}
