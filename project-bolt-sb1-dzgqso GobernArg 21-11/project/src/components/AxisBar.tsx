interface AxisBarProps {
  value: number; // -100 a +100
  labelLo: string;
  labelHi: string;
  loColor?: string;
  hiColor?: string;
}

export function AxisBar({
  value,
  labelLo,
  labelHi,
  loColor = 'bg-cyan-400',
  hiColor = 'bg-purple-400',
}: AxisBarProps) {
  const clamped = Math.max(-100, Math.min(100, value));
  const percentage = ((clamped + 100) / 200) * 100;
  const isLeft = clamped < 0;
  const isRight = clamped > 0;

  return (
    <div className="mb-2">
      <div className="flex justify-between text-[11px] mb-1">
        <span className={isLeft ? 'font-semibold text-white' : 'text-white/40'}>{labelLo}</span>
        <span className="text-white/60 font-mono text-[10px]">{clamped > 0 ? `+${clamped}` : clamped}</span>
        <span className={isRight ? 'font-semibold text-white' : 'text-white/40'}>{labelHi}</span>
      </div>
      <div className="relative w-full h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 h-full w-2 rounded-full transition-all duration-300 shadow ${isLeft ? loColor : isRight ? hiColor : 'bg-white/60'}`}
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}
