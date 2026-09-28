import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento común de los modales: al abrirse toman el foco (el propio
 * cuadro, así Enter no elige nada por accidente ni vuelve a apretar
 * "Finalizar turno" que queda detrás), Tab no se escapa del cuadro y Esc lo
 * cierra cuando el modal se puede cerrar. Al cerrarse devuelve el foco a
 * donde estaba, salvo a los botones marcados con data-no-restore-focus.
 */
export function useDialog<T extends HTMLElement>(onClose?: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const previous = document.activeElement as HTMLElement | null;
    el.setAttribute('role', el.getAttribute('role') ?? 'dialog');
    el.setAttribute('aria-modal', 'true');
    if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
    el.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(n => n.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      if (previous && previous.isConnected && !previous.hasAttribute('data-no-restore-focus')) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  return ref;
}
