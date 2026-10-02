// @vitest-environment jsdom
/**
 * Modo simple (LITE_FEATURES.modoDetallado = false): la pantalla muestra
 * menos, sin tocar el estado. Con el flag en true vuelve todo lo de antes.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LITE_FEATURES } from '../lite/config';
import { createNewGame, getPolicyAvailability } from '../engine/gameEngine';
import { CountryPanel } from '../components/CountryPanel';
import { MetricsRow } from '../components/board/MetricsRow';
import { ActionCard } from '../components/ActionCard';
import { ActorsPanel } from '../components/ActorsPanel';
import { simpleEffects, simpleIndicators } from '../lib/simpleView';
import { POLICY_ACTIONS } from '../data/causal';

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'pais_en_calma' });

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  LITE_FEATURES.modoDetallado = false;
});

function card(detailedMode: boolean) {
  LITE_FEATURES.modoDetallado = detailedMode;
  const state = game();
  const av = getPolicyAvailability(state).find(a => a.action.id === 'emitir_dinero')!;
  render(<ActionCard availability={av} requestedBy={[]} onSelect={() => {}} isSelected={false} disabled={false} />);
}

describe('modo simple', () => {
  it('viene apagado el detalle', () => {
    expect(LITE_FEATURES.modoDetallado).toBe(false);
  });

  it('estado del país: los 7 de la B en palabras; con detalle, los 15 indicadores', () => {
    render(<CountryPanel gameState={game()} />);
    // Los mismos 7 que la B Lite, en el mismo orden.
    expect(simpleIndicators(game()).map(i => i.label)).toEqual(['Precios', 'Empleo', 'Bolsillo', 'Obras', 'Educación', 'Salud', 'Seguridad']);
    for (const name of ['Bolsillo', 'Salud', 'Seguridad']) expect(screen.getByText(name)).toBeTruthy();
    for (const name of ['Cuentas públicas', 'Dólar y reservas', 'Conflictividad', 'Ciencia e innovación']) expect(screen.queryByText(name)).toBeNull();
    expect(screen.queryByText(/indicadores sin alerta/)).toBeNull();
    const words = ['Crítico', 'Bajo', 'Regular', 'Bueno', 'Muy bueno', 'Descontrolados', 'Muy altos', 'Altos', 'Estables', 'Muy estables'];
    for (const ind of simpleIndicators(game())) expect(words).toContain(ind.word);
    cleanup();
    LITE_FEATURES.modoDetallado = true;
    render(<CountryPanel gameState={game()} />);
    expect(screen.getByText('Ciencia e innovación')).toBeTruthy();
  });

  it('franja de arriba: voto en % y caja, más los 7 del país; sin aprobación ni gobernabilidad', () => {
    render(<MetricsRow gameState={game()} />);
    const state = game();
    expect(screen.getByText(`${Math.round(state.causal.political.iv)}%`)).toBeTruthy();
    expect(screen.getByText(/meta 45%/)).toBeTruthy();
    expect(screen.getByText('Caja')).toBeTruthy();
    for (const name of ['Precios', 'Empleo', 'Bolsillo', 'Obras', 'Educación', 'Salud', 'Seguridad']) expect(screen.getByText(name)).toBeTruthy();
    for (const name of ['Aprobación', 'Gobernabilidad', 'Conflictividad']) expect(screen.queryByText(name)).toBeNull();
    cleanup();
    LITE_FEATURES.modoDetallado = true;
    render(<MetricsRow gameState={game()} />);
    expect(screen.getByText('Conflictividad')).toBeTruthy();
    expect(screen.getByText('Aprobación')).toBeTruthy();
  });

  it('tarjeta: efectos con flechas y sin números; con detalle, la de antes', () => {
    card(false);
    expect(screen.getByText('Qué mueve')).toBeTruthy();
    expect(screen.queryByText(/efectos posteriores/)).toBeNull();
    cleanup();
    card(true);
    expect(screen.getByText('Efectos previstos')).toBeTruthy();
  });

  it('actores: lista plana de los 17 sin familias; con detalle, por familias', () => {
    const props = { onInteract: () => {}, onSelectAction: () => {}, disabled: false };
    render(<ActorsPanel gameState={game()} {...props} />);
    expect(screen.queryByText('Producción y finanzas')).toBeNull();
    expect(screen.getAllByText(/Cómo le va|Disposición/).length).toBe(17);
    cleanup();
    LITE_FEATURES.modoDetallado = true;
    render(<ActorsPanel gameState={game()} {...props} />);
    expect(screen.getByText('Producción y finanzas')).toBeTruthy();
  });

  it('cada política muestra hasta 3 efectos, sin cifras', () => {
    for (const a of POLICY_ACTIONS) {
      const list = simpleEffects(a.id);
      expect(list.length).toBeLessThanOrEqual(3);
      for (const e of list) expect(e.label).not.toMatch(/\d/);
    }
  });
});
