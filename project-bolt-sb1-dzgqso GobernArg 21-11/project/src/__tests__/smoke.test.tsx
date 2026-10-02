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
import { LITE_FEATURES } from '../lite/config';

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
    expect(screen.getByText('Año 1 · T2')).toBeTruthy();
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

  it('la Lite oculta paneles y cifras; el modo detallado los devuelve', async () => {
    localStorage.clear();
    renderGame();
    await startGame('Lite');
    expect(screen.getByRole('region', { name: 'El país' })).toBeTruthy();
    // Actores en una lista plana, sin "factores de poder" ni grupos.
    expect(screen.getByRole('heading', { name: 'Actores' })).toBeTruthy();
    expect(screen.queryByText('Factores de poder')).toBeNull();
    for (const metric of ['Aprobación material', 'Estabilidad', 'Legitimidad']) expect(screen.queryByText(metric)).toBeNull();
    expect(screen.getByRole('region', { name: 'El país' }).querySelectorAll('[data-indicator]')).toHaveLength(7);
    expect(screen.getByRole('region', { name: 'El país' }).querySelector('[data-indicator="proteccion"]')).toBeNull();
    for (const hidden of ['Cable de gobierno', 'Expediente del trimestre', 'Briefing del país', 'Componente electoral social']) expect(screen.queryByText(hidden)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Gestión' })).toBeNull();
    await click(screen.getByRole('button', { name: 'Tesoro' }));
    expect(screen.getByRole('region', { name: 'Caja y deuda' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Compromisos' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Gobernabilidad' })).toBeTruthy();
    expect(screen.queryByText('Proyección de obligaciones')).toBeNull();
    expect(screen.queryByText(/ U\b/)).toBeNull();
    cleanup();

    LITE_FEATURES.modoDetallado = true;
    try {
      localStorage.clear();
      renderGame();
      await startGame('Detallado');
      expect(screen.getByText('Briefing del país')).toBeTruthy();
      expect(screen.getByText('Cable de gobierno')).toBeTruthy();
      expect(screen.getByText('Expediente del trimestre')).toBeTruthy();
      await click(screen.getByRole('button', { name: 'Gestión' }));
      expect(screen.getByText('Calendario político')).toBeTruthy();
      expect(screen.getByText('Objetivos de gobierno')).toBeTruthy();
    } finally {
      LITE_FEATURES.modoDetallado = false;
    }
  });
});
