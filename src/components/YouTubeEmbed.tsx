import { Play, ExternalLink, Search } from "lucide-react";
import type { Track } from "../data/types";
import { usePlayback } from "../context/PlaybackContext";

interface YouTubeEmbedProps {
  track: Track;
}

export function YouTubeEmbed({ track }: YouTubeEmbedProps) {
  const { activeYoutubeTrackId, playYoutubeTrack } = usePlayback();
  const isActive = activeYoutubeTrackId === track.id;

  if (!track.youtubeId) return null;

  const searchQuery = encodeURIComponent(`${track.artist} ${track.title}`);

  return (
    <div>
      {isActive ? (
        <iframe
          src={`https://www.youtube.com/embed/${track.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
          width="100%"
          height="220"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="rounded-lg"
        />
      ) : (
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
