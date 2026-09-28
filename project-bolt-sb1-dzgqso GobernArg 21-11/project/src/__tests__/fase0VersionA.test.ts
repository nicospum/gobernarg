import { describe, expect, it } from 'vitest';
import { applyCommand, createCausalGame, policyAvailability } from '../causal/engine';
import { CABINET } from '../causal/campaignCatalog';
import { deserializeSession, newSession, serializeSession } from '../causal/persistence';
import {
  DIFFICULTY_LEVELS, HISTORIC_SCENARIOS, OWN_PLATFORM_ID, PLATFORMS, SCENARIOS,
  deriveOwnPlatform, getScenario, isScenarioUnlocked,
} from '../causal/scenarios';
import { actorTarget, sensitivitiesOf, totalDebt } from '../causal/selectors';
import type { CausalState, GameCommand } from '../causal/types';

let seq = 0;
function issue(state: CausalState, type: GameCommand['type'], targetId?: string, params?: GameCommand['params']): CausalState {
  const cmd: GameCommand = { id: `fase0-${++seq}`, expectedTurn: state.turn, type, targetId, params };
  if (type === 'execute') cmd.actionId = targetId;
  const result = applyCommand(state, cmd);
  expect(result.accepted, result.message).toBe(true);
  return result.state;
}

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
    expect(base.platform).toBeUndefined();
    expect(totalDebt(base)).toBe(0);
  });

  it('Viento de cola suma recaudación los primeros turnos', () => {
    const viento = newSession({ name: 'Prueba', profile: 'politico', avatar: '', scenarioId: 'viento_de_cola' }).state;
    const sinBoom = createCausalGame('Prueba', 'politico', '', {});
    expect(viento.effects.some(e => e.kind === 'ledger' && e.target === 'revenue_recurring')).toBe(true);
    expect(sinBoom.effects).toHaveLength(0);
  });
});

describe('Plataforma del partido', () => {
  it('apagada, el oficialismo mira lo de siempre', () => {
    const s = createCausalGame('Prueba', 'politico', '', { platformId: 'ninguna' });
    expect(s.platform).toBeUndefined();
    expect(sensitivitiesOf(s, 'oficialismo').map(x => x.indicatorId)).toEqual(['derechos', 'actividad', 'fiscal', 'proteccion']);
  });

  it('una plataforma prearmada reemplaza lo que espera el oficialismo', () => {
    const preset = PLATFORMS.find(p => p.id === 'orden_y_estabilidad')!;
    const s = createCausalGame('Prueba', 'politico', '', { platformId: preset.id });
    expect(sensitivitiesOf(s, 'oficialismo')).toEqual(preset.items);
    expect(s.actors.oficialismo.satisfaction).toBeCloseTo(actorTarget('oficialismo', s.indicators, preset.items));
  });

  it('la plataforma propia arranca vacía y se arma con lo que ejecutás', () => {
    let s = newSession({ name: 'Prueba', profile: 'politico', avatar: '', platformId: OWN_PLATFORM_ID }).state;
    expect(s.platform).toEqual({ mode: 'propia', id: OWN_PLATFORM_ID, items: [] });
    s = issue(s, 'execute', 'mejorar_recaudacion');
    s = issue(s, 'close_turn');
    expect(s.platform!.items.length).toBeGreaterThan(0);
    expect(s.reports[s.reports.length - 1].messages.some(m => m.startsWith('Tu partido ahora espera'))).toBe(true);
  });

  it('nunca pide que la inflación suba', () => {
    const items = deriveOwnPlatform({ inflacion: 5, actividad: 3 });
    expect(items).toEqual([{ indicatorId: 'actividad', weight: 8 }]);
    expect(deriveOwnPlatform({ inflacion: -4 })).toEqual([{ indicatorId: 'inflacion', weight: -8 }]);
  });
});

describe('Guardado', () => {
  it('reconstruye el mismo país con escenario y plataforma', () => {
    let session = newSession({ name: 'Prueba', profile: 'empresario', avatar: '', difficulty: 'hard', scenarioId: 'herencia_pesada', platformId: 'desarrollo_productivo' });
    const cmd: GameCommand = { id: 'fase0-save-1', expectedTurn: 1, type: 'close_turn' };
    const r = applyCommand(session.state, cmd);
    session = { ...session, state: r.state, commands: [cmd] };
    const loaded = deserializeSession(serializeSession(session));
    expect(loaded.player.scenarioId).toBe('herencia_pesada');
    expect(loaded.state.scenarioId).toBe('herencia_pesada');
    expect(loaded.state.platform?.id).toBe('desarrollo_productivo');
    expect(loaded.state.indicators).toEqual(session.state.indicators);
    expect(loaded.state.cash).toBeCloseTo(session.state.cash);
  });

  it('rechaza escenarios o plataformas desconocidos', () => {
    const text = JSON.stringify({ schemaVersion: 1, modelVersion: 'causal-1', campaignVersion: 1, campaignStart: 0,
      player: { name: 'X', profile: 'politico', avatar: '', scenarioId: 'inventado' }, commands: [] });
    expect(() => deserializeSession(text)).toThrow('Escenario inválido.');
  });
});

describe('Charly Abad en la versión B', () => {
  it('está en el gabinete con salud como especialidad', () => {
    const charly = CABINET.find(a => a.id === 'advisor8')!;
    expect(charly.name).toBe('Charly Abad');
    expect(charly.categories).toEqual(['Servicios']);
  });

  it('en funciones abarata reuniones (más con empresarios y organizaciones sociales) y la red hospitalaria', () => {
    let s = newSession({ name: 'Prueba', profile: 'comunicador', avatar: '' }).state;
    const meetBefore = policyAvailability(s, 'reunirse', { actorId: 'agro' }).cashCost;
    const meetCloseBefore = policyAvailability(s, 'reunirse', { actorId: 'industria' }).cashCost;
    const hospitalBefore = policyAvailability(s, 'construccion_hospitales').cashCost;
    s = issue(s, 'hire_advisor', 'advisor8');
    while (!s.campaign!.advisors.some(a => a.id === 'advisor8' && a.activeFrom <= s.turn)) s = issue(s, 'close_turn');
    expect(policyAvailability(s, 'reunirse', { actorId: 'agro' }).cashCost).toBeCloseTo(meetBefore * 0.8);
    expect(policyAvailability(s, 'reunirse', { actorId: 'industria' }).cashCost).toBeCloseTo(meetCloseBefore * 0.6);
    expect(policyAvailability(s, 'construccion_hospitales').cashCost).toBeCloseTo(hospitalBefore * 0.85);
  });
});
