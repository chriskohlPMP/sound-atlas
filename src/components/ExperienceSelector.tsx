import type { ReactNode } from "react";
import { usePlayback } from "../context/PlaybackContext";
import type { StreamingPlatform } from "../data/types";

const options: {
  value: StreamingPlatform;
  label: string;
  sublabel: string;
  color: string;
  icon: ReactNode;
}[] = [
  {
    value: "spotify",
    label: "Spotify",
    sublabel: "Play here",
    color: "#1DB954",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    value: "youtube",
    label: "YouTube",
    sublabel: "Play here (free)",
    color: "#FF0000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: "apple-music",
    label: "Apple Music",
    sublabel: "Open tracks",
    color: "#FC3C44",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.293.228.555.05 1.11.075 1.667.075h11.03c.526-.01 1.05-.04 1.573-.103.736-.09 1.45-.24 2.1-.6 1.225-.677 2.04-1.7 2.463-3.022.2-.628.293-1.278.34-1.935.04-.524.06-1.05.064-1.576V6.124zm-6.67 2.636v7.56c0 .456-.05.905-.224 1.33-.325.793-.948 1.246-1.768 1.448-.396.098-.803.143-1.21.148-.637.007-1.208-.156-1.69-.574-.645-.558-.844-1.27-.664-2.084.19-.856.753-1.376 1.543-1.67.405-.15.823-.25 1.243-.33.46-.088.924-.162 1.38-.27.248-.058.456-.182.557-.44.058-.154.08-.32.08-.49V8.634a.357.357 0 00-.03-.14c-.047-.1-.133-.15-.24-.13-.084.014-.166.04-.246.065L11.17 9.74v8.12c.01.455-.04.907-.206 1.336-.312.813-.964 1.282-1.806 1.487-.386.094-.78.137-1.177.142-.66.008-1.25-.155-1.74-.588-.624-.55-.82-1.248-.65-2.03.17-.78.654-1.31 1.38-1.636.367-.165.753-.27 1.144-.35.474-.1.952-.178 1.425-.28.294-.064.536-.215.624-.526.04-.143.054-.293.054-.443V5.774c0-.183.032-.36.11-.525.106-.222.292-.337.524-.395.182-.045.367-.076.552-.108l5.205-1.003c.173-.033.347-.065.522-.08.27-.023.418.12.418.392v4.706z" />
      </svg>
    ),
  },
];

const isMobileBrowser = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function ExperienceSelector() {
  const { platform, changePlatform } = usePlayback();

  // On mobile, YouTube is the only option — no selector needed
  if (isMobileBrowser) return null;

  return (
    <div>
      <p className="text-xs text-text-muted tracking-[0.2em] uppercase mb-4 text-center">
        Choose Your Experience
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {options.map((opt) => {
          const isActive = platform === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => changePlatform(opt.value)}
              className="relative flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer select-none transition-all duration-150 active:scale-95 active:brightness-90"
              style={
                isActive
                  ? {
                      borderColor: opt.color,
                      backgroundColor: `${opt.color}20`,
                      color: opt.color,
                      boxShadow: `0 0 20px ${opt.color}25, 0 0 4px ${opt.color}15`,
                    }
                  : {
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-muted)",
                    }
              }
            >
              {opt.icon}
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold">{opt.label}</span>
                <span
                  className="text-[10px] tracking-wide uppercase"
                  style={{ opacity: isActive ? 0.8 : 0.5 }}
                >
                  {opt.sublabel}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
