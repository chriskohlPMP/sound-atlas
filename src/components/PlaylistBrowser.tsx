import { playlist } from "../data/playlist";
import { chapters } from "../data/chapters";
import type { Side } from "../data/types";
import { ChapterHeader } from "./ChapterHeader";
import { TrackCard } from "./TrackCard";
import { SideMarker } from "./SideMarker";

export function PlaylistBrowser() {
  const tracksByChapter = chapters.map((chapter) => ({
    chapter,
    tracks: playlist.filter((t) => t.chapter === chapter.id),
  }));

  const totalDuration = playlist.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

  // Track which sides we've already rendered a marker for
  let lastSide: Side | null = null;

  return (
    <section id="playlist" className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-accent font-body text-sm tracking-[0.3em] uppercase mb-4">
          The Journey
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-4">
          52 Tracks. Three Records. {hours}h {mins}m.
        </h2>
        <p className="text-text-muted text-base max-w-lg mx-auto leading-relaxed">
          Read the notes. Press play. Listen. Scroll when you're ready.
        </p>
      </div>

      {tracksByChapter.map(({ chapter, tracks }) => {
        const needsSideMarker = chapter.side !== lastSide;
        lastSide = chapter.side;

        return (
          <div key={chapter.id}>
            {needsSideMarker && <SideMarker side={chapter.side} />}
            <ChapterHeader chapter={chapter} />
            <div className="divide-y divide-border-subtle">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
