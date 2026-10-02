// @vitest-environment jsdom
/**
 * "Este turno" muestra los avisos de "un trimestre más y caés" que antes
 * sólo llegaban como notificación (hiperinflación y crisis de gobernabilidad).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TurnPlan } from '../components/board/TurnPlan';
import { createNewGame } from '../engine/gameEngine';
import type { GameState } from '../types/game';
import { LITE_FEATURES } from '../lite/config';
import { DefeatAlerts } from '../components/board/StatusStrip';
import { defeatWarnings } from '../lib/simpleView';

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'pais_en_calma' });
const plan = (state: GameState) =>
  render(<TurnPlan gameState={state} onActionSelect={() => {}} onEndTurn={() => {}} canEndTurn />);

afterEach(() => {
  cleanup();
  LITE_FEATURES.modoDetallado = false;
});

describe('Este turno: avisos críticos', () => {
  it('sin rachas no hay avisos', () => {
    plan(game());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('con detalle, avisa al borde de la hiperinflación y de la crisis de gobernabilidad', () => {
    LITE_FEATURES.modoDetallado = true;
    const state = game();
    state.causal.hyperStreak = 1;
    state.causal.govCrisisStreak = 1;
    plan(state);
    const alerts = screen.getAllByRole('alert').map(a => a.textContent);
    expect(alerts.some(t => t?.includes('Al borde de la hiperinflación'))).toBe(true);
    expect(alerts.some(t => t?.includes('Crisis de gobernabilidad'))).toBe(true);
  });
});

describe('modo simple: avisos de derrota arriba del tablero', () => {
  it('sin peligro no hay avisos, ni en "Este turno"', () => {
    const state = game();
    state.causal.hyperStreak = 1;
    plan(state);
    expect(screen.queryByRole('alert')).toBeNull();
    cleanup();
    render(<DefeatAlerts gameState={game()} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('suave cerca del umbral y rojo cuando el próximo cierre hace perder', () => {
    const near = game();
    near.causal.political.gob = 20;
    expect(defeatWarnings(near)).toEqual([expect.objectContaining({ id: 'impeachment', critical: false })]);
    render(<DefeatAlerts gameState={near} />);
    expect(screen.getByRole('alert').textContent).toMatch(/podés perder la presidencia/);
    cleanup();

    const red = game();
    red.causal.govCrisisStreak = 1;
    red.causal.hyperStreak = 1;
    const warnings = defeatWarnings(red);
    expect(warnings.map(w => [w.id, w.critical])).toEqual([['hyperinflation', true], ['impeachment', true]]);
    render(<DefeatAlerts gameState={red} />);
    const texts = screen.getAllByRole('alert').map(a => a.textContent ?? '');
    expect(texts.some(t => t.includes('juicio político'))).toBe(true);
    expect(texts.every(t => !/\d/.test(t))).toBe(true);
  });
});

describe('Este turno compacto (modo simple en escritorio)', () => {
  it('encabezado en una línea, sin acciones todavía y el botón de cerrar', () => {
    render(<TurnPlan gameState={game()} onActionSelect={() => {}} onEndTurn={() => {}} canEndTurn compact />);
    expect(screen.getByText('Sin acciones todavía.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cerrar el trimestre/ })).toBeTruthy();
    expect(screen.getByText(/Caja al cierre/)).toBeTruthy();
  });
});
