let sdkReadyPromise: Promise<void> | null = null;

export function loadSpotifySDK(): Promise<void> {
  if (sdkReadyPromise) return sdkReadyPromise;

  sdkReadyPromise = new Promise((resolve) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  });

  return sdkReadyPromise;
}
