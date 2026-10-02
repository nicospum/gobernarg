import { describe, it, expect } from 'vitest';
import { applyEventChoice, checkEventConditions, resolveRandomEvents } from '../engine/eventResolver';
import { getInitialGameState } from '../engine/gameEngine';
import type { GameState } from '../types/game';
import type { GameEvent, EventConditions } from '../systems/events/types';

function syntheticEvent(conditions: EventConditions, id = 'test_event'): GameEvent {
  return {
    id,
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

// turno global = (año - 1) * 4 + turno → year 2, turn 1 = 5
function validState(overrides: Partial<GameState> = {}): GameState {
  const base = getInitialGameState();
  return {
    ...base,
    causal: structuredClone(base.causal),
    turn: 1,
    year: 2,
    completedActions: ['reforma_laboral'],
    ...overrides,
  };
}

const CONDITIONS: EventConditions = {
  requiredActions: ['reforma_laboral'],
  turnRange: { min: 3, max: 10 },
};

describe('checkEventConditions', () => {
  it('condiciones cumplidas → true', () => {
    expect(checkEventConditions(syntheticEvent(CONDITIONS), validState())).toBe(true);
  });

  it('sin condiciones definidas → true', () => {
    expect(checkEventConditions(syntheticEvent({}), validState())).toBe(true);
  });

  it('acción requerida no ejecutada → false', () => {
    expect(checkEventConditions(syntheticEvent(CONDITIONS), validState({ completedActions: [] }))).toBe(false);
  });

  it('turno global fuera del rango → false', () => {
    expect(checkEventConditions(syntheticEvent(CONDITIONS), validState({ year: 1, turn: 2 }))).toBe(false); // 2 < 3
    expect(checkEventConditions(syntheticEvent(CONDITIONS), validState({ year: 3, turn: 3 }))).toBe(false); // 11 > 10
  });

  it('boundary de turno global: en los extremos del rango → true', () => {
    expect(checkEventConditions(syntheticEvent(CONDITIONS), validState({ year: 1, turn: 3 }))).toBe(true); // 3
    expect(checkEventConditions(syntheticEvent(CONDITIONS), validState({ year: 3, turn: 2 }))).toBe(true); // 10
  });

  it('la condición del motor causal (`when`) decide: renuncia de ministro sólo con gobernabilidad baja', () => {
    const event = syntheticEvent({}, 'minister_resignation');
    const low = validState();
    low.causal.political.gob = 20;
    const high = validState();
    high.causal.political.gob = 60;
    expect(checkEventConditions(event, low)).toBe(true);
    expect(checkEventConditions(event, high)).toBe(false);
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
      choices: [{ id: 'opcion_a', text: 'Aceptar', effects: { immediate: [], delayed } }],
      probability: 1,
    };
  }

  it('los efectos diferidos van a la agenda del motor, traducidos', () => {
    const state = validState();
    const event = eventWithDelayed([
      { type: 'delayed', target: 'budget', value: -100, turnsUntil: 2 },
      { type: 'delayed', target: 'popularity', value: -5, turnsUntil: 1 },
    ]);

    const updated = applyEventChoice(state, event, 'opcion_a');
    const added = updated.causal.agenda.filter(e => e.actionId === 'evento:evento_diferido');

    expect(added).toHaveLength(2);
    expect(added[0]).toMatchObject({ target: 'CAJA', magnitude: -100, start: state.causal.turn + 1 });
    expect(added[1]).toMatchObject({ target: 'imagen', magnitude: -2, start: state.causal.turn });
    // El estado original no se muta.
    expect(state.causal.agenda.some(e => e.actionId === 'evento:evento_diferido')).toBe(false);
  });

  it('una opción inexistente no cambia nada', () => {
    const state = validState();
    expect(applyEventChoice(state, eventWithDelayed([]), 'otra')).toBe(state);
  });
});

describe('resolveRandomEvents — cooldown por evento (Punto 1b)', () => {
  function scandalState(): GameState {
    const state = validState({
      completedActions: ['lucha_narcotrafico', 'seguridad_ciudadana'],
      lastEventFiredTurns: {},
    });
    state.causal.base.INST = 30; // condición del escándalo: instituciones < 50
    return state;
  }

  it('un evento triggered no se re-dispara dentro de su cooldown (loop infinito)', () => {
    const state = scandalState();

    const first = resolveRandomEvents(state);
    expect(first.filter(e => e.id === 'police_violence_scandal')).toHaveLength(1);
    expect(state.lastEventFiredTurns?.['police_violence_scandal']).toBeDefined();

    const second = resolveRandomEvents(state);
    expect(second.filter(e => e.id === 'police_violence_scandal')).toHaveLength(0);
  });

  it('sin registro previo de disparo, el cooldown no bloquea', () => {
    const fired = resolveRandomEvents(scandalState());
    expect(fired.filter(e => e.id === 'police_violence_scandal')).toHaveLength(1);
  });
});
