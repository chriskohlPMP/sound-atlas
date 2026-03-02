import { Clock } from "lucide-react";
import type { Track } from "../data/types";
import { SpotifyEmbed } from "./SpotifyEmbed";

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const { programNotes } = track;

  return (
    <article className="py-8 md:py-10">
      {/* Track header */}
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-sm text-text-muted w-8 shrink-0 text-right">
          {String(track.id).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-xl md:text-2xl text-text-primary leading-tight">
            {track.title}
          </h4>
          <p className="font-body text-sm text-text-muted mt-1">
            {track.artist} &middot; <span className="italic">{track.album}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {track.duration}
          </span>
          <span className="bg-surface px-2 py-0.5 rounded">{track.genre}</span>
        </div>
      </div>

      {/* Spotify embed */}
      <div className="ml-12 mb-5">
        <SpotifyEmbed trackId={track.spotifyId} />
      </div>

      {/* Program notes — always visible */}
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
    </article>
  );
}
