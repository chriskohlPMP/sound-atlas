export function EqualizerIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[2px] h-3 ${className}`}>
      <span className="w-[3px] bg-accent rounded-full animate-eq-1" />
      <span className="w-[3px] bg-accent rounded-full animate-eq-2" />
      <span className="w-[3px] bg-accent rounded-full animate-eq-3" />
    </div>
  );
}
