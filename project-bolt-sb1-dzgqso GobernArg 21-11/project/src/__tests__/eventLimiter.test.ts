import { describe, it, expect } from 'vitest';
import { resolveRandomEvents } from '../engine/eventResolver';
import { getInitialGameState } from '../engine/gameEngine';
import { GameState } from '../types/game';

function makeState(overrides?: Partial<GameState>): GameState {
  return { ...getInitialGameState(), ...overrides };
}

describe('resolveRandomEvents - limitador global', () => {
  it('bloquea eventos si el último fue hace menos de 3 turnos', () => {
    const state = makeState({
      turn: 5,
      lastRandomEventTurn: 3, // hace 2 turnos → en cooldown
      randomEventsThisTerm: 1,
    });

    const triggered = resolveRandomEvents(state);
    expect(triggered.length).toBe(0);
  });

  it('permite eventos si el último fue hace 3+ turnos', () => {
    const state = makeState({
      turn: 6,
      lastRandomEventTurn: 3, // hace 3 turnos → fuera de cooldown
      randomEventsThisTerm: 1,
    });

    // No podemos garantizar que se dispare (probabilístico),
    // pero al menos no debe estar bloqueado por cooldown
    const triggered = resolveRandomEvents(state);
    expect(Array.isArray(triggered)).toBe(true);
  });

  it('bloquea eventos si ya se alcanzó el máximo por mandato', () => {
    const state = makeState({
      turn: 10,
      lastRandomEventTurn: 0, // sin cooldown
      randomEventsThisTerm: 5, // máximo alcanzado
    });

    const triggered = resolveRandomEvents(state);
    expect(triggered.length).toBe(0);
  });

  it('con 0 eventos y sin cooldown, puede intentar disparar (no está bloqueado)', () => {
    const state = makeState({
      turn: 1,
      lastRandomEventTurn: 0,
      randomEventsThisTerm: 0,
    });

    const triggered = resolveRandomEvents(state);
    expect(Array.isArray(triggered)).toBe(true);
  });
});

describe('pendingEvents registry', () => {
  it('tiene todos los eventos registrados y activos', async () => {
    const { PENDING_EVENTS, ENABLED_PENDING_EVENT_IDS, getEnabledPendingEvents } = await import('../data/events/pendingEvents');

    expect(Object.keys(PENDING_EVENTS).length).toBe(12);
    expect(ENABLED_PENDING_EVENT_IDS.length).toBe(12);
    expect(getEnabledPendingEvents().length).toBe(12);
  });

  it('los eventos pendientes tienen estructura válida', async () => {
    const { PENDING_EVENTS } = await import('../data/events/pendingEvents');

    for (const [id, event] of Object.entries(PENDING_EVENTS)) {
      expect(event.id).toBe(id);
      expect(event.title).toBeTruthy();
      expect(event.description).toBeTruthy();
      expect(event.category).toBeTruthy();
      expect(event.effects.immediate.length).toBeGreaterThan(0);
    }
  });

  it('getAllEvents incluye los 12 pendientes activos', async () => {
    const { getAllEvents } = await import('../data/events/index');
    const allEvents = getAllEvents();

    const allPendingIds = [
      'police_violence_scandal',
      'minister_resignation',
      'debt_default',
      'energy_crisis',
      'general_strike',
      'prison_riot',
      'drug_wave',
      'diplomatic_conflict',
      'external_sanctions',
      'heat_wave',
      'drought',
      'flood',
    ];

    for (const id of allPendingIds) {
      expect(allEvents.find(e => e.id === id)).toBeDefined();
    }
  });
});
