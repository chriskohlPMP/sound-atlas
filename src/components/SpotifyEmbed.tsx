interface SpotifyEmbedProps {
  trackId: string | null;
}

export function SpotifyEmbed({ trackId }: SpotifyEmbedProps) {
  if (!trackId) return null;

  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
      width="100%"
      height="80"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-lg opacity-90 hover:opacity-100 transition-opacity"
    />
  );
}
