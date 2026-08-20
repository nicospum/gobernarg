import { describe, it, expect } from 'vitest';
import {
  checkAllDefeatConditions,
  checkDefeatConditions,
  checkVictoryConditions,
  updateObjectives,
} from '../utils/victoryConditions';
import type { GameState, Objective } from '../types/game';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    position: 'intendente',
    archetype: 'politico',
    popularity: 50,
    budget: 500,
    stability: 50,
    turn: 1,
    year: 1,
    term: 1,
    difficulty: 'normal',
    votingIntention: 50,
    moneyPrintingCount: 0,
    consecutiveLowPopularity: 0,
    consecutiveNegativeBudget: 0,
    impeachmentConsecutiveTurns: 0,
    coupConsecutiveTurns: 0,
    groupRelations: {},
    advisors: [],
    ...overrides,
  } as GameState;
}

describe('checkAllDefeatConditions', () => {
  it('no hay derrota en estado normal', () => {
    const state = baseState();
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(false);
  });

  it('popularidad muy baja por 3 turnos seguidos causa derrota', () => {
    const state = baseState({ popularity: 5, consecutiveLowPopularity: 3 });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('low_popularity');
  });

  it('déficit por 3 turnos consecutivos causa derrota', () => {
    const state = baseState({ budget: -500, consecutiveNegativeBudget: 3 });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('negative_budget');
  });

  it('impeachment: popularidad < 10 y estabilidad < 20 por 2 turnos causa derrota', () => {
    const state = baseState({
      popularity: 9,
      stability: 19,
      impeachmentConsecutiveTurns: 2,
    });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('impeachment');
  });

  it('golpe institucional: estabilidad < 10 y apoyo legislativo < 25 por 3 turnos causa derrota', () => {
    const state = baseState({
      stability: 9,
      legislativeSupport: 24,
      coupConsecutiveTurns: 3,
    });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('institutional_coup');
  });

  it('hiperinflación: 7 o más emisiones monetarias causa derrota', () => {
    const state = baseState({ moneyPrintingCount: 7 });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('hyperinflation');
  });
});

function makeObjective(requirements: Objective['requirements']): Objective {
  return {
    id: 'test-objective',
    title: 'Objetivo de prueba',
    description: '',
    requirements,
    reward: {},
    completed: false,
    progress: 0,
  };
}

describe('checkDefeatConditions - boundaries de turnos consecutivos', () => {
  // El contador se incrementa ANTES de evaluar (ver checkDefeat en turnProcessor),
  // por lo que checkDefeatConditions recibe consecutiveLowPopularity ya incrementado:
  // 0 = primer turno por debajo del umbral (aún no derrota), 1 = segundo turno (derrota).

  it('primer turno por debajo del umbral no derrota (intendente, umbral 20)', () => {
    const state = baseState({ position: 'intendente', popularity: 19, consecutiveLowPopularity: 0 });
    expect(checkDefeatConditions(state)).toBe(false);
  });

  it('segundo turno consecutivo por debajo del umbral derrota (intendente, umbral 20)', () => {
    const state = baseState({ position: 'intendente', popularity: 19, consecutiveLowPopularity: 1 });
    expect(checkDefeatConditions(state)).toBe(true);
  });

  it('en el umbral exacto (20) no cuenta como popularidad baja', () => {
    const state = baseState({ position: 'intendente', popularity: 20, consecutiveLowPopularity: 1 });
    expect(checkDefeatConditions(state)).toBe(false);
  });

  it('gobernador: umbral 25', () => {
    expect(checkDefeatConditions(baseState({ position: 'gobernador', popularity: 24, consecutiveLowPopularity: 0 }))).toBe(false);
    expect(checkDefeatConditions(baseState({ position: 'gobernador', popularity: 24, consecutiveLowPopularity: 1 }))).toBe(true);
    expect(checkDefeatConditions(baseState({ position: 'gobernador', popularity: 25, consecutiveLowPopularity: 1 }))).toBe(false);
  });

  it('presidente: umbral 30', () => {
    expect(checkDefeatConditions(baseState({ position: 'presidente', popularity: 29, consecutiveLowPopularity: 0 }))).toBe(false);
    expect(checkDefeatConditions(baseState({ position: 'presidente', popularity: 29, consecutiveLowPopularity: 1 }))).toBe(true);
    expect(checkDefeatConditions(baseState({ position: 'presidente', popularity: 30, consecutiveLowPopularity: 1 }))).toBe(false);
  });

  it('presupuesto negativo: primer turno no derrota, segundo consecutivo sí', () => {
    expect(checkDefeatConditions(baseState({ budget: -100, consecutiveNegativeBudget: 0 }))).toBe(false);
    expect(checkDefeatConditions(baseState({ budget: -100, consecutiveNegativeBudget: 1 }))).toBe(true);
  });
});

describe('checkVictoryConditions', () => {
  function winningObjectives(): Objective[] {
    return [{ ...makeObjective({ popularity: 60 }), completed: true, progress: 100 }];
  }

  it('victoria cuando hay objetivos completos, popularidad >= 60 y presupuesto > 0', () => {
    const state = baseState({ popularity: 60, budget: 1, objectives: winningObjectives() });
    expect(checkVictoryConditions(state)).toBe(true);
  });

  it('cada condición por separado hace que la victoria falle: objetivo incompleto', () => {
    const state = baseState({
      popularity: 80,
      budget: 1000,
      objectives: [
        { ...makeObjective({ popularity: 60 }), completed: true, progress: 100 },
        { ...makeObjective({ budget: 2000 }), completed: false, progress: 50 },
      ],
    });
    expect(checkVictoryConditions(state)).toBe(false);
  });

  it('cada condición por separado hace que la victoria falle: popularidad < 60', () => {
    const state = baseState({ popularity: 59, budget: 1000, objectives: winningObjectives() });
    expect(checkVictoryConditions(state)).toBe(false);
  });

  it('cada condición por separado hace que la victoria falle: presupuesto <= 0', () => {
    const state = baseState({ popularity: 80, budget: 0, objectives: winningObjectives() });
    expect(checkVictoryConditions(state)).toBe(false);
  });
});

describe('updateObjectives', () => {
  it('completa el objetivo por requisito de popularidad y calcula progress', () => {
    const state = baseState({ popularity: 80, objectives: [makeObjective({ popularity: 70 })] });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100); // 80/70 > 100 → clamp
  });

  it('no completa si no alcanza la popularidad y deja progress parcial', () => {
    const state = baseState({ popularity: 35, objectives: [makeObjective({ popularity: 70 })] });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(50); // 35/70 = 50%
  });

  it('completa el objetivo por requisito de presupuesto', () => {
    const state = baseState({ budget: 2500, objectives: [makeObjective({ budget: 2000 })] });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
  });

  it('completa el objetivo cuando todas las acciones requeridas fueron ejecutadas', () => {
    const state = baseState({
      completedActions: ['plan_viviendas', 'transporte_publico'],
      objectives: [makeObjective({ completedActions: ['plan_viviendas', 'transporte_publico'] })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });

  it('deja el objetivo incompleto cuando falta alguna acción', () => {
    const state = baseState({
      completedActions: ['plan_viviendas'],
      objectives: [makeObjective({ completedActions: ['plan_viviendas', 'transporte_publico'] })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(50);
  });

  it('completa el objetivo por apoyo de grupos leyendo state.groupRelations', () => {
    const state = baseState({
      groupRelations: { empresarios: 80, sindicatos: 80, 'clase-media': 75 },
      objectives: [makeObjective({ groupSupport: { empresarios: 80, sindicatos: 80, 'clase-media': 75 } })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });

  it('no completa si algún grupo no alcanza el apoyo requerido', () => {
    const state = baseState({
      groupRelations: { empresarios: 80, sindicatos: 79, 'clase-media': 75 },
      objectives: [makeObjective({ groupSupport: { empresarios: 80, sindicatos: 80, 'clase-media': 75 } })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(67); // 2 de 3 grupos
  });

  it('un grupo sin relación previa cuenta como apoyo 0', () => {
    const state = baseState({
      groupRelations: {},
      objectives: [makeObjective({ groupSupport: { empresarios: 80 } })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(0);
  });

  it('no muta el estado original', () => {
    const state = baseState({ popularity: 80, objectives: [makeObjective({ popularity: 70 })] });
    const originalObjective = state.objectives[0];
    updateObjectives(state);
    expect(state.objectives[0]).toBe(originalObjective);
    expect(originalObjective.completed).toBe(false);
  });

  it('respeta objetivos ya completados sin recalcularlos', () => {
    const state = baseState({
      popularity: 10,
      objectives: [{ ...makeObjective({ popularity: 70 }), completed: true, progress: 100 }],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });
});
