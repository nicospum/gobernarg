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
import { addNotification, filterAvailableMidtermStrategies, getGlobalTurn, recalcState } from './engineShared';
import { getDifficultyModifiers } from './difficultyEngine';
import { decisionContext, evalCondition, FOREVER } from './causal';
import { applyCausalEffects, legislativeElection, syncLegacy, translateLegacyEffect } from './causalBridge';

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

/**
 * DEPRECADO para partidas con motor causal (ver legislativeElection en
 * causalBridge). Se conserva para estados legacy y sus tests.
 */
export function calculateLegislativeResults(state: GameState): LegislativeResults {
  const recentHistory = state.historicalPopularity.slice(-4);
  const avgPopularity = recentHistory.length > 0
    ? recentHistory.reduce((a, b) => a + b, 0) / recentHistory.length
    : state.popularity;

  const groupScores = Object.values(state.groupRelations);
  const avgGroupSupport = groupScores.length > 0
    ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length
    : 50;

  const objectiveBonus = state.objectives.length > 0
    ? (state.completedObjectives.length / state.objectives.length) * 10
    : 0;

  const stabilityBonus = (state.stability - 50) * 0.1;

  let officialismVotes = 35
    + (avgPopularity - 50) * 0.25
    + (avgGroupSupport - 50) * 0.15
    + objectiveBonus
    + stabilityBonus;

  officialismVotes += (Math.random() - 0.5) * 6;
  officialismVotes = Math.min(58, Math.max(28, officialismVotes));

  const oppositionVotes = Math.min(65, Math.max(30, 100 - officialismVotes + (Math.random() - 0.5) * 4));

  let legislativeSupport = officialismVotes * 1.1;
  legislativeSupport = Math.min(75, Math.max(25, legislativeSupport));

  return {
    officialismVotes: Math.round(officialismVotes * 10) / 10,
    oppositionVotes: Math.round(oppositionVotes * 10) / 10,
    legislativeSupport: Math.round(legislativeSupport * 10) / 10,
    ...legislativeOutcome(officialismVotes),
  };
}

function legislativeOutcome(votes: number): Pick<LegislativeResults, 'outcome' | 'message'> {
  if (votes > 45) return { outcome: 'landslide', message: 'Victoria contundente. Mayoría propia amplia y gran capital político.' };
  if (votes > 42) return { outcome: 'clear', message: 'Victoria clara. Mayoría propia cómoda para gobernar.' };
  if (votes > 37) return { outcome: 'tie', message: 'Empate técnico. Quorum propio pero justo, la oposición presionará.' };
  if (votes > 34) return { outcome: 'minority', message: 'Paridad de tercios. Sin quorum propio, deberás negociar.' };
  return { outcome: 'defeat', message: 'Derrota clara. Congreso hostil y crisis de gobernabilidad.' };
}

/** Imagen del presidente según el resultado de las legislativas. */
const LEGISLATIVE_IMAGE: Record<LegislativeResults['outcome'], number> = {
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
    message: `${message} El oficialismo y sus aliados quedan con ${Math.round(out.newLeg)}% de las bancas.`,
  };
  return syncLegacy({ ...state, causal, legislativeResults: results });
}

export function processCalendarEvents(state: GameState): GameState {
  const event = getCalendarEventForTurn(state.year, state.turn);
  if (!event) return state;

  state = processCalendarEvent(state, event);

  if (event.id === 'elecciones-medio-termino') {
    state = state.causal
      ? runLegislativeElection(state)
      : { ...state, legislativeResults: calculateLegislativeResults(state) };
    const results = state.legislativeResults!;
    state = addNotification(state, {
      type: 'event',
      category: 'political',
      title: `Resultado legislativo: ${results.officialismVotes}%`,
      message: results.message,
      importance: results.outcome === 'defeat' || results.outcome === 'minority' ? 'critical' : 'high'
    });
  }

  if (event.id === 'definicion-estrategia') {
    state.availableMidtermStrategies = filterAvailableMidtermStrategies(state);
    state.pendingMidtermStrategy = true;
    state = addNotification(state, {
      type: 'event',
      category: 'political',
      title: event.title,
      message: event.description,
      importance: 'high'
    });
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
      const prob = baseProb * getDifficultyModifiers(state.difficulty).crisisProbabilityMultiplier;
      if (roll < prob) {
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
 * Condiciones de un evento. Con motor causal, la condición del evento es su
 * `when` sobre indicadores/actores (data/events/causalEvents.ts) y los
 * umbrales viejos de popularidad/estabilidad/presupuesto no se usan.
 */
export function checkEventConditions(event: GameEvent, state: GameState): boolean {
  const cond = event.conditions ?? {};
  const causalDef = EVENT_CAUSAL[event.id];
  const causalMode = !!state.causal && !!causalDef;

  if (causalMode) {
    if (causalDef.when && !evalCondition(causalDef.when, decisionContext(state.causal))) return false;
  } else {
    if (cond.minPopularity !== undefined && state.popularity < cond.minPopularity) return false;
    if (cond.maxPopularity !== undefined && state.popularity > cond.maxPopularity) return false;
    if (cond.minBudget !== undefined && state.budget < cond.minBudget) return false;
    if (cond.maxBudget !== undefined && state.budget > cond.maxBudget) return false;
    if (cond.minStability !== undefined && state.stability < cond.minStability) return false;
    if (cond.maxStability !== undefined && state.stability > cond.maxStability) return false;
    if (cond.minMoneyPrinting !== undefined && state.moneyPrintingCount < cond.minMoneyPrinting) return false;
    if (cond.requiredGroups) {
      for (const groupId of cond.requiredGroups) {
        const support = state.groupRelations[groupId] ?? 0;
        if (support <= 0) return false;
      }
    }
  }

  if (cond.requiredAdvisors) {
    for (const advisorId of cond.requiredAdvisors) {
      const advisor = state.advisors.find(a => a.id === advisorId && a.isActive);
      if (!advisor) return false;
    }
  }

  if (cond.requiredActions) {
    for (const actionId of cond.requiredActions) {
      if (!actionDone(state, actionId)) return false;
    }
  }

  const totalTurns = (state.year - 1) * 4 + state.turn;
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
  if (state.causal) {
    applyCausalEffects(state.causal, eventTriggerEffects(event), `evento:${event.id}`, state.causal.perks.eventResilience);
    return;
  }
  event.effects.immediate.forEach(effect => {
    applyEventEffect(state, effect);
  });
}

export function applyEventChoice(gameState: GameState, event: GameEvent, choiceId: string): GameState {
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) return gameState;

  if (gameState.causal) {
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

  // Estado legacy (sin motor causal).
  const state: GameState = {
    ...gameState,
    groupRelations: { ...gameState.groupRelations },
  };

  choice.effects.immediate.forEach(effect => applyEventEffect(state, effect));

  if (choice.effects.delayed) {
    const pendingEffects = [...state.pendingEffects];
    choice.effects.delayed.forEach(effect => {
      const base = {
        id: `${event.id}_${choiceId}_${state.turn}_${Math.random().toString(36).slice(2, 8)}`,
        activationTurn: getGlobalTurn(state) + ((effect as { turnsUntil?: number }).turnsUntil || 1),
        description: `Efecto diferido de ${event.title}`
      };
      const target = effect.target;
      const value = effect.value ?? 0;
      if (target === 'popularity') {
        pendingEffects.push({ ...base, popularityChange: value });
      } else if (target === 'budget') {
        pendingEffects.push({ ...base, budgetChange: value });
      } else if (target === 'stability') {
        pendingEffects.push({ ...base, stabilityChange: value });
      } else if (target) {
        const groupId = target.startsWith('group_') ? target.slice(6) : target;
        pendingEffects.push({ ...base, groupEffects: [{ groupId, supportChange: value }] });
      }
    });
    state.pendingEffects = pendingEffects;
  }

  return recalcState(state);
}

function applyEventEffect(state: GameState, effect: { target?: string; value?: number }): void {
  if (!effect.target || effect.value === undefined) return;

  let value = effect.value;
  if ((effect.target === 'popularity' || effect.target === 'stability') && value < 0) {
    value = value * (1 - (state._archetypeEventResilience ?? 0));
  }

  if (effect.target === 'popularity') {
    state.popularity = Math.min(100, Math.max(0, state.popularity + value));
  } else if (effect.target === 'budget') {
    state.budget += effect.value;
  } else if (effect.target === 'stability') {
    state.stability = Math.min(100, Math.max(0, state.stability + value));
  } else {
    const groupId = effect.target.startsWith('group_') ? effect.target.slice(6) : effect.target;
    state.groupRelations[groupId] = Math.min(100, Math.max(0,
      (state.groupRelations[groupId] || 0) + effect.value
    ));
  }
}
