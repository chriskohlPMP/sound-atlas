import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Check } from "lucide-react";
import { useUserNotes } from "../hooks/useUserNotes";

interface TrackNotesProps {
  trackId: number;
}

export function TrackNotes({ trackId }: TrackNotesProps) {
  const { getNote, setNote } = useUserNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(getNote(trackId));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasNote = value.trim().length > 0;

  useEffect(() => {
    setValue(getNote(trackId));
  }, [trackId, getNote]);

  const save = useCallback(() => {
    setNote(trackId, value);
  }, [trackId, value, setNote]);

  // Auto-save on blur
  const handleBlur = useCallback(() => {
    save();
  }, [save]);

  if (!isOpen && !hasNote) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          requestAnimationFrame(() => textareaRef.current?.focus());
        }}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Add a note
      </button>
    );
  }

  return (
    <div className="mt-1">
      {!isOpen && hasNote ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-start gap-2 text-left"
        >
          <Pencil className="w-3 h-3 text-text-muted mt-0.5 shrink-0 group-hover:text-accent transition-colors" />
          <p className="text-xs text-text-muted italic leading-relaxed group-hover:text-text-secondary transition-colors">
            {value}
          </p>
        </button>
      ) : (
        <div className="flex items-start gap-2">
          <Pencil className="w-3 h-3 text-accent mt-2 shrink-0" />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleBlur}
              placeholder="Your thoughts on this track..."
              rows={2}
              className="w-full bg-surface/50 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-secondary placeholder:text-text-muted/50 resize-none focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              onClick={() => {
                save();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 mt-1 text-xs text-accent hover:text-accent-hover transition-colors"
            >
              <Check className="w-3 h-3" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
