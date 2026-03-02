import { useState, useCallback } from "react";

const STORAGE_KEY = "ohrwurm-notes";

type NotesMap = Record<number, string>;

function loadNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: NotesMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}

export function useUserNotes() {
  const [notes, setNotes] = useState<NotesMap>(loadNotes);

  const getNote = useCallback(
    (trackId: number): string => notes[trackId] ?? "",
    [notes]
  );

  const setNote = useCallback((trackId: number, text: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (text.trim()) {
        next[trackId] = text;
      } else {
        delete next[trackId];
      }
      saveNotes(next);
      return next;
    });
  }, []);

  const getAllNotes = useCallback((): NotesMap => notes, [notes]);

  const hasAnyNotes = Object.keys(notes).length > 0;

  return { getNote, setNote, getAllNotes, hasAnyNotes };
}
