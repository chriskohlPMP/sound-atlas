import { Hero } from "./components/Hero";
import { BeforeYouBegin } from "./components/BeforeYouBegin";
import { PlaylistBrowser } from "./components/PlaylistBrowser";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <BeforeYouBegin />
      <PlaylistBrowser />
      <footer className="text-center py-12 text-text-muted text-xs tracking-wider border-t border-border-subtle">
        <p className="font-display italic mb-1">Sound Atlas</p>
        <p>A guided listening experience. The music belongs to the artists.</p>
      </footer>
    </div>
  );
}
