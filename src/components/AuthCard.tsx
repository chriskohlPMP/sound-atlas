import { usePlayback } from "../context/PlaybackContext";

export function AuthCard() {
  const { platform, isAuthenticated, userProfile, login, logout, isMobile, error, isPremiumRequired } =
    usePlayback();

  // Apple Music doesn't need auth
  if (platform === "apple-music") {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-center">
        <p className="text-text-primary font-display text-lg mb-2">
          Listen in Apple Music
        </p>
        <p className="text-text-muted text-sm mb-4 max-w-md mx-auto">
          Open each track in the Apple Music app as you follow along. Tap the
          track links below to jump directly to each song.
        </p>
      </div>
    );
  }

  // YouTube doesn't need auth
  if (platform === "youtube") {
    return null;
  }

  // Spotify — mobile fallback
  if (isMobile) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-center">
        <p className="text-text-primary font-display text-lg mb-2">
          Listening on Mobile
        </p>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          In-browser playback requires a desktop browser. On mobile, tap the
          track links to open each song in the Spotify app.
        </p>
      </div>
    );
  }

  // Spotify — authenticated
  if (isAuthenticated && userProfile) {
    return (
      <div className="flex items-center justify-center gap-3 mb-8 text-sm">
        <span className="text-text-muted">
          Listening as{" "}
          <span className="text-text-secondary">{userProfile.display_name}</span>
        </span>
        <button
          onClick={logout}
          className="text-text-muted hover:text-accent transition-colors underline underline-offset-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Spotify — not authenticated
  return (
    <div className="bg-surface border border-border rounded-xl p-8 mb-8 text-center">
      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}
      {isPremiumRequired ? (
        <>
          <p className="text-text-primary font-display text-lg mb-2">
            Spotify Premium Required
          </p>
          <p className="text-text-muted text-sm mb-4 max-w-md mx-auto">
            In-browser playback requires a Spotify Premium account. You can
            still browse the program notes and open tracks in the Spotify app.
          </p>
        </>
      ) : (
        <>
          <p className="text-text-primary font-display text-lg mb-2">
            Connect Spotify to Play Here
          </p>
          <p className="text-text-muted text-sm mb-4 max-w-md mx-auto">
            Sign in with your Spotify Premium account. Tracks play directly on
            this page while program notes sync with what you're hearing.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: "#1DB954",
              color: "#000",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Sign in with Spotify
          </button>
        </>
      )}
    </div>
  );
}
