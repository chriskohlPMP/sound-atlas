import { Play, X } from "lucide-react";
import { useListeningPosition } from "../hooks/useListeningPosition";
import { usePlayback } from "../context/PlaybackContext";

export function ResumeBanner() {
  const { showResume, resumeInfo, dismissResume, clearPosition } =
    useListeningPosition();
  const { playTrack } = usePlayback();

  if (!showResume || !resumeInfo) return null;

  const { track, timeStr, trackId } = resumeInfo;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-8 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary">
          Welcome back. You left off at
        </p>
        <p className="text-text-primary font-medium truncate">
          Track {String(trackId).padStart(2, "0")} —{" "}
          <span className="font-display">{track.title}</span>{" "}
          <span className="text-text-muted">at {timeStr}</span>
        </p>
      </div>
      <button
        onClick={() => {
          playTrack(trackId);
          dismissResume();
        }}
        className="flex items-center gap-1.5 px-4 py-2 bg-accent text-background rounded-full text-sm font-medium hover:bg-accent-hover transition-colors shrink-0"
      >
        <Play className="w-3.5 h-3.5" />
        Resume
      </button>
      <button
        onClick={() => {
          clearPosition();
        }}
        className="p-1.5 text-text-muted hover:text-text-primary transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
