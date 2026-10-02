// @vitest-environment jsdom
/**
 * Prueba de humo de la interfaz (Fase 4): abre el juego completo en un
 * navegador simulado y recorre lo que hace cualquier persona el primer
 * minuto: portada → nueva partida (una sola pantalla) → tablero → cerrar un
 * turno → recargar y continuar la partida guardada.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';

beforeAll(() => {
  // Lo que jsdom no trae y usan el carrusel y los carteles.
  class Observer { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  const g = globalThis as Record<string, unknown>;
  g.ResizeObserver ??= Observer;
  g.IntersectionObserver ??= Observer;
  window.scrollTo = () => {};
  // Pantalla de computadora con mouse: matchMedia responde "no" a todo.
  window.matchMedia ??= ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(() => {
  cleanup();
});

function renderGame() {
  return render(<ErrorBoundary><App /></ErrorBoundary>);
}

async function click(el: HTMLElement) {
  await act(async () => { fireEvent.click(el); });
}

// Dibujar el tablero completo en jsdom tarda unos segundos.
describe('Prueba de humo de la interfaz', { timeout: 30000 }, () => {
  it('se puede crear un personaje, jugar un turno y continuar la partida', async () => {
    localStorage.clear();
    renderGame();

    await click(screen.getByRole('button', { name: /Empezar/ }));
    // Nueva partida: nombre, foto, perfil y nivel en la misma pantalla.
    expect(screen.getByText('Nueva partida')).toBeTruthy();
    const empezar = screen.getByRole('button', { name: /^Empezar$/ }) as HTMLButtonElement;
    expect(empezar.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Prueba de humo' } });
    await click(screen.getByRole('radio', { name: 'Avatar 3' }));
    expect(screen.getByRole('radio', { name: 'Avatar 3' }).getAttribute('aria-checked')).toBe('true');
    await click(screen.getByRole('radio', { name: /^Sindicalista/ }));
    // Niveles de la Lite: Normal (elegido de entrada) y Argentina; Fácil está oculto.
    expect(screen.getAllByRole('radio', { name: /^(Fácil|Normal|Argentina)/ })).toHaveLength(2);
    expect(screen.getByRole('radio', { name: /^Normal/ }).getAttribute('aria-checked')).toBe('true');
    await click(screen.getByRole('radio', { name: /^Argentina/ }));
    await click(screen.getByRole('button', { name: /^Empezar$/ }));

    // Tablero: encabezado con el nombre y la tarjeta del primer turno.
    expect(screen.getAllByText('Prueba de humo').length).toBeGreaterThan(0);
    expect(screen.getByText('Tu primer turno')).toBeTruthy();

    await click(screen.getByRole('button', { name: /Finalizar turno/ }));
    const resumen = await screen.findByText('Resumen del trimestre');
    expect(resumen).toBeTruthy();
    expect(screen.queryByText('Algo salió mal')).toBeNull();

    // "Recargar": la portada ofrece continuar donde quedó.
    cleanup();
    renderGame();
    await click(screen.getByRole('button', { name: /Continuar partida/ }));
    const banner = screen.getByRole('banner');
    expect(within(banner).getByText(/Turno/)).toBeTruthy();
    expect(within(banner).getByText('2')).toBeTruthy();
  });

  it('el menú abre la guía y pide confirmación para reiniciar', async () => {
    localStorage.clear();
    renderGame();
    await click(screen.getByRole('button', { name: /Empezar/ }));
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Menú' } });
    await click(screen.getByRole('button', { name: /^Empezar$/ }));
    await click(screen.getByRole('button', { name: /Entendido/ }));

    await click(screen.getByRole('button', { name: /Menú/ }));
    await click(screen.getByRole('menuitem', { name: /Reiniciar/ }));
    expect(screen.getByText('¿Reiniciar la partida?')).toBeTruthy();
    await click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('¿Reiniciar la partida?')).toBeNull();

    await click(screen.getByRole('button', { name: /Menú/ }));
    await click(screen.getByRole('menuitem', { name: /Cómo se juega/ }));
    expect(await screen.findByText('Volver al juego')).toBeTruthy();
  });
});
