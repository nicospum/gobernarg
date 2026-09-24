import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Dialog({ title, children, onClose, dismissible = true }: { title: string; children: ReactNode; onClose: () => void; dismissible?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) onClose();
      if (event.key === 'Tab') {
        const controls = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, a[href], [tabindex="0"]') ?? []);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onClose, dismissible]);
  return <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center" onMouseDown={event => { if (dismissible && event.target === event.currentTarget) onClose(); }}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl outline-none">
      <div className="sticky top-0 bg-card border-b border-border p-5 flex justify-between items-start gap-3 z-10">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {dismissible && <button type="button" onClick={onClose} aria-label="Cerrar diálogo" className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>}
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  </div>;
}
