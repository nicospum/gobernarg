import type {
  GameState,
  Position,
  Archetype,
  TurnSummary,
  Notification,
  MidtermStrategy
} from '../types/game';
import { calculatePopularidad } from '../utils/popularidad';
import { calculateAvailableActions } from '../utils/actionCalculator';
import { interestGroups } from '../data/interestGroups';

// ===========================
// Constantes de balance
// ===========================

export const POSITION_INCOME: Record<Position, number> = {
  intendente: 200,
  gobernador: 350,
  presidente: 500
};

export const POSITION_MAINTENANCE: Record<Position, number> = {
  intendente: 120,
  gobernador: 200,
  presidente: 300
};

export const POSITION_STARTING_BUDGET: Record<Position, number> = {
  intendente: 800,
  gobernador: 2000,
  presidente: 3500
};

export const ARCHETYPE_STARTING_POPULARITY: Record<Archetype, number> = {
  politico: 50,
  empresario: 50,
  sindicalista: 50,
  comunicador: 70
};

// Acciones no disponibles según cargo
export const POSITION_ACTION_EXCLUSIONS: Record<Position, string[]> = {
  intendente: ['tratado_comercio', 'cooperacion_internacional', 'participacion_cumbres', 'mediacion_conflictos'],
  gobernador: ['participacion_cumbres', 'mediacion_conflictos'],
  presidente: []
};

export const DEFEAT_POP_THRESHOLD: Record<Position, number> = {
  intendente: 20,
  gobernador: 25,
  presidente: 30
};

// ===========================
// Interface compartida
// ===========================

export interface TurnResult {
  state: GameState;
  summary: TurnSummary;
  triggeredEvents: any[]; // GameEvent[]
  narrative?: string;
}

// ===========================
// Utilidades compartidas
// ===========================

export function clampValue(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function addNotification(
  state: GameState,
  notification: Omit<Notification, 'id' | 'timestamp'>
): GameState {
  const newNotification: Notification = {
    ...notification,
    id: `${state.year}_${state.turn}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now()
  };
  return {
    ...state,
    notifications: [newNotification, ...state.notifications].slice(0, 50)
  };
}

function calculateVotingIntention(state: GameState): number {
  const groupScores = Object.values(state.groupRelations);
  const avgGroupSupport = groupScores.length > 0
    ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length
    : 50;
  const objectiveFactor = state.objectives.length > 0
    ? (state.completedObjectives.length / state.objectives.length) * 100
    : 0;
  const value = (
    state.popularity * 0.4 +
    state.stability * 0.2 +
    avgGroupSupport * 0.25 +
    objectiveFactor * 0.1 +
    (state.budget > 0 ? 5 : 0)
  );
  return Math.min(100, Math.max(0, value));
}

export function recalcState(state: GameState): GameState {
  const { popularidadTotal, popularidadGrupos, popularidadPolitica } = calculatePopularidad(state);
  state.popularity = popularidadTotal;
  state.popularidadGrupos = popularidadGrupos;
  state.popularidadPolitica = popularidadPolitica;

  state.baseActions = calculateAvailableActions({ ...state, actions: 0, selectedActions: [] });
  state.actions = state.baseActions;

  state.votingIntention = calculateVotingIntention(state);
  return state;
}

// ===========================
// Estrategias post-legislativas (compartidas entre gameEngine y eventResolver)
// ===========================

export function filterAvailableMidtermStrategies(state: GameState): MidtermStrategy[] {
  const available: MidtermStrategy[] = ['negociar'];
  const support = state.legislativeSupport ?? 0;

  if (support > 42) {
    available.push('acelerar');
  }

  const highSupportGroups = Object.values(state.groupRelations).filter(v => v > 50).length;
  if (highSupportGroups >= 3) {
    available.push('abrirse');
  }

  if (state.archetype === 'comunicador' || state.archetype === 'politico' || state.popularity > 65) {
    available.push('jugada_audaz');
  }

  return available;
}

export function triggerMidtermStrategy(state: GameState, strategy: MidtermStrategy): GameState {
  return {
    ...state,
    midtermStrategy: strategy,
    pendingMidtermStrategy: false,
    availableMidtermStrategies: [],
    audazTurnsCount: 0,
  };
}
