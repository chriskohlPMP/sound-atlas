import type { Side } from "../data/types";
import { RECORDS } from "../data/types";

interface SideMarkerProps {
  side: Side;
}

export function SideMarker({ side }: SideMarkerProps) {
  const record = RECORDS.find((r) => r.sides.includes(side));
  const isFirstSide = record?.sides[0] === side;

  return (
    <div className="py-10 md:py-14 text-center">
      {isFirstSide && (
        <p className="text-text-muted text-xs tracking-[0.4em] uppercase mb-2">
          {record?.label}
        </p>
      )}
      <div className="flex items-center gap-4 justify-center">
        <div className="h-px bg-border flex-1 max-w-24" />
        <h2 className="font-display text-lg md:text-xl text-text-muted tracking-widest">
          Side {side}
        </h2>
        <div className="h-px bg-border flex-1 max-w-24" />
      </div>
    </div>
  );
}
