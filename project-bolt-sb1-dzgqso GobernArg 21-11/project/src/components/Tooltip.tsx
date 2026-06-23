import { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={`absolute z-50 hidden group-hover:block pointer-events-none ${positionStyles[position]}`}
      >
        <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs whitespace-normal leading-relaxed">
          {content}
          <div
            className={`absolute w-2 h-2 bg-slate-800 rotate-45 ${
              position === 'top'
                ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                : position === 'bottom'
                ? 'top-[-4px] left-1/2 -translate-x-1/2'
                : position === 'left'
                ? 'right-[-4px] top-1/2 -translate-y-1/2'
                : 'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export function TooltipContent({ label, value, detail }: { label: string; value?: string; detail?: string }) {
  return (
    <div>
      {value ? (
        <span className="font-semibold text-white">{value}</span>
      ) : null}
      {value && label ? ' — ' : null}
      <span className="text-slate-300">{label}</span>
      {detail ? <div className="text-slate-400 text-[10px] mt-0.5">{detail}</div> : null}
    </div>
  );
}
