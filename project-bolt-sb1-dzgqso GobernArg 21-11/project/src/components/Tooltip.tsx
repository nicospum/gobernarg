import { ReactNode } from 'react';
import { InfoTooltip } from './InfoTooltip';

interface TooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  block?: boolean;
}

/** La explicación electoral usa la misma ayuda con foco, teclado y tacto. */
export function Tooltip({ content, position = 'top', children, block = false }: TooltipProps) {
  return <InfoTooltip content={content} side={position} clickToOpen>
    <div className={block ? 'block w-full cursor-help' : 'inline-flex cursor-help'}>{children}</div>
  </InfoTooltip>;
}

export function TooltipContent({ label, value, detail }: { label: string; value?: string; detail?: string }) {
  return <div className="text-[13px] leading-relaxed text-ink">
    {value && <span className="font-semibold">{value}</span>}
    {value && label ? ' — ' : null}{label}
    {detail && <p className="text-ink/80 mt-1">{detail}</p>}
  </div>;
}
