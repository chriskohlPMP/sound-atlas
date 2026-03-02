import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface opacity-80" />
      <div className="relative z-10 max-w-5xl">
        <p className="text-accent font-body text-sm tracking-[0.3em] uppercase mb-6">
          A Guided Listening Experience
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-text-primary leading-[1.1] mb-6">
          Ohrwurm
        </h1>
        <p className="font-body text-sm text-text-muted tracking-[0.15em] uppercase mb-6">
          A Sound Atlas
        </p>
        <p className="font-display text-xl md:text-2xl text-text-secondary italic leading-relaxed mb-4">
          52 tracks. Three records. Six sides.
        </p>
        <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12">
          Not a playlist — a journey through sound. Built for people who care
          about what they hear and the equipment they hear it on.
        </p>
        <a
          href="#playlist"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors text-sm tracking-[0.2em] uppercase"
        >
          Begin listening
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
