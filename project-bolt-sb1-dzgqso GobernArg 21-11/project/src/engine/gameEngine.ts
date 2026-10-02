import type { GameState, Archetype } from '../types/game';
import { STARTING_POSITION } from '../data/careerRules';
import { CAUSAL_ACTIONS_BY_ID, PARAMS, type ActorId } from '../data/causal';
import { getPresidentialGoals } from '../utils/victoryConditions';
import { applyArchetypePassives } from './archetypeEngine';
import { meet, negotiate, poll, signAgreement, type InteractionResult } from './causal';
import { newCausalForGame, paForTurn, syncLegacy } from './causalBridge';
export type { TurnResult } from './engineShared';

export {
  filterAvailableMidtermStrategies,
  triggerMidtermStrategy,
} from './engineShared';

export {
  toggleActionSelection,
  getPolicyAvailability,
} from './actionEngine';

export {
  processCalendarEvents,
  resolveLegislativeConsequences,
  resolveRandomEvents,
  checkEventConditions,
  applyImmediateEventEffects,
  applyEventChoice,
} from './eventResolver';

export {
  resolvePendingElection,
  finalizePresidentialCareer,
  retireFromReelection,
} from './electionEngine';

export { processEndTurn } from './turnProcessor';

// ===========================
// Creación de partida
// ===========================

/**
 * Estado base pre-partida (antes de elegir arquetipo). Determinístico: el
 * motor causal se crea con semilla fija; createNewGame crea el definitivo.
 */
export function getInitialGameState(): GameState {
  const causal = newCausalForGame('politico', 1);
  // Sin perks de arquetipo en el estado base: createNewGame los aplica una vez.
  causal.perks = { ...causal.perks, structureMult: 1, freeMeetingActors: [] };

  const state: GameState = {
    position: STARTING_POSITION,
    archetype: 'politico',
    avatar: '',
    term: 1,
    careerHistory: [],
    popularity: 50,
    budget: PARAMS.CAJA_INICIAL,
    turn: 1,
    year: 1,
    actions: PARAMS.ACCIONES_POR_TURNO,
    baseActions: PARAMS.ACCIONES_POR_TURNO,
    selectedActions: [],
    governorName: '',
    objectives: [],
    gameOver: false,
    victorious: false,
    votingIntention: 50,
    electionResults: null,
    pendingElection: false,
    legislativeResults: null,
    legislativeSupport: null,
    historicalPopularity: [],
    completedActions: [],
    groupRelations: {},
    stability: 50,
    notifications: [],
    legitimacy: 50,
    midtermStrategy: null,
    pendingMidtermStrategy: false,
    availableMidtermStrategies: [],
    lastRandomEventTurn: 0,
    lastEventFiredTurns: {},
    randomEventsThisTerm: 0,
    radicalConciliadorAxis: 0,
    populistaTecnicoAxis: 0,
    cerradoConvocanteAxis: 0,
    defeatReason: null,
    causal,
    lastInteractionMessage: null,
  };

  // Las pasivas NO se aplican acá: createNewGame las aplica una única vez.
  const synced = syncLegacy(state);
  synced.historicalPopularity = [synced.popularity];
  return synced;
}

export interface NewGameOptions {
  archetype: Archetype;
  governorName: string;
  avatar?: string;
  seed?: number;
  scenarioId?: string;
}

export function createNewGame({ archetype, governorName, avatar = '', seed, scenarioId }: NewGameOptions): GameState {
  const base = getInitialGameState();
  const causal = newCausalForGame(archetype, seed, scenarioId);

  let state: GameState = {
    ...base,
    archetype,
    avatar,
    careerHistory: [
      { position: STARTING_POSITION, term: 1, startYear: 1, endYear: 1, result: 'victory', type: 'initial', votesPercentage: 50 },
    ],
    governorName,
    objectives: getPresidentialGoals(),
    causal,
  };

  // Pasivas de arquetipo (perfil de ejes narrativo).
  state = applyArchetypePassives(state);
  state = syncLegacy(state);
  state.historicalPopularity = [state.popularity];
  state.baseActions = paForTurn(state.causal);
  state.actions = state.baseActions;
  return state;
}

// ===========================
// Actores: reunión, negociación, acuerdo, encuesta (motor causal)
// ===========================

export type ActorInteraction = 'reunion' | 'negociar' | 'acuerdo' | 'encuesta';

/**
 * Interacciones con actores (08_REUNIONES). La reunión es la primera puerta:
 * revela preocupaciones y demandas y habilita negociar; el acuerdo compromete.
 */
export function interactWithActor(state: GameState, actor: ActorId, kind: ActorInteraction): GameState {
  if (state.gameOver || state.pendingElection) return state;
  let result: InteractionResult;
  switch (kind) {
    case 'reunion': result = meet(state.causal, actor, state.actions); break;
    case 'negociar': result = negotiate(state.causal, actor, state.actions); break;
    case 'acuerdo': result = signAgreement(state.causal, actor); break;
    case 'encuesta': result = poll(state.causal, actor); break;
  }
  if (!result.ok) return { ...state, lastInteractionMessage: result.message };
  return syncLegacy({
    ...state,
    causal: result.state,
    actions: state.actions - result.paSpent,
    lastInteractionMessage: result.message,
  });
}

export function markAllNotificationsRead(gameState: GameState): GameState {
  return {
    ...gameState,
    notifications: gameState.notifications.map(n => ({ ...n, read: true }))
  };
}

export function dismissNotification(gameState: GameState, notificationId: string): GameState {
  return {
    ...gameState,
    notifications: gameState.notifications.filter(n => n.id !== notificationId)
  };
}

/** Nombre legible de una acción del catálogo causal. */
export function actionName(actionId: string): string {
  return CAUSAL_ACTIONS_BY_ID[actionId]?.name ?? actionId;
}
