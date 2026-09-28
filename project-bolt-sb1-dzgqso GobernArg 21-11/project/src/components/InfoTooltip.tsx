import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { useIsTouch } from '@/lib/useMediaQuery';
import { Sheet } from './mobile/Sheet';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Título de la hoja que se abre al tocar en pantallas sin mouse. */
  title?: React.ReactNode;
}

export function InfoTooltip({ content, children, side = 'top', title = 'Detalle' }: InfoTooltipProps) {
  const touch = useIsTouch();
  const [open, setOpen] = React.useState(false);

  // Sin mouse no hay "pasar por encima": tocar abre la misma explicación en una hoja.
  if (touch) {
    return (
      <>
        {/* Los clics dentro de la hoja (portal) también llegan acá por React: se ignoran. */}
        <div className="contents" onClick={e => { if (e.currentTarget.contains(e.target as Node)) setOpen(true); }}>
          {children}
        </div>
        {open && (
          <Sheet title={title} onClose={() => setOpen(false)}>
            {content}
          </Sheet>
        )}
      </>
    );
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={300}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 max-w-xs overflow-hidden rounded-md border border-border bg-popover px-3 py-2 text-[11px] leading-relaxed text-popover-foreground shadow-2xl',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
