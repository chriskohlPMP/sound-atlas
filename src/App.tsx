import { Hero } from "./components/Hero";
import { BeforeYouBegin } from "./components/BeforeYouBegin";
import { PlaylistBrowser } from "./components/PlaylistBrowser";
import { PlayerBar } from "./components/PlayerBar";
import { PlaybackProvider } from "./context/PlaybackProvider";

export default function App() {
  return (
    <PlaybackProvider>
      <div className="min-h-screen bg-background pb-20">
        <Hero />
        <BeforeYouBegin />
        <PlaylistBrowser />
        <PlayerBar />
        <footer className="text-center py-12 text-text-muted text-xs tracking-wider border-t border-border-subtle">
          <p className="font-display italic mb-1">Ohrwurm</p>
          <p>A guided listening experience. The music belongs to the artists.</p>
        </footer>
      </div>
    </PlaybackProvider>
  );
}
