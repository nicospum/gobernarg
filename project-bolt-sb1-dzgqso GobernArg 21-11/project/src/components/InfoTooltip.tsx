import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { useIsTouch } from '@/lib/useMediaQuery';
import { Sheet } from './mobile/Sheet';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  title?: React.ReactNode;
  /** Ayudas explícitas: al pulsarlas se mantienen abiertas en una hoja. */
  clickToOpen?: boolean;
}

export function InfoTooltip({ content, children, side = 'top', title = 'Detalle', clickToOpen = false }: InfoTooltipProps) {
  const touch = useIsTouch();
  const [open, setOpen] = React.useState(false);
  const child = React.isValidElement<React.HTMLAttributes<HTMLElement>>(children) ? children : null;
  const nativeControl = child && typeof child.type === 'string' && ['button', 'a', 'input', 'select', 'textarea'].includes(child.type);
  // Las superficies informativas también se pueden alcanzar con Tab. Los botones
  // existentes (por ejemplo elegir un perfil) conservan su interacción original.
  const trigger = child && !nativeControl
    ? React.cloneElement(child, { tabIndex: child.props.tabIndex ?? 0, role: child.props.role ?? 'button' })
    : children;

  return (
    <>
      <div className="contents"
        onClick={event => {
          if ((touch || clickToOpen || !nativeControl) && event.currentTarget.contains(event.target as Node)) setOpen(true);
        }}
        onKeyDown={event => {
          if (!nativeControl && event.currentTarget.contains(event.target as Node) && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {touch ? trigger : (
          <TooltipPrimitive.Provider>
            <TooltipPrimitive.Root delayDuration={300}>
              <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content side={side} sideOffset={6} className={cn(
                  'game-help z-50 max-w-xs rounded-md border border-border bg-popover px-3 py-2 text-[13px] leading-relaxed text-popover-foreground shadow-xl',
                  'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                )}>{content}</TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          </TooltipPrimitive.Provider>
        )}
      </div>
      {open && <Sheet title={title} onClose={() => setOpen(false)}>{content}</Sheet>}
    </>
  );
}
