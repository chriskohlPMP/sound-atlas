import { useState, useCallback } from "react";
import { playlist } from "../data/playlist";

const STORAGE_KEY = "ohrwurm-position";

export interface SavedPosition {
  trackId: number;
  progressMs: number;
  timestamp: number;
}

function loadPosition(): SavedPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Validate
    if (
      typeof data.trackId === "number" &&
      typeof data.progressMs === "number" &&
      typeof data.timestamp === "number"
    ) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export function useListeningPosition() {
  const [savedPosition, setSavedPosition] = useState<SavedPosition | null>(
    loadPosition
  );
  const [showResume, setShowResume] = useState(savedPosition !== null);

  const savePosition = useCallback(
    (trackId: number, progressMs: number) => {
      const pos: SavedPosition = {
        trackId,
        progressMs,
        timestamp: Date.now(),
      };
      setSavedPosition(pos);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
      } catch {}
    },
    []
  );

  const clearPosition = useCallback(() => {
    setSavedPosition(null);
    setShowResume(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const dismissResume = useCallback(() => {
    setShowResume(false);
  }, []);

  // Format for display
  const resumeInfo = savedPosition
    ? (() => {
        const track = playlist.find((t) => t.id === savedPosition.trackId);
        if (!track) return null;
        const totalSec = Math.floor(savedPosition.progressMs / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return {
          track,
          timeStr: `${min}:${sec.toString().padStart(2, "0")}`,
          trackId: savedPosition.trackId,
          progressMs: savedPosition.progressMs,
        };
      })()
    : null;

  return {
    savedPosition,
    showResume,
    resumeInfo,
    savePosition,
    clearPosition,
    dismissResume,
  };
}
