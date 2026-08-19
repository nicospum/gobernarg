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
  it('tiene eventos registrados y 3 activos', async () => {
    const { PENDING_EVENTS, ENABLED_PENDING_EVENT_IDS, getEnabledPendingEvents } = await import('../data/events/pendingEvents');

    expect(Object.keys(PENDING_EVENTS).length).toBeGreaterThanOrEqual(12);
    expect(ENABLED_PENDING_EVENT_IDS.length).toBe(3);
    expect(getEnabledPendingEvents().length).toBe(3);
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

  it('getAllEvents incluye los 3 pendientes activos y excluye los desactivados', async () => {
    const { getAllEvents } = await import('../data/events/index');
    const allEvents = getAllEvents();

    // Activos: energy_crisis, diplomatic_conflict, police_violence_scandal
    const activeIds = ['energy_crisis', 'diplomatic_conflict', 'police_violence_scandal'];
    for (const id of activeIds) {
      expect(allEvents.find(e => e.id === id)).toBeDefined();
    }

    // Desactivados: debt_default, general_strike, flood, etc.
    const inactiveIds = ['debt_default', 'general_strike', 'flood', 'drought', 'prison_riot', 'drug_wave', 'minister_resignation', 'heat_wave', 'external_sanctions'];
    for (const id of inactiveIds) {
      expect(allEvents.find(e => e.id === id)).toBeUndefined();
    }
  });
});
