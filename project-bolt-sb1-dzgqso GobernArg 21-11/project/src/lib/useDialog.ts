import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Modales abiertos, del de más abajo al de más arriba: el teclado va al último. */
const stack: HTMLElement[] = [];

/**
 * Comportamiento común de los modales: al abrirse toman el foco (el propio
 * cuadro, así Enter no elige nada por accidente ni vuelve a apretar
 * "Finalizar turno" que queda detrás), Tab no se escapa del cuadro y Esc lo
 * cierra cuando el modal se puede cerrar. Al cerrarse devuelve el foco a
 * donde estaba, salvo a los botones marcados con data-no-restore-focus.
 * El teclado se escucha en todo el documento: si el botón con foco
 * desaparece (p. ej. "Cancelar"), Esc y Tab siguen funcionando.
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
    stack.push(el);

    const onKeyDown = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== el) return;
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
      if (!el.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const i = stack.lastIndexOf(el);
      if (i >= 0) stack.splice(i, 1);
      if (previous && previous.isConnected && !previous.hasAttribute('data-no-restore-focus')) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  return ref;
}
