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

  it('estado del país: 7 renglones en palabras; con detalle, los 15 indicadores', () => {
    render(<CountryPanel gameState={game()} />);
    expect(screen.getByText('Servicios del Estado')).toBeTruthy();
    expect(screen.queryByText('Ciencia e innovación')).toBeNull();
    expect(screen.queryByText(/indicadores sin alerta/)).toBeNull();
    for (const ind of simpleIndicators(game())) expect(['Bien', 'Normal', 'Alerta']).toContain(ind.word);
    cleanup();
    LITE_FEATURES.modoDetallado = true;
    render(<CountryPanel gameState={game()} />);
    expect(screen.getByText('Ciencia e innovación')).toBeTruthy();
  });

  it('métricas: 4 sin conflictividad; con detalle, las 5', () => {
    render(<MetricsRow gameState={game()} />);
    expect(screen.queryByText('Conflictividad')).toBeNull();
    expect(screen.getByText(/Meta para ganar/)).toBeTruthy();
    cleanup();
    LITE_FEATURES.modoDetallado = true;
    render(<MetricsRow gameState={game()} />);
    expect(screen.getByText('Conflictividad')).toBeTruthy();
  });

  it('tarjeta: efectos con flechas y sin números; con detalle, la de antes', () => {
    card(false);
    expect(screen.getByText('Qué mueve')).toBeTruthy();
    expect(screen.queryByText(/efectos posteriores/)).toBeNull();
    cleanup();
    card(true);
    expect(screen.getByText('Efectos previstos')).toBeTruthy();
  });

  it('cada política muestra hasta 3 efectos, sin cifras', () => {
    for (const a of POLICY_ACTIONS) {
      const list = simpleEffects(a.id);
      expect(list.length).toBeLessThanOrEqual(3);
      for (const e of list) expect(e.label).not.toMatch(/\d/);
    }
  });
});
