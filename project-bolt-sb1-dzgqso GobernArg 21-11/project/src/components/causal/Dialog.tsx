import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Diálogos abiertos, del de más abajo al de más arriba: el teclado va al último. */
const stack: HTMLElement[] = [];

/**
 * Diálogo de la versión B. Toma el foco, no deja escapar el Tab y Esc lo
 * cierra si se puede cerrar. Con varios abiertos, el teclado lo maneja el de
 * arriba. Al cerrarse no devuelve el foco a "Cerrar turno" (data-no-restore-focus),
 * así un Enter posterior no cierra otro turno sin querer. En el celular ocupa
 * toda la pantalla.
 */
export function Dialog({ title, children, onClose, dismissible = true }: { title: string; children: ReactNode; onClose: () => void; dismissible?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const previous = document.activeElement as HTMLElement | null;
    el.focus({ preventScroll: true });
    stack.push(el);
    const onKey = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== el) return;
      if (event.key === 'Escape' && dismissible) { event.stopPropagation(); onClose(); }
      if (event.key === 'Tab') {
        const controls = Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, a[href], [tabindex="0"]')).filter(n => n.offsetParent !== null);
        const first = controls[0], last = controls[controls.length - 1];
        if (!controls.length) { event.preventDefault(); return; }
        if (!el.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === el)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const i = stack.lastIndexOf(el);
      if (i >= 0) stack.splice(i, 1);
      if (previous?.isConnected && !previous.hasAttribute('data-no-restore-focus')) previous.focus({ preventScroll: true });
    };
  }, [onClose, dismissible]);
  return <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm p-0 sm:p-6 flex items-stretch sm:items-center justify-center" onMouseDown={event => { if (dismissible && event.target === event.currentTarget) onClose(); }}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-3xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto bg-card sm:border border-border sm:rounded-xl shadow-2xl outline-none">
      <div className="sticky top-0 bg-card border-b border-border p-5 flex justify-between items-start gap-3 z-10">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {dismissible && <button type="button" onClick={onClose} aria-label="Cerrar diálogo" className="-m-2 p-3 hover:bg-white/10 rounded"><X size={20} /></button>}
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  </div>;
}
