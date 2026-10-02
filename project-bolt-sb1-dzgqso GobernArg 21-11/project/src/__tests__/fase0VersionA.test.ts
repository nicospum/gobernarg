import { describe, expect, it } from 'vitest';
import { applyCommand, createCausalGame } from '../causal/engine';
import { deserializeSession, newSession, serializeSession } from '../causal/persistence';
import { DIFFICULTY_LEVELS, HISTORIC_SCENARIOS, SCENARIOS, getScenario, isScenarioUnlocked } from '../causal/scenarios';
import { totalDebt } from '../causal/selectors';
import type { GameCommand } from '../causal/types';

describe('Escenarios y niveles de dificultad (traídos de la versión A)', () => {
  it('Fácil, Normal y Argentina abren un escenario cada uno desde el inicio', () => {
    expect(DIFFICULTY_LEVELS.map(l => [l.label, l.scenarioId])).toEqual([
      ['Fácil', 'pais_en_calma'], ['Normal', 'viento_de_cola'], ['Argentina', 'herencia_pesada'],
    ]);
    for (const l of DIFFICULTY_LEVELS) expect(isScenarioUnlocked(getScenario(l.scenarioId)!, 0)).toBe(true);
    expect(HISTORIC_SCENARIOS.map(s => s.id)).toEqual(['corralito', 'pais_en_llamas']);
  });

  it('cada reelección ganada abre el siguiente escenario histórico', () => {
    const [corralito, llamas] = HISTORIC_SCENARIOS;
    expect(isScenarioUnlocked(corralito, 0)).toBe(false);
    expect(isScenarioUnlocked(corralito, 1)).toBe(true);
    expect(isScenarioUnlocked(llamas, 1)).toBe(false);
    expect(isScenarioUnlocked(llamas, 2)).toBe(true);
    expect(isScenarioUnlocked(llamas, 0, true)).toBe(true);
  });

  it('cada escenario arranca con su país heredado', () => {
    for (const sc of SCENARIOS) {
      const s = createCausalGame('Prueba', 'politico', '', { scenarioId: sc.id });
      expect(s.scenarioId).toBe(sc.id);
      for (const [id, v] of Object.entries(sc.indicators ?? {})) expect(s.indicators[id as keyof typeof s.indicators]).toBe(v);
      if (sc.cash !== undefined) expect(s.cash).toBe(sc.cash);
      expect(totalDebt(s)).toBe((sc.loans ?? []).reduce((sum, l) => sum + l.principal, 0));
    }
  });

  it('sin escenario la partida es la de siempre (partidas guardadas antes de esta versión)', () => {
    const base = createCausalGame('Prueba', 'politico', '');
    expect(base.scenarioId).toBeUndefined();
    expect(totalDebt(base)).toBe(0);
  });

  it('Viento de cola suma recaudación los primeros turnos', () => {
    const viento = newSession({ name: 'Prueba', profile: 'politico', avatar: '', scenarioId: 'viento_de_cola' }).state;
    const sinBoom = createCausalGame('Prueba', 'politico', '', {});
    expect(viento.effects.some(e => e.kind === 'ledger' && e.target === 'revenue_recurring')).toBe(true);
    expect(sinBoom.effects).toHaveLength(0);
  });
});

describe('Guardado', () => {
  it('reconstruye el mismo país con su escenario', () => {
    let session = newSession({ name: 'Prueba', profile: 'empresario', avatar: '', difficulty: 'hard', scenarioId: 'herencia_pesada' });
    const cmd: GameCommand = { id: 'fase0-save-1', expectedTurn: 1, type: 'close_turn' };
    const r = applyCommand(session.state, cmd);
    session = { ...session, state: r.state, commands: [cmd] };
    const loaded = deserializeSession(serializeSession(session));
    expect(loaded.player.scenarioId).toBe('herencia_pesada');
    expect(loaded.state.scenarioId).toBe('herencia_pesada');
    expect(loaded.state.indicators).toEqual(session.state.indicators);
    expect(loaded.state.cash).toBeCloseTo(session.state.cash);
  });

  it('rechaza escenarios desconocidos', () => {
    const text = JSON.stringify({ model: 'lite', saveVersion: 1,
      player: { name: 'X', profile: 'politico', avatar: '', scenarioId: 'inventado' }, commands: [] });
    expect(() => deserializeSession(text)).toThrow('Escenario inválido.');
  });
});
