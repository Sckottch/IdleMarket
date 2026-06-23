function FloatingNumber({ value, className = "" }: { value: number | null; className?: string }) {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`toast-pop pointer-events-none absolute z-10 text-sm font-bold ${
        positive ? "text-emerald-400" : "text-red-400"
      } ${className}`}
    >
      {positive ? `+${value}` : `-${Math.abs(value)}`}
    </span>
  );
}

export default FloatingNumber;
