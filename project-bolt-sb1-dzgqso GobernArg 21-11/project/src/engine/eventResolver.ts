import type {
  GameState,
  LegislativeResults,
  CalendarEvent,
} from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { getAllEvents } from '../data/events';
import { getCalendarEventForTurn } from '../data/calendar';
import { oppositionEvents, overconfidenceEvents } from '../data/events/legislativeConsequences';
import {
  CHANNEL_DRIVEN_EVENT_IDS,
  CHANNEL_GAME_EVENTS,
  EVENT_CAUSAL,
  type CausalEventEffect,
} from '../data/events/causalEvents';
import { LEGACY_ACTION_TO_NEW } from '../data/causal';
import { addNotification, filterAvailableMidtermStrategies, getGlobalTurn } from './engineShared';
import { decisionContext, evalCondition, FOREVER } from './causal';
import { applyCausalEffects, legislativeElection, syncLegacy, translateLegacyEffect } from './causalBridge';
import { fmtPct } from '../lib/format';

// ===========================
// Calendario político
// ===========================

function processCalendarEvent(state: GameState, event: CalendarEvent): GameState {
  state = addNotification(state, {
    type: event.type === 'election' ? 'event' : 'info',
    category: 'political',
    title: event.title,
    message: event.description,
    importance: event.type === 'election' ? 'high' : 'medium'
  });

  if (event.effect) {
    const effectResult = event.effect(state);
    if (effectResult) {
      state = { ...state, ...effectResult };
    }
  }

  return state;
}

function legislativeOutcome(votes: number): Pick<LegislativeResults, 'outcome' | 'message'> {
  if (votes > 45) return { outcome: 'landslide', message: 'Victoria contundente. Mayoría propia amplia y gran capital político.' };
  if (votes > 42) return { outcome: 'clear', message: 'Victoria clara. Mayoría propia cómoda para gobernar.' };
  if (votes > 37) return { outcome: 'tie', message: 'Empate técnico. Quorum propio pero justo, la oposición presionará.' };
  if (votes > 34) return { outcome: 'minority', message: 'Paridad de tercios. Sin quorum propio, deberás negociar.' };
  return { outcome: 'defeat', message: 'Derrota clara. Congreso hostil y crisis de gobernabilidad.' };
}

/** Imagen del presidente según el resultado de las legislativas. */
export const LEGISLATIVE_IMAGE: Record<LegislativeResults['outcome'], number> = {
  landslide: 3, clear: 1, tie: 0, minority: -2, defeat: -4,
};

/**
 * Legislativas de medio término con el motor causal: los votos del
 * oficialismo son la intención de voto del momento y renuevan la mitad del
 * Congreso (LEG). El resultado mueve la imagen del presidente.
 */
function runLegislativeElection(state: GameState): GameState {
  const causal = structuredClone(state.causal);
  const out = legislativeElection(causal);
  const { outcome, message } = legislativeOutcome(out.votes);
  applyCausalEffects(causal, [{ target: 'imagen', value: LEGISLATIVE_IMAGE[outcome] }], 'legislativas');
  const results: LegislativeResults = {
    officialismVotes: Math.round(out.votes * 10) / 10,
    oppositionVotes: Math.round(Math.max(20, 100 - out.votes - 15) * 10) / 10,
    legislativeSupport: Math.round(out.newLeg * 10) / 10,
    outcome,
    message: `${message} El oficialismo y sus aliados quedan con ${fmtPct(out.newLeg)} de las bancas.`,
  };
  return syncLegacy({ ...state, causal, legislativeResults: results });
}

export function processCalendarEvents(state: GameState): GameState {
  const event = getCalendarEventForTurn(state.year, state.turn);
  if (!event) return state;

  state = processCalendarEvent(state, event);

  if (event.id === 'elecciones-medio-termino') {
    state = runLegislativeElection(state);
    const results = state.legislativeResults!;
    state = addNotification(state, {
      type: 'event',
      category: 'political',
      title: `Resultado legislativo: ${fmtPct(results.officialismVotes, 1)}`,
      message: results.message,
      importance: results.outcome === 'defeat' || results.outcome === 'minority' ? 'critical' : 'high'
    });
    // El resultado y la estrategia para la segunda mitad se ven juntos, en el
    // mismo turno de la elección (antes la estrategia llegaba un turno después).
    state.availableMidtermStrategies = filterAvailableMidtermStrategies(state);
    state.pendingMidtermStrategy = true;
  }

  // Partidas guardadas antes del cambio: si todavía no se eligió, se elige ahora.
  if (event.id === 'definicion-estrategia' && !state.midtermStrategy && !state.pendingMidtermStrategy && state.legislativeResults) {
    state.availableMidtermStrategies = filterAvailableMidtermStrategies(state);
    state.pendingMidtermStrategy = true;
  }

  return state;
}

/**
 * Consecuencias del resultado legislativo (tras las elecciones de medio
 * término): Congreso hostil → oposición activa; mayoría holgada → riesgo de
 * sobreconfianza. Umbrales en la escala de bancas del motor causal.
 */
export function resolveLegislativeConsequences(state: GameState): GameState {
  if (state.legislativeSupport === null || state.legislativeResults === null) return state;

  const support = state.legislativeSupport;
  const roll = Math.random();

  const fire = (pool: GameEvent[], prob: number, type: 'crisis' | 'warning', importance: 'critical' | 'high' | 'medium') => {
    if (roll >= prob) return;
    const event = pool[Math.floor(Math.random() * pool.length)];
    applyImmediateEventEffects(state, event);
    state = addNotification(state, { type, category: 'political', title: event.title, message: event.description, importance });
  };

  if (support < 42) fire(oppositionEvents, 0.45, 'crisis', 'critical');
  else if (support < 46) fire(oppositionEvents, 0.25, 'warning', 'high');
  else if (support > 56) fire(overconfidenceEvents, 0.25, 'warning', 'medium');

  return state;
}

// ===========================
// Eventos aleatorios y crisis
// ===========================

export function resolveRandomEvents(state: GameState): GameEvent[] {
  const triggered: GameEvent[] = [];

  // LIMITADOR GLOBAL de eventos aleatorios.
  const GLOBAL_COOLDOWN_TURNS = 3;
  const MAX_RANDOM_EVENTS_PER_TERM = 5;

  // Los eventos que hoy dispara un canal de poder no participan del sorteo.
  const allEvents = getAllEvents().filter(e => !CHANNEL_DRIVEN_EVENT_IDS.includes(e.id));

  // Eventos contextuales (triggered): se disparan si se cumplen sus condiciones.
  for (const event of allEvents) {
    if (event.type !== 'triggered') continue;
    const lastFired = state.lastEventFiredTurns?.[event.id];
    if (lastFired !== undefined && getGlobalTurn(state) - lastFired < (event.cooldown ?? 0)) {
      continue;
    }
    if (checkEventConditions(event, state)) {
      triggered.push(event);
      if (!state.lastEventFiredTurns) state.lastEventFiredTurns = {};
      state.lastEventFiredTurns[event.id] = getGlobalTurn(state);
    }
  }

  if (state.lastRandomEventTurn > 0 && getGlobalTurn(state) - state.lastRandomEventTurn < GLOBAL_COOLDOWN_TURNS) {
    return triggered;
  }
  if (state.randomEventsThisTerm >= MAX_RANDOM_EVENTS_PER_TERM) {
    return triggered;
  }

  // Crisis primero
  for (const event of allEvents) {
    if (event.type !== 'crisis') continue;
    if (checkEventConditions(event, state)) {
      const roll = Math.random();
      const baseProb = event.conditions?.probability ?? event.probability ?? 0;
      if (roll < baseProb) {
        triggered.push(event);
        state.lastRandomEventTurn = getGlobalTurn(state);
        state.randomEventsThisTerm += 1;
        return triggered;
      }
    }
  }

  // Eventos aleatorios
  for (const event of allEvents) {
    if (event.type !== 'random') continue;
    if (checkEventConditions(event, state)) {
      const roll = Math.random();
      const prob = event.conditions?.probability ?? event.probability ?? 0;
      if (roll < prob) {
        triggered.push(event);
        state.lastRandomEventTurn = getGlobalTurn(state);
        state.randomEventsThisTerm += 1;
        return triggered;
      }
    }
  }

  return triggered;
}

function actionDone(state: GameState, legacyOrNewId: string): boolean {
  if (state.completedActions.includes(legacyOrNewId)) return true;
  const mapped = LEGACY_ACTION_TO_NEW[legacyOrNewId];
  return !!mapped && state.completedActions.includes(mapped);
}

/**
 * Condiciones de un evento: su `when` sobre indicadores/actores
 * (data/events/causalEvents.ts), las acciones requeridas y la ventana de turnos.
 */
export function checkEventConditions(event: GameEvent, state: GameState): boolean {
  const cond = event.conditions ?? {};
  const causalDef = EVENT_CAUSAL[event.id];
  if (causalDef?.when && !evalCondition(causalDef.when, decisionContext(state.causal))) return false;

  if (cond.requiredActions) {
    for (const actionId of cond.requiredActions) {
      if (!actionDone(state, actionId)) return false;
    }
  }

  const totalTurns = getGlobalTurn(state);
  if (cond.turnRange && (totalTurns < cond.turnRange.min || totalTurns > cond.turnRange.max)) return false;

  return true;
}

/** Efectos causales de un evento al dispararse (explícitos o traducidos). */
function eventTriggerEffects(event: GameEvent): CausalEventEffect[] {
  const def = EVENT_CAUSAL[event.id];
  if (def?.effects) return def.effects;
  return event.effects.immediate
    .map(e => translateLegacyEffect(e.target ?? '', e.value ?? 0))
    .filter((e): e is CausalEventEffect => e !== null);
}

/** Efectos causales de una opción de un evento. */
export function eventChoiceEffects(event: GameEvent, choiceId: string): CausalEventEffect[] {
  const channel = CHANNEL_GAME_EVENTS[event.id]?.causal.choices?.[choiceId];
  if (channel) return channel;
  const explicit = EVENT_CAUSAL[event.id]?.choices?.[choiceId];
  if (explicit) return explicit;
  const choice = event.choices?.find(c => c.id === choiceId);
  return (choice?.effects.immediate ?? [])
    .map(e => translateLegacyEffect(e.target ?? '', e.value ?? 0))
    .filter((e): e is CausalEventEffect => e !== null);
}

export function applyImmediateEventEffects(state: GameState, event: GameEvent): void {
  applyCausalEffects(state.causal, eventTriggerEffects(event), `evento:${event.id}`, state.causal.perks.eventResilience);
}

export function applyEventChoice(gameState: GameState, event: GameEvent, choiceId: string): GameState {
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) return gameState;

  const causal = structuredClone(gameState.causal);
  applyCausalEffects(causal, eventChoiceEffects(event, choiceId), `evento:${event.id}`, causal.perks.eventResilience);
  // Efectos diferidos de la opción → agenda del motor.
  for (const [i, effect] of (choice.effects.delayed ?? []).entries()) {
    const translated = translateLegacyEffect(effect.target ?? '', effect.value ?? 0);
    if (!translated) continue;
    const start = causal.turn + ((effect as { turnsUntil?: number }).turnsUntil ?? 1) - 1;
    causal.agenda.push({
      uid: `${event.id}.${choiceId}.${causal.turn}.${i}`,
      effectId: `${event.id}.${choiceId}`,
      actionId: `evento:${event.id}`,
      originTurn: causal.turn,
      target: translated.target,
      mode: 'DELTA',
      magnitude: translated.value,
      start,
      end: Math.min(FOREVER, start),
      everyTurn: false,
      appliedTotal: 0,
      explanation: `Efecto diferido de ${event.title}`,
    });
  }
  return syncLegacy({ ...gameState, causal });
}
