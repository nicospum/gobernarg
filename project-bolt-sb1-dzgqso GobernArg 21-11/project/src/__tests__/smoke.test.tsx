// @vitest-environment jsdom
/**
 * Prueba de humo de la interfaz (Fase 4, versión B): abre el juego completo en
 * un navegador simulado y recorre el primer minuto: portada → personaje →
 * dificultad → tablero → cerrar un turno → recargar y continuar la partida.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';

beforeAll(() => {
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
  // crypto.randomUUID existe en navegadores modernos; jsdom a veces no lo trae.
  if (!globalThis.crypto?.randomUUID) {
    let n = 0;
    Object.defineProperty(globalThis, 'crypto', { value: { ...globalThis.crypto, randomUUID: () => `id-${++n}` }, configurable: true });
  }
});

afterEach(() => cleanup());

const renderGame = () => render(<ErrorBoundary><App /></ErrorBoundary>);
async function click(el: HTMLElement) {
  await act(async () => { fireEvent.click(el); });
}

async function startGame(name: string) {
  await click(screen.getByRole('button', { name: /Empezar/ }));
  fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: name } });
  await click(screen.getByRole('button', { name: /^Continuar$/ }));
  await click(screen.getByRole('button', { name: /Comenzar gestión/ }));
  await click(screen.getByRole('button', { name: /Entendido/ }));
}

// Dibujar el tablero completo en jsdom tarda unos segundos.
describe('Prueba de humo de la interfaz (versión B)', { timeout: 30000 }, () => {
  it('se puede crear un personaje, cerrar un turno y continuar la partida', async () => {
    localStorage.clear();
    renderGame();
    await startGame('Prueba de humo');

    expect(screen.getAllByText('Prueba de humo').length).toBeGreaterThan(0);
    expect(screen.getByText('Tu primer turno')).toBeTruthy();

    await click(screen.getAllByRole('button', { name: /Cerrar turno/ })[0]);
    expect(await screen.findByRole('dialog', { name: /Cierre del turno 1/ })).toBeTruthy();
    expect(screen.queryByText('Algo salió mal')).toBeNull();

    // "Recargar": la portada ofrece continuar donde quedó.
    cleanup();
    renderGame();
    await click(screen.getByRole('button', { name: /Continuar partida/ }));
    expect(screen.getByText(/Turno global 2/)).toBeTruthy();
  });

  it('el menú abre la guía y pide confirmación para reiniciar', async () => {
    localStorage.clear();
    renderGame();
    await startGame('Menú');

    await click(screen.getByRole('button', { name: /^Menú$/ }));
    await click(screen.getByRole('button', { name: /Reiniciar partida/ }));
    expect(screen.getByText(/reemplaza la partida guardada/)).toBeTruthy();
    await click(screen.getByRole('button', { name: 'Seguir jugando' }));

    await click(screen.getByRole('button', { name: /^Menú$/ }));
    await click(screen.getByRole('button', { name: /Cómo se juega/ }));
    expect(screen.getByRole('button', { name: 'Volver al juego' })).toBeTruthy();
  });
});
