import { describe, it, expect } from 'vitest';
import { applyEventChoice, checkEventConditions, resolveRandomEvents } from '../engine/eventResolver';
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
    objectives: [],
    completedObjectives: [],
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


describe('applyEventChoice — efectos diferidos', () => {
  function eventWithDelayed(delayed: any[]): GameEvent {
    return {
      id: 'evento_diferido',
      type: 'random',
      category: 'political',
      severity: 'medium',
      title: 'Evento con efecto diferido',
      description: 'Prueba',
      conditions: {},
      effects: { immediate: [] },
      choices: [
        {
          id: 'opcion_a',
          text: 'Aceptar',
          effects: { immediate: [], delayed },
        },
      ],
      probability: 1,
    };
  }

  it('traduce efectos diferidos {target, value} al shape de PendingEffect (budget)', () => {
    const state = validState({ pendingEffects: [], historicalPopularity: [55], historicalBudget: [500] });
    const event = eventWithDelayed([
      { type: 'delayed', target: 'budget', value: -100, turnsUntil: 2 },
    ]);

    const updated = applyEventChoice(state, event, 'opcion_a');

    expect(updated.pendingEffects).toHaveLength(1);
    const pending = updated.pendingEffects[0] as any;
    expect(pending.budgetChange).toBe(-100);
    // turno global de validState: (2-1)*4 + 1 = 5 → activación en 7
    expect(pending.activationTurn).toBe(7);
  });

  it('traduce efectos diferidos sobre grupos a groupEffects', () => {
    const state = validState({ pendingEffects: [], historicalPopularity: [55], historicalBudget: [500], groupRelations: { sindicatos: 55 } });
    const event = eventWithDelayed([
      { type: 'delayed', target: 'sindicatos', value: 10, turnsUntil: 1 },
    ]);

    const updated = applyEventChoice(state, event, 'opcion_a');

    const pending = updated.pendingEffects[0] as any;
    expect(pending.groupEffects).toEqual([{ groupId: 'sindicatos', supportChange: 10 }]);
    // El estado original no se muta (bug: groupRelations se escribía sobre el original)
    expect(state.pendingEffects).toHaveLength(0);
  });

  it('traduce efectos diferidos de popularidad y estabilidad', () => {
    const state = validState({ pendingEffects: [], historicalPopularity: [55], historicalBudget: [500] });
    const event = eventWithDelayed([
      { type: 'delayed', target: 'popularity', value: -5, turnsUntil: 1 },
      { type: 'delayed', target: 'stability', value: 3, turnsUntil: 1 },
    ]);

    const updated = applyEventChoice(state, event, 'opcion_a');

    expect(updated.pendingEffects).toHaveLength(2);
    expect((updated.pendingEffects[0] as any).popularityChange).toBe(-5);
    expect((updated.pendingEffects[1] as any).stabilityChange).toBe(3);
  });
});


describe('resolveRandomEvents — cooldown por evento (Punto 1b)', () => {
  it('un evento triggered no se re-dispara dentro de su cooldown (loop infinito)', () => {
    const state = validState({
      completedActions: ['lucha_narcotrafico', 'seguridad_ciudadana'],
      lastEventFiredTurns: {},
    });

    // Primera resolución: dispara el escándalo (cooldown 99, condiciones dadas)
    const first = resolveRandomEvents(state);
    expect(first.filter(e => e.id === 'police_violence_scandal')).toHaveLength(1);
    expect(state.lastEventFiredTurns?.['police_violence_scandal']).toBeDefined();

    // Antes del fix: se volvía a disparar cada turno mientras las condiciones
    // siguieran cumpliéndose. Con el fix, el cooldown lo bloquea.
    const second = resolveRandomEvents(state);
    expect(second.filter(e => e.id === 'police_violence_scandal')).toHaveLength(0);
  });

  it('sin registro previo de disparo, el cooldown no bloquea', () => {
    const state = validState({
      completedActions: ['lucha_narcotrafico', 'seguridad_ciudadana'],
      lastEventFiredTurns: {},
    });

    const fired = resolveRandomEvents(state);
    expect(fired.filter(e => e.id === 'police_violence_scandal')).toHaveLength(1);
  });
});
