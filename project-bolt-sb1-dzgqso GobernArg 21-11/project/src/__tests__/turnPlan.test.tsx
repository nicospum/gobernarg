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

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'pais_en_calma' });
const plan = (state: GameState) =>
  render(<TurnPlan gameState={state} onActionSelect={() => {}} onEndTurn={() => {}} canEndTurn />);

afterEach(cleanup);

describe('Este turno: avisos críticos', () => {
  it('sin rachas no hay avisos', () => {
    plan(game());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('avisa al borde de la hiperinflación y de la crisis de gobernabilidad', () => {
    const state = game();
    state.causal.hyperStreak = 1;
    state.causal.govCrisisStreak = 1;
    plan(state);
    const alerts = screen.getAllByRole('alert').map(a => a.textContent);
    expect(alerts.some(t => t?.includes('Al borde de la hiperinflación'))).toBe(true);
    expect(alerts.some(t => t?.includes('Crisis de gobernabilidad'))).toBe(true);
  });
});
