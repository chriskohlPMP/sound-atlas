import { useState, useRef, useEffect, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { playlist } from "../data/playlist";
import { chapters } from "../data/chapters";
import type { Side } from "../data/types";
import { usePlayback } from "../context/PlaybackContext";
import { useListeningPosition } from "../hooks/useListeningPosition";
import { ChapterHeader } from "./ChapterHeader";
import { TrackCard } from "./TrackCard";
import { SideMarker } from "./SideMarker";
import { ExperienceSelector } from "./ExperienceSelector";
import { AuthCard } from "./AuthCard";
import { ResumeBanner } from "./ResumeBanner";
import { JournalModal } from "./JournalModal";
import { useUserNotes } from "../hooks/useUserNotes";

export function PlaylistBrowser() {
  const { currentTrackId, isPlaying, progressMs } = usePlayback();
  const { savePosition } = useListeningPosition();
  const { hasAnyNotes } = useUserNotes();
  const [journalOpen, setJournalOpen] = useState(false);

  // Track refs for auto-scroll
  const trackRefs = useRef<Map<number, HTMLElement>>(new Map());
  const lastAutoScrollTrack = useRef<number | null>(null);

  const setTrackRef = useCallback(
    (trackId: number) => (el: HTMLElement | null) => {
      if (el) {
        trackRefs.current.set(trackId, el);
      } else {
        trackRefs.current.delete(trackId);
      }
    },
    []
  );

  // Auto-scroll when track changes (auto-advance only)
  useEffect(() => {
    if (!currentTrackId) return;
    // Only auto-scroll if this is a new track from auto-advance
    if (lastAutoScrollTrack.current === currentTrackId) return;

    // Skip first track selection (user-initiated)
    if (lastAutoScrollTrack.current === null) {
      lastAutoScrollTrack.current = currentTrackId;
      return;
    }

    lastAutoScrollTrack.current = currentTrackId;

    const el = trackRefs.current.get(currentTrackId);
    if (el) {
      const y =
        el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [currentTrackId]);

  // Save position every 5 seconds during playback
  useEffect(() => {
    if (!currentTrackId || !isPlaying) return;

    const interval = setInterval(() => {
      savePosition(currentTrackId, progressMs);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTrackId, isPlaying, progressMs, savePosition]);

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
        <p className="text-text-muted text-base max-w-lg mx-auto leading-relaxed mb-8">
          Read the notes. Press play. Listen. Scroll when you're ready.
        </p>
        <div className="flex flex-col items-center gap-4">
          <ExperienceSelector />
          {hasAnyNotes && (
            <button
              onClick={() => setJournalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              My Journal
            </button>
          )}
        </div>
      </div>

      <AuthCard />
      <ResumeBanner />

      {tracksByChapter.map(({ chapter, tracks }) => {
        const needsSideMarker = chapter.side !== lastSide;
        lastSide = chapter.side;

        return (
          <div key={chapter.id}>
            {needsSideMarker && <SideMarker side={chapter.side} />}
            <ChapterHeader chapter={chapter} />
            <div className="divide-y divide-border-subtle">
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  trackRef={setTrackRef(track.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <JournalModal isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
    </section>
  );
}
