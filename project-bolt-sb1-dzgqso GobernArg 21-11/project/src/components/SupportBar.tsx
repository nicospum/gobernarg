interface SupportBarProps {
  value: number; // 0-100
}

export function SupportBar({ value }: SupportBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const color = clamped >= 70
    ? 'bg-green-500'
    : clamped >= 50
    ? 'bg-blue-500'
    : clamped >= 35
    ? 'bg-yellow-500'
    : 'bg-red-500';

  const textColor = clamped >= 70
    ? 'text-green-700'
    : clamped >= 50
    ? 'text-blue-700'
    : clamped >= 35
    ? 'text-yellow-700'
    : 'text-red-700';

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={`font-semibold min-w-[2.5rem] text-right ${textColor}`}>
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
