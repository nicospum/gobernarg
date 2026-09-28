import { useEffect, useState } from 'react';

function matches(query: string): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState(() => matches(query));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setValue(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return value;
}

/** Celulares y tablets en vertical: tablero en pestañas con barra fija abajo. */
export const MOBILE_QUERY = '(max-width: 1023px)';
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

/** Pantallas sin mouse: lo que en la computadora aparece al pasar el mouse se abre al tocar. */
export const useIsTouch = () => useMediaQuery('(hover: none)');
