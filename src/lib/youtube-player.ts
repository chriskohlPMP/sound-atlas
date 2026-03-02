// YouTube IFrame Player API loader
// Free, no auth required, works on mobile

let apiReadyPromise: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => resolve();

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  });

  return apiReadyPromise;
}
