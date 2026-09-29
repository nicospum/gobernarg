import { lazy, Suspense, type ComponentType } from 'react';

/**
 * Pantalla que se descarga recién la primera vez que se muestra (Fase 4).
 * Mientras llega no dibuja nada; después queda en caché del navegador.
 */
export function lazyModal<P extends object>(load: () => Promise<ComponentType<P>>) {
  const Lazy = lazy(async () => ({ default: await load() })) as unknown as ComponentType<P>;
  return function LazyModal(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}
