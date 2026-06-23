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
  loColor = 'bg-blue-500',
  hiColor = 'bg-orange-500',
}: AxisBarProps) {
  const clamped = Math.max(-100, Math.min(100, value));
  const percentage = ((clamped + 100) / 200) * 100;
  const isLeft = clamped < 0;
  const isRight = clamped > 0;

  const indicatorColor = clamped < -50
    ? loColor
    : clamped < 0
    ? `${loColor}/70`
    : clamped > 50
    ? hiColor
    : `${hiColor}/70`;

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span className={isLeft ? 'font-semibold text-gray-700' : ''}>{labelLo}</span>
        <span className="text-gray-400 font-mono">{clamped}</span>
        <span className={isRight ? 'font-semibold text-gray-700' : ''}>{labelHi}</span>
      </div>
      <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        {/* Barra de fondo */}
        <div className="absolute inset-0 flex">
          <div className={`w-1/2 h-full ${loColor} opacity-20 rounded-l-full`} />
          <div className={`w-1/2 h-full ${hiColor} opacity-20 rounded-r-full`} />
        </div>
        {/* Indicador */}
        <div
          className={`absolute top-0 h-full w-1.5 rounded-full transition-all duration-300 ${indicatorColor}`}
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}
