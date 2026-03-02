import { Headphones, Wifi, Volume2 } from "lucide-react";

export function BeforeYouBegin() {
  return (
    <section className="max-w-3xl mx-auto px-4 md:px-6 py-16 border-b border-border-subtle">
      <div className="text-center mb-10">
        <p className="text-accent font-body text-sm tracking-[0.3em] uppercase mb-4">
          Before You Begin
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-3">
          How to Get the Most Out of This
        </h2>
        <p className="text-text-muted text-base max-w-lg mx-auto leading-relaxed">
          This playlist was built for quality headphones. Here's what matters
          and what doesn't.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Headphones className="w-5 h-5 text-accent mb-3" />
          <h3 className="font-body font-medium text-text-primary text-sm mb-2">
            Wired vs. Wireless
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Wired headphones deliver an uncompressed signal — what the studio
            recorded is what you hear. Wireless uses Bluetooth codecs (AAC,
            LDAC, aptX) that compress the audio before it reaches your ears.
            For most tracks here, quality wireless planars like the STAX Spirit
            S5 over Bluetooth AAC sound excellent. But for the most dynamic
            tracks — Lateralus, When the Levee Breaks, Bohemian Rhapsody — a
            wired connection reveals details that Bluetooth discards.
          </p>
        </div>

        <div>
          <Wifi className="w-5 h-5 text-accent mb-3" />
          <h3 className="font-body font-medium text-text-primary text-sm mb-2">
            Streaming Platform Quality
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Apple Music</strong> streams
            lossless (ALAC) up to 24-bit/192kHz over Wi-Fi, but Bluetooth caps
            it at AAC 256kbps — the lossless signal gets re-encoded before it
            leaves your phone.{" "}
            <strong className="text-text-primary">Spotify</strong> maxes at
            320kbps Ogg Vorbis (Premium) — lossy, but well-encoded and
            transparent for most listeners.{" "}
            <strong className="text-text-primary">YouTube Music</strong> caps
            at 256kbps AAC. For this playlist, any Premium-tier stream is fine.
            The bigger gains come from your headphones, not your bitrate.
          </p>
        </div>

        <div>
          <Volume2 className="w-5 h-5 text-accent mb-3" />
          <h3 className="font-body font-medium text-text-primary text-sm mb-2">
            Settings That Matter
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Turn off Sound Check / volume normalization — it compresses dynamic
            range, which is half of what makes these tracks special. Disable
            Spatial Audio for stereo recordings (most of this playlist).
            Enable Lossless if you're on Apple Music over Wi-Fi with wired
            headphones. If you have an EQ, a gentle bass shelf at 60Hz (+2-3dB)
            and a subtle air boost at 10kHz (+1-2dB) can help planar magnetics
            come alive.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-surface rounded-lg border border-border-subtle">
        <p className="text-xs text-text-muted leading-relaxed text-center">
          <strong className="text-text-secondary">The bottom line:</strong>{" "}
          Good headphones matter more than lossless streaming. A $400 planar
          magnetic on Spotify Premium will outperform $30 earbuds on Apple
          Music Lossless every time. Use the best headphones you have, turn
          off normalization, and give yourself the volume.
        </p>
      </div>
    </section>
  );
}
