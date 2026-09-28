import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '@/lib/useDialog';

interface SheetProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Pie fijo (botones de acción). */
  footer?: ReactNode;
  /** Ocupa casi toda la pantalla (detalle de una acción) en vez de ajustarse al contenido. */
  tall?: boolean;
}

/**
 * Hoja que sube desde abajo, el "modal" del celular: la usan el menú, las
 * notificaciones y todo lo que en la computadora aparece al pasar el mouse.
 */
export function Sheet({ title, onClose, children, footer, tall = false }: SheetProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  return createPortal(
    <div
      ref={dialogRef}
      data-sheet
      className="outline-none fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 animate-in fade-in-0 duration-150"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-lg bg-surface rounded-t-2xl shadow-2xl flex flex-col ${
          tall ? 'h-[92dvh]' : 'max-h-[85dvh]'
        } animate-in slide-in-from-bottom-8 duration-200`}
      >
        <div className="flex justify-center pt-2" aria-hidden="true">
          <span className="w-10 h-1 rounded-full bg-rule" />
        </div>
        <div className="flex items-start gap-2 pl-5 pr-2 pt-1">
          <div className="flex-1 min-w-0 pt-2 font-display text-[20px] font-semibold text-ink leading-tight">{title}</div>
          <button onClick={onClose} aria-label="Cerrar" className="w-11 h-11 flex items-center justify-center text-ink rounded-md hover:bg-sunken">
            <X size={20} />
          </button>
        </div>
        <div className="info-sheet flex-1 overflow-y-auto px-5 pt-2 pb-5">{children}</div>
        {footer && <div className="border-t border-rule px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
