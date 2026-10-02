// @vitest-environment jsdom
/**
 * Prueba de humo de la interfaz (Fase 4, versión B): abre el juego completo en
 * un navegador simulado y recorre el primer minuto: portada → nueva partida
 * (una sola pantalla) → tablero → cerrar un turno → recargar y continuar.
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
  expect(screen.getByRole('heading', { name: 'Nueva partida' })).toBeTruthy();
  fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: name } });
  await click(screen.getByRole('button', { name: /^Empezar$/ }));
}

// Dibujar el tablero completo en jsdom tarda unos segundos.
describe('Prueba de humo de la interfaz (versión B Lite)', { timeout: 30000 }, () => {
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

  it('la pantalla de nueva partida pide nombre, valida la foto y respeta perfil y nivel', async () => {
    localStorage.clear();
    renderGame();
    await click(screen.getByRole('button', { name: /Empezar/ }));
    await click(screen.getByRole('button', { name: /^Empezar$/ }));
    expect(screen.getByText('Escribí un nombre para empezar.')).toBeTruthy();

    // Las fotos de la grilla no muestran nombres: solo un texto accesible genérico.
    expect(screen.getAllByRole('radio', { name: /^Avatar \d+$/ })).toHaveLength(15);
    const file = new File(['hola'], 'notas.txt', { type: 'text/plain' });
    await act(async () => { fireEvent.change(screen.getByLabelText('Subir mi foto', { selector: 'input' }), { target: { files: [file] } }); });
    expect(await screen.findByText(/Elegí un archivo de imagen/)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Perfiles' } });
    await click(screen.getByRole('radio', { name: /Avatar 4/ }));
    await click(screen.getByRole('radio', { name: /Sindicalista/ }));
    await click(screen.getByRole('radio', { name: /Argentina/ }));
    await click(screen.getByRole('button', { name: /^Empezar$/ }));
    expect(screen.getAllByText('Sindicalista').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Herencia pesada/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('5 acciones').length).toBeGreaterThan(0);
  });
});
