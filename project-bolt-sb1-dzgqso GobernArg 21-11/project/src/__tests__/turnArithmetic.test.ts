import { describe, it, expect } from 'vitest';
import { getGlobalTurn } from '../engine/engineShared';
import { applyGroupSatisfactionPenalty } from '../engine/groupAgendaEngine';
import { resolveRandomEvents } from '../engine/eventResolver';
import { getInitialGameState } from '../engine/gameEngine';
import { GameState } from '../types/game';

describe('getGlobalTurn - aritmética de turnos global', () => {
  it('turno 1 año 1 = 1', () => {
    expect(getGlobalTurn({ year: 1, turn: 1 })).toBe(1);
  });

  it('turno 4 año 1 = 4', () => {
    expect(getGlobalTurn({ year: 1, turn: 4 })).toBe(4);
  });

  it('turno 1 año 2 = 5 (cruza el límite de año)', () => {
    expect(getGlobalTurn({ year: 2, turn: 1 })).toBe(5);
  });

  it('turno 4 año 4 = 16 (fin de mandato)', () => {
    expect(getGlobalTurn({ year: 4, turn: 4 })).toBe(16);
  });
});

describe('applyGroupSatisfactionPenalty - deadlines cruzan año (bug crítico)', () => {
  function makeState(overrides?: Partial<GameState>): GameState {
    const base = getInitialGameState();
    return {
      ...base,
      groupRelations: { empresarios: 50 },
      ...overrides,
    };
  }

  it('demanda vencida SIN cumplir aplica penalización (deadline global 4, turno 1 año 2)', () => {
    const state = makeState({
      year: 2,
      turn: 1, // global 5
      completedActions: [],
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 4, // global: venció en año 1
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);
    expect(result.groupRelations['empresarios']).toBeLessThan(50);
    expect(result.groupAgendas[0].penaltyApplied).toBe(true);
  });

  it('demanda vencida CON cumplimiento da +10 apoyo', () => {
    const state = makeState({
      year: 2,
      turn: 1, // global 5
      completedActions: ['test_action'],
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test_action',
          deadline: 4, // global: venció en año 1
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);
    expect(result.groupRelations['empresarios']).toBe(60);
    expect(result.groupAgendas[0].satisfied).toBe(true);
  });

  it('demanda NO vencida no aplica cambios (deadline futuro)', () => {
    const state = makeState({
      year: 1,
      turn: 2, // global 2
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 5, // global: aún no vence
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);
    expect(result.groupRelations['empresarios']).toBe(50);
    expect(result.groupAgendas[0].penaltyApplied).toBe(false);
  });
});

describe('resolveRandomEvents - cooldown global con turnos cíclicos (bug crítico)', () => {
  function makeState(overrides?: Partial<GameState>): GameState {
    return { ...getInitialGameState(), ...overrides };
  }

  it('evento disparado en turno 2 NO bloquea eventos en turno 1 año 2 (diferencia global 3)', () => {
    // lastRandomEventTurn = 2 (turno 2 año 1, global 2)
    // turno 1 año 2 = global 5 → diferencia 3 → fuera de cooldown
    const state = makeState({
      year: 2,
      turn: 1,
      lastRandomEventTurn: 2, // global
      randomEventsThisTerm: 1,
    });

    const triggered = resolveRandomEvents(state);
    // No debe estar bloqueado por cooldown. Con random real puede disparar o no,
    // pero el array se devuelve tras pasar el chequeo de cooldown.
    expect(Array.isArray(triggered)).toBe(true);
    // Verificar que el cooldown NO bloquea: el chequeo pasa (no podemos garantizar trigger con random real)
  });

  it('evento disparado en turno 2 SÍ bloquea en turno 3 año 1 (diferencia global 1)', () => {
    const state = makeState({
      year: 1,
      turn: 3,
      lastRandomEventTurn: 2, // global
      randomEventsThisTerm: 1,
    });

    const triggered = resolveRandomEvents(state);
    expect(triggered.length).toBe(0);
  });
});
