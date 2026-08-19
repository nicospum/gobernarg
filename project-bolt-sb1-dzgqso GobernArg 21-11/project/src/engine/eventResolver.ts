import type {
  GameState,
  LegislativeResults,
  CalendarEvent,
} from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { getAllEvents } from '../data/events';
import { getCalendarEventForTurn } from '../data/calendar';
import { oppositionEvents, overconfidenceEvents } from '../data/events/legislativeConsequences';
import { addNotification, filterAvailableMidtermStrategies, getGlobalTurn, recalcState } from './engineShared';
import { getDifficultyModifiers } from './difficultyEngine';

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

export function calculateLegislativeResults(state: GameState): LegislativeResults {
  // Base: promedio de popularidad en los últimos 4 trimestres
  const recentHistory = state.historicalPopularity.slice(-4);
  const avgPopularity = recentHistory.length > 0
    ? recentHistory.reduce((a, b) => a + b, 0) / recentHistory.length
    : state.popularity;

  // Apoyo grupal promedio
  const groupScores = Object.values(state.groupRelations);
  const avgGroupSupport = groupScores.length > 0
    ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length
    : 50;

  // Objetivos cumplidos
  const objectiveBonus = state.objectives.length > 0
    ? (state.completedObjectives.length / state.objectives.length) * 10
    : 0;

  // Estabilidad
  const stabilityBonus = (state.stability - 50) * 0.1;

  // Cálculo de votos oficialismo (base 35 + factores)
  let officialismVotes = 35
    + (avgPopularity - 50) * 0.25
    + (avgGroupSupport - 50) * 0.15
    + objectiveBonus
    + stabilityBonus;

  // Ruido electoral ±3%
  officialismVotes += (Math.random() - 0.5) * 6;

  // Clamp realista
  officialismVotes = Math.min(58, Math.max(28, officialismVotes));

  // Oposición aproximada (no exacta, modelo simple)
  const oppositionVotes = Math.min(65, Math.max(30, 100 - officialismVotes + (Math.random() - 0.5) * 4));

  // Bancada estimada: asumimos que votos se traducen en bancada con algo de ventaja del oficialismo
  let legislativeSupport = officialismVotes * 1.1;
  legislativeSupport = Math.min(75, Math.max(25, legislativeSupport));

  let outcome: LegislativeResults['outcome'];
  let message: string;

  if (officialismVotes > 45) {
    outcome = 'landslide';
    message = 'Victoria contundente. Mayoría propia amplia y gran capital político.';
  } else if (officialismVotes > 42) {
    outcome = 'clear';
    message = 'Victoria clara. Mayoría propia cómoda para gobernar.';
  } else if (officialismVotes > 37) {
    outcome = 'tie';
    message = 'Empate técnico. Quorum propio pero justo, la oposición presionará.';
  } else if (officialismVotes > 34) {
    outcome = 'minority';
    message = 'Paridad de tercios. Sin quorum propio, deberás negociar.';
  } else {
    outcome = 'defeat';
    message = 'Derrota clara. Congreso hostil y crisis de gobernabilidad.';
  }

  return {
    officialismVotes: Math.round(officialismVotes * 10) / 10,
    oppositionVotes: Math.round(oppositionVotes * 10) / 10,
    legislativeSupport: Math.round(legislativeSupport * 10) / 10,
    outcome,
    message
  };
}

function applyLegislativeOutcome(state: GameState, results: LegislativeResults): GameState {
  state.legislativeResults = results;
  state.legislativeSupport = results.legislativeSupport;

  switch (results.outcome) {
    case 'landslide':
      state.stability = Math.min(100, state.stability + 10);
      break;
    case 'clear':
      state.stability = Math.min(100, state.stability + 5);
      break;
    case 'tie':
      state.stability = Math.max(0, state.stability - 3);
      break;
    case 'minority':
      state.stability = Math.max(0, state.stability - 8);
      break;
    case 'defeat':
      state.stability = Math.max(0, state.stability - 15);
      break;
  }

  return state;
}

export function processCalendarEvents(state: GameState): GameState {
  const event = getCalendarEventForTurn(state.year, state.turn);
  if (!event) return state;

  state = processCalendarEvent(state, event);

  if (event.id === 'elecciones-medio-termino') {
    const results = calculateLegislativeResults(state);
    state = applyLegislativeOutcome(state, results);
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

export function resolveLegislativeConsequences(state: GameState): GameState {
  if (state.legislativeSupport === null) return state;

  const support = state.legislativeSupport;
  const roll = Math.random();

  if (support < 35) {
    // Derrota clara: alta probabilidad de eventos de oposición
    if (roll < 0.45) {
      const event = oppositionEvents[Math.floor(Math.random() * oppositionEvents.length)];
      applyImmediateEventEffects(state, event);
      state = addNotification(state, {
        type: 'crisis',
        category: 'political',
        title: event.title,
        message: event.description,
        importance: 'critical'
      });
    }
  } else if (support < 38) {
    // Paridad de tercios: probabilidad media
    if (roll < 0.25) {
      const event = oppositionEvents[Math.floor(Math.random() * oppositionEvents.length)];
      applyImmediateEventEffects(state, event);
      state = addNotification(state, {
        type: 'warning',
        category: 'political',
        title: event.title,
        message: event.description,
        importance: 'high'
      });
    }
  } else if (support > 45) {
    // Victoria aplastante: riesgo de desgaste por sobreconfianza
    if (roll < 0.25) {
      const event = overconfidenceEvents[Math.floor(Math.random() * overconfidenceEvents.length)];
      applyImmediateEventEffects(state, event);
      state = addNotification(state, {
        type: 'warning',
        category: 'political',
        title: event.title,
        message: event.description,
        importance: 'medium'
      });
    }
  }

  return state;
}

// ===========================
// Eventos aleatorios y crisis
// ===========================

export function resolveRandomEvents(state: GameState): GameEvent[] {
  const triggered: GameEvent[] = [];

  // ============================================================
  // LIMITADOR GLOBAL de eventos aleatorios
  // Cuando un evento aleatorio/crisis se dispara, los demás
  // quedan bloqueados por N turnos para evitar avalanchas.
  // Los eventos contextuales (triggered/scheduled) NO están limitados.
  // ============================================================
  const GLOBAL_COOLDOWN_TURNS = 3;      // turnos sin eventos tras uno disparado
  const MAX_RANDOM_EVENTS_PER_TERM = 5; // máx eventos aleatorios por mandato

  const allEvents = getAllEvents();

  // ============================================================
  // Eventos contextuales (triggered)
  // Probabilidad 1: se disparan si sus condiciones se cumplen.
  // No están limitados por el cooldown global ni por el máximo
  // por mandato (ver nota de diseño arriba).
  // ============================================================
  for (const event of allEvents) {
    if (event.type !== 'triggered') continue;
    if (checkEventConditions(event, state)) {
      triggered.push(event);
    }
  }

  if (state.lastRandomEventTurn > 0 && getGlobalTurn(state) - state.lastRandomEventTurn < GLOBAL_COOLDOWN_TURNS) {
    return triggered; // en cooldown global
  }
  if (state.randomEventsThisTerm >= MAX_RANDOM_EVENTS_PER_TERM) {
    return triggered; // límite por mandato alcanzado
  }

  // Crisis primero
  for (const event of allEvents) {
    if (event.type !== 'crisis') continue;
    if (checkEventConditions(event, state)) {
      const roll = Math.random();
      const baseProb = event.conditions?.probability ?? event.probability ?? 0;
      // Multiplicador de dificultad: modula la probabilidad de las crisis
      const prob = baseProb * getDifficultyModifiers(state.difficulty).crisisProbabilityMultiplier;
      if (roll < prob) {
        triggered.push(event);
        state.lastRandomEventTurn = getGlobalTurn(state);
        state.randomEventsThisTerm += 1;
        return triggered; // solo 1 evento por turno
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
        return triggered; // solo 1 evento por turno
      }
    }
  }

  return triggered;
}

export function checkEventConditions(event: GameEvent, state: GameState): boolean {
  const cond = event.conditions;
  if (cond.minPopularity !== undefined && state.popularity < cond.minPopularity) return false;
  if (cond.maxPopularity !== undefined && state.popularity > cond.maxPopularity) return false;
  if (cond.minBudget !== undefined && state.budget < cond.minBudget) return false;
  if (cond.maxBudget !== undefined && state.budget > cond.maxBudget) return false;
  if (cond.minStability !== undefined && state.stability < cond.minStability) return false;
  if (cond.maxStability !== undefined && state.stability > cond.maxStability) return false;
  if (cond.minMoneyPrinting !== undefined && state.moneyPrintingCount < cond.minMoneyPrinting) return false;

  // Verificar grupos requeridos
  if (cond.requiredGroups) {
    for (const groupId of cond.requiredGroups) {
      const support = state.groupRelations[groupId] ?? 0;
      if (support <= 0) return false;
    }
  }

  // Verificar asesores requeridos
  if (cond.requiredAdvisors) {
    for (const advisorId of cond.requiredAdvisors) {
      const advisor = state.advisors.find(a => a.id === advisorId && a.isActive);
      if (!advisor) return false;
    }
  }

  // Verificar acciones requeridas (deben haberse ejecutado previamente)
  if (cond.requiredActions) {
    for (const actionId of cond.requiredActions) {
      if (!state.completedActions.includes(actionId)) return false;
    }
  }

  const totalTurns = (state.year - 1) * 4 + state.turn;
  if (cond.turnRange && (totalTurns < cond.turnRange.min || totalTurns > cond.turnRange.max)) return false;

  return true;
}

export function applyImmediateEventEffects(state: GameState, event: GameEvent): void {
  event.effects.immediate.forEach(effect => {
    applyEventEffect(state, effect);
  });
}

export function applyEventChoice(gameState: GameState, event: GameEvent, choiceId: string): GameState {
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) return gameState;

  const state: GameState = { ...gameState };

  choice.effects.immediate.forEach(effect => applyEventEffect(state, effect));

  if (choice.effects.delayed) {
    state.pendingEffects = [...state.pendingEffects];
    choice.effects.delayed.forEach(effect => {
      state.pendingEffects.push({
        id: `${event.id}_${choiceId}_${state.turn}_${Math.random().toString(36).slice(2, 8)}`,
        activationTurn: getGlobalTurn(state) + (effect.turnsUntil || 1),
        target: effect.target,
        value: effect.value,
        description: `Efecto diferido de ${event.title}`
      });
    });
  }

  return recalcState(state);
}

function applyEventEffect(state: GameState, effect: { target?: string; value?: number }): void {
  if (!effect.target || effect.value === undefined) return;

  // Resiliencia de arquetipo: reduce los efectos negativos sobre
  // popularidad/estabilidad según _archetypeEventResilience.
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
