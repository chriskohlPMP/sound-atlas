import { useEffect, useRef, useCallback } from "react";
import type { Track } from "../data/types";
import { usePlayback } from "../context/PlaybackContext";
import { playlist } from "../data/playlist";

interface YouTubeEmbedProps {
  track: Track;
}

export function YouTubeEmbed({ track }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YT.Player | null>(null);
  const {
    currentTrackId,
    setManualCurrentTrack,
    youtubePlayerRef,
    volume,
  } = usePlayback();

  const isCurrentTrack = currentTrackId === track.id;

  const onStateChange = useCallback(
    (event: { data: number }) => {
      // YT.PlayerState.PLAYING = 1
      if (event.data === 1) {
        setManualCurrentTrack(track.id);
        if (youtubePlayerRef) {
          youtubePlayerRef.current = playerInstanceRef.current;
        }
      }
      // YT.PlayerState.ENDED = 0 — auto-advance
      if (event.data === 0) {
        const nextTrack = playlist.find(
          (t) => t.id === track.id + 1 && t.youtubeId
        );
        if (nextTrack) {
          setManualCurrentTrack(nextTrack.id);
        }
      }
    },
    [track.id, setManualCurrentTrack, youtubePlayerRef]
  );

  useEffect(() => {
    if (!track.youtubeId || !containerRef.current) return;
    if (!window.YT || !window.YT.Player) return;

    const divId = `yt-player-${track.id}`;
    containerRef.current.id = divId;

    const player = new window.YT.Player(divId, {
      height: "80",
      width: "100%",
      videoId: track.youtubeId,
      playerVars: {
        modestbranding: 1,
        rel: 0,
        color: "white",
        playsinline: 1,
      },
      events: {
        onReady: (event: { target: YT.Player }) => {
          event.target.setVolume(volume * 100);
        },
        onStateChange: onStateChange,
      },
    });

    playerInstanceRef.current = player;

    return () => {
      player.destroy();
      playerInstanceRef.current = null;
    };
  }, [track.youtubeId, track.id]);

  if (!track.youtubeId) return null;

  return (
    <div
      ref={containerRef}
      className={`rounded-lg overflow-hidden transition-opacity ${
        isCurrentTrack ? "opacity-100" : "opacity-80 hover:opacity-100"
      }`}
    />
  );
}
