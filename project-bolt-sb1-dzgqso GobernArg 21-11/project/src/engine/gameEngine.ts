import type {
  GameState,
  Archetype,
  Advisor,
  AdvisorWithStatus,
} from '../types/game';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';
import { STARTING_POSITION } from '../data/careerRules';
import { ADVISOR_ROLES } from '../data/advisors';
import { CAUSAL_ACTIONS_BY_ID, PARAMS, type ActorId } from '../data/causal';
import { getPresidentialGoals } from '../utils/victoryConditions';
import { applyArchetypePassives } from './archetypeEngine';
import { meet, negotiate, poll, signAgreement, type InteractionResult } from './causal';
import {
  applyCausalEffects,
  newCausalForGame,
  paForTurn,
  refreshPerks,
  syncLegacy,
} from './causalBridge';
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
  const causal = newCausalForGame('politico', undefined, 1);
  // Sin perks de arquetipo en el estado base: createNewGame los aplica una vez.
  causal.perks = { ...causal.perks, structureMult: 1, freeMeetingActors: [] };

  const state: GameState = {
    position: STARTING_POSITION,
    archetype: 'politico',
    avatar: '',
    term: 1,
    careerHistory: [],
    turnLog: [],
    popularity: 50,
    budget: PARAMS.CAJA_INICIAL,
    turn: 1,
    year: 1,
    actions: PARAMS.ACCIONES_POR_TURNO,
    baseActions: PARAMS.ACCIONES_POR_TURNO,
    advisors: [],
    selectedActions: [],
    governorName: '',
    advisorActionUsed: false,
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
    abilityCooldowns: {},
    defeatReason: null,
    causal,
    platformId: causal.platformId,
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
  platformId?: string;
  seed?: number;
  scenarioId?: string;
}

export function createNewGame({ archetype, governorName, avatar = '', platformId, seed, scenarioId }: NewGameOptions): GameState {
  const base = getInitialGameState();
  const causal = newCausalForGame(archetype, platformId, seed, scenarioId);

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
    platformId: causal.platformId,
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

// ===========================
// Asesores
// ===========================

/**
 * Contratar asesores: se pagan de la caja, su sueldo pasa a ser gasto
 * corriente y sus roles (eficacia, descuentos, información, negociación)
 * entran como perks del motor causal.
 */
export function hireAdvisors(
  gameState: GameState,
  advisors: Advisor[]
): GameState {
  if (gameState.advisorActionUsed) return gameState;

  // Anti duplicados: ignorar asesores ya contratados.
  const candidates = advisors.filter(
    a => !gameState.advisors.some(existing => existing.id === a.id)
  );

  // Máximo 2 asesores simultáneos.
  const MAX_ADVISORS = 2;
  const slots = Math.max(0, MAX_ADVISORS - gameState.advisors.length);
  const toHire = candidates.slice(0, slots);
  if (toHire.length === 0) return gameState;

  const totalCost = toHire.reduce((sum, a) => sum + a.cost, 0);
  if (gameState.causal.caja < totalCost) return gameState;

  const withStatus: AdvisorWithStatus[] = toHire.map(a => ({
    ...a,
    isActive: true,
    turnsInactive: 0
  }));

  const causal = structuredClone(gameState.causal);
  causal.caja -= totalCost;
  causal.immediateCosts += totalCost;
  let imagen = 0;
  for (const a of toHire) {
    const role = ADVISOR_ROLES[a.id];
    if (!role) continue;
    causal.gastoCorr += role.salary;
    imagen += role.imagenOnHire;
  }
  if (imagen !== 0) applyCausalEffects(causal, [{ target: 'imagen', value: imagen }], 'asesores');

  const next = refreshPerks({
    ...gameState,
    causal,
    advisors: [...gameState.advisors, ...withStatus],
    advisorActionUsed: true,
  });
  return syncLegacy(next);
}

export function dismissAdvisor(
  gameState: GameState,
  advisorId: string
): GameState {
  if (gameState.advisorActionUsed) return gameState;
  const advisor = gameState.advisors.find(a => a.id === advisorId);
  if (!advisor) return gameState;
  const causal = structuredClone(gameState.causal);
  causal.gastoCorr = Math.max(0, causal.gastoCorr - (ADVISOR_ROLES[advisorId]?.salary ?? 0));
  const next = refreshPerks({
    ...gameState,
    causal,
    advisors: gameState.advisors.filter(a => a.id !== advisorId),
    advisorActionUsed: true,
  });
  return syncLegacy(next);
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

// ============================================================
// Habilidades especiales de arquetipo (efectos en el motor causal)
// ============================================================

export function useSpecialAbility(state: GameState, abilityId: string): GameState {
  const abilities = ARCHETYPE_ABILITIES[state.archetype];
  if (!abilities || abilities.length === 0) return state;

  const ability = abilities.find(a => a.id === abilityId);
  if (!ability) return state;

  const cd = state.abilityCooldowns[ability.id] ?? 0;
  if (cd > 0) return state;

  const actionCost = ability.cost.actions ?? 0;
  if (state.actions < actionCost) return state;
  if (ability.cost.budget && state.causal.caja < ability.cost.budget) return state;

  const causal = structuredClone(state.causal);
  const effects = [...ability.effects];
  if (ability.cost.budget) effects.push({ target: 'CAJA', value: -ability.cost.budget });
  if (ability.cost.imagen) effects.push({ target: 'imagen', value: -ability.cost.imagen });
  applyCausalEffects(causal, effects, `habilidad:${ability.id}`);

  return syncLegacy({
    ...state,
    causal,
    actions: state.actions - actionCost,
    abilityCooldowns: { ...state.abilityCooldowns, [ability.id]: ability.cooldown },
  });
}

/** Nombre legible de una acción del catálogo causal. */
export function actionName(actionId: string): string {
  return CAUSAL_ACTIONS_BY_ID[actionId]?.name ?? actionId;
}
