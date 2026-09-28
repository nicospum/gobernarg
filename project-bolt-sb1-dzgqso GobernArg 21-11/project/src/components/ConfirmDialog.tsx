import { createPortal } from 'react-dom';
import { useDialog } from '@/lib/useDialog';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Acción que no se puede deshacer: el botón de confirmar va en rojo. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useDialog<HTMLDivElement>(onCancel);
  // Portal al body: el header (sticky con desenfoque) encerraría un "fixed" dentro suyo.
  return createPortal(
    <div
      ref={dialogRef}
      data-sheet
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      className="outline-none fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-xl bg-surface border border-rule shadow-2xl p-5">
        <h2 id="confirm-title" className={`font-display text-lg font-semibold ${danger ? 'text-red-400' : 'text-ink'}`}>
          {title}
        </h2>
        <p id="confirm-message" className="mt-1.5 text-sm text-ink/75 leading-relaxed">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={onCancel}
            className="h-11 rounded-md border border-rule bg-surface text-sm font-medium text-ink hover:bg-sunken transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`h-11 rounded-md text-sm font-semibold transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-600/90 text-white' : 'bg-ink hover:bg-ink/90 text-paper'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
