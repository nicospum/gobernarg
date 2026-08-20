import { describe, it, expect } from 'vitest';
import { checkEventConditions } from '../engine/eventResolver';
import type { GameState } from '../types/game';
import type { GameEvent, EventConditions } from '../systems/events/types';

const ALL_CONDITIONS: EventConditions = {
  minPopularity: 40,
  maxPopularity: 70,
  minBudget: 100,
  maxBudget: 1000,
  minStability: 30,
  maxStability: 80,
  minMoneyPrinting: 2,
  requiredGroups: ['sindicatos'],
  requiredAdvisors: ['advisor1'],
  requiredActions: ['reforma_laboral'],
  turnRange: { min: 3, max: 10 },
};

function syntheticEvent(conditions: EventConditions): GameEvent {
  return {
    id: 'test_event',
    type: 'random',
    category: 'political',
    severity: 'medium',
    title: 'Evento sintético',
    description: 'Evento de prueba para checkEventConditions',
    conditions,
    effects: { immediate: [] },
    probability: 0.5,
  };
}

// Estado que cumple TODAS las condiciones del evento sintético.
// turno global = (año - 1) * 4 + turno → year 2, turn 1 = 5 (dentro de 3-10)
function validState(overrides: Partial<GameState> = {}): GameState {
  return {
    position: 'intendente',
    archetype: 'politico',
    popularity: 55,
    budget: 500,
    stability: 50,
    turn: 1,
    year: 2,
    term: 1,
    difficulty: 'normal',
    moneyPrintingCount: 2,
    groupRelations: { sindicatos: 55 },
    advisors: [{ id: 'advisor1', isActive: true } as any],
    completedActions: ['reforma_laboral'],
    pendingEffects: [],
    interactionHistory: {},
    groupMoods: [],
    groupAgendas: [],
    ...overrides,
  } as GameState;
}

describe('checkEventConditions', () => {
  it('todas las condiciones cumplidas → true', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState())).toBe(true);
  });

  it('sin condiciones definidas → true', () => {
    const state = validState({ popularity: 5, budget: -500, stability: 1 });
    expect(checkEventConditions(syntheticEvent({}), state)).toBe(true);
  });

  it('popularidad fuera de rango: min y max → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ popularity: 39 }))).toBe(false);
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ popularity: 71 }))).toBe(false);
  });

  it('presupuesto fuera de rango: min y max → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ budget: 99 }))).toBe(false);
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ budget: 1001 }))).toBe(false);
  });

  it('estabilidad fuera de rango: min y max → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ stability: 29 }))).toBe(false);
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ stability: 81 }))).toBe(false);
  });

  it('emisión monetaria insuficiente → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ moneyPrintingCount: 1 }))).toBe(false);
  });

  it('grupo requerido sin apoyo → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ groupRelations: {} }))).toBe(false);
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ groupRelations: { sindicatos: 0 } }))).toBe(false);
  });

  it('asesor requerido ausente o inactivo → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ advisors: [] }))).toBe(false);
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ advisors: [{ id: 'advisor1', isActive: false } as any] }))).toBe(false);
  });

  it('acción requerida no ejecutada → false', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ completedActions: [] }))).toBe(false);
  });

  it('turno global fuera del rango → false', () => {
    // year 1, turn 2 → turno global 2 < 3
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ year: 1, turn: 2 }))).toBe(false);
    // year 3, turn 3 → turno global 11 > 10
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ year: 3, turn: 3 }))).toBe(false);
  });

  it('boundary de turno global: en los extremos del rango → true', () => {
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ year: 1, turn: 3 }))).toBe(true); // 3
    expect(checkEventConditions(syntheticEvent(ALL_CONDITIONS), validState({ year: 3, turn: 2 }))).toBe(true); // 10
  });
});
