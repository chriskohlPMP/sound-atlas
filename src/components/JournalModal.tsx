import { X, Printer, Download, Send } from "lucide-react";
import { playlist } from "../data/playlist";
import { useUserNotes } from "../hooks/useUserNotes";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JournalModal({ isOpen, onClose }: JournalModalProps) {
  const { getAllNotes, hasAnyNotes } = useUserNotes();

  if (!isOpen) return null;

  const notes = getAllNotes();
  const tracksWithNotes = playlist.filter((t) => notes[t.id]?.trim());

  function handlePrint() {
    const html = tracksWithNotes
      .map(
        (t) => `
        <div style="margin-bottom:24px;page-break-inside:avoid">
          <h3 style="margin:0 0 4px;font-size:14px">
            ${String(t.id).padStart(2, "0")}. ${t.title} — ${t.artist}
          </h3>
          <p style="margin:0 0 8px;font-size:12px;color:#666">${t.album} · ${t.chapter}</p>
          <p style="margin:0;font-size:13px;white-space:pre-wrap">${notes[t.id]}</p>
        </div>`
      )
      .join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>My Ohrwurm Journal</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #222; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 14px; color: #888; font-weight: normal; margin-bottom: 32px; }
          hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
        </style>
      </head>
      <body>
        <h1>My Ohrwurm Journal</h1>
        <h2>${tracksWithNotes.length} track${tracksWithNotes.length === 1 ? "" : "s"} with notes</h2>
        ${html}
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  function handleCSV() {
    const header = "Track #,Title,Artist,Album,Chapter,My Notes\n";
    const rows = tracksWithNotes
      .map((t) => {
        const note = notes[t.id].replace(/"/g, '""');
        return `${t.id},"${t.title}","${t.artist}","${t.album}","${t.chapter}","${note}"`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ohrwurm-journal.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSubmit() {
    const body = tracksWithNotes
      .map(
        (t) =>
          `Track ${String(t.id).padStart(2, "0")}: ${t.title} — ${t.artist}\n${notes[t.id]}\n`
      )
      .join("\n---\n\n");

    const text = `My Ohrwurm Journal\n${"=".repeat(40)}\n\n${body}`;

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert(
        "Your journal has been copied to clipboard. Paste it in a message to share your feedback!"
      );
    }).catch(() => {
      // Fallback: open a textarea the user can copy from
      prompt("Copy this text to share your feedback:", text);
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display text-lg text-text-primary">
            My Journal
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasAnyNotes ? (
            <p className="text-text-muted text-sm text-center py-8">
              No notes yet. Add notes to tracks as you listen — they'll appear
              here.
            </p>
          ) : (
            <div className="space-y-4">
              {tracksWithNotes.map((t) => (
                <div
                  key={t.id}
                  className="border-b border-border-subtle pb-4 last:border-0"
                >
                  <p className="text-sm font-medium text-text-primary">
                    <span className="text-accent font-mono">
                      {String(t.id).padStart(2, "0")}
                    </span>{" "}
                    {t.title}{" "}
                    <span className="text-text-muted font-normal">
                      — {t.artist}
                    </span>
                  </p>
                  <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                    {notes[t.id]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {hasAnyNotes && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-text-muted hover:text-text-primary bg-surface-hover rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-text-muted hover:text-text-primary bg-surface-hover rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-accent hover:text-accent-hover bg-accent/10 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Share Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
