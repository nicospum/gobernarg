import type {
  GameState,
  Position,
  Archetype,
  Advisor,
  AdvisorWithStatus,
  InteractionType,
  Difficulty,
} from '../types/game';
import { interestGroups } from '../data/interestGroups';
import { GROUP_ANTAGONISTS } from '../data/groupAntagonists';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';
import { STARTING_POSITION } from '../data/careerRules';
import { ADVISOR_ROLES } from '../data/advisors';
import { CAUSAL_ACTIONS_BY_ID, PARAMS, type ActorId } from '../data/causal';
import { calculateInteractionCost, calculateSupportGain, getInteractionCommitment } from '../utils/interactionCosts';
import { getPresidentialGoals } from '../utils/victoryConditions';
import { applyArchetypePassives } from './archetypeEngine';
import { clampValue, addNotification, getGlobalTurn } from './engineShared';
import { meet, negotiate, poll, signAgreement, type InteractionResult } from './causal';
import {
  applyCausalEffects,
  newCausalForGame,
  paForTurn,
  refreshPerks,
  syncLegacy,
} from './causalBridge';
export type { TurnResult } from './engineShared';

// Re-export from engineShared
export {
  filterAvailableMidtermStrategies,
  triggerMidtermStrategy,
} from './engineShared';

// Re-export from actionEngine
export {
  findActionById,
  getAvailableActionsForState,
  toggleActionSelection,
  getPolicyAvailability,
} from './actionEngine';

// Re-export from eventResolver
export {
  processCalendarEvents,
  resolveLegislativeConsequences,
  resolveRandomEvents,
  checkEventConditions,
  applyImmediateEventEffects,
  applyEventChoice,
  calculateLegislativeResults,
} from './eventResolver';

// Re-export from electionEngine
export {
  resolvePendingElection,
  finalizePresidentialCareer,
} from './electionEngine';

// Re-export from turnProcessor
export { processEndTurn } from './turnProcessor';

// ===========================
// Creación de partida
// ===========================

/**
 * Estado base pre-partida (antes de elegir arquetipo). Determinístico: el
 * motor causal se crea con semilla fija; createNewGame crea el definitivo.
 */
export function getInitialGameState(): GameState {
  const groupRelations: Record<string, number> = {};
  interestGroups.forEach(group => {
    group.subgroups.forEach(subgroup => {
      groupRelations[subgroup.id] = subgroup.baseSupport;
    });
  });

  const causal = newCausalForGame('politico', undefined, 1);
  // Sin perks de arquetipo en el estado base: createNewGame los aplica una vez.
  causal.perks = { ...causal.perks, structureMult: 1, freeMeetingActors: [] };

  const state: GameState = {
    // MVP presidente-only: el cargo inicial se lee de STARTING_POSITION
    position: STARTING_POSITION,
    archetype: 'politico',
    avatar: '',
    term: 1,
    termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    careerHistory: [],
    turnLog: [],
    popularity: 50,
    popularidadGrupos: 50,
    popularidadPolitica: 50,
    budget: PARAMS.CAJA_INICIAL,
    turn: 1,
    year: 1,
    actions: PARAMS.ACCIONES_POR_TURNO,
    baseActions: PARAMS.ACCIONES_POR_TURNO,
    advisors: [],
    selectedActions: [],
    moneyPrintingCount: 0,
    governorName: '',
    advisorActionUsed: false,
    interactionHistory: {},
    consecutiveLowPopularity: 0,
    consecutiveNegativeBudget: 0,
    objectives: [],
    completedObjectives: [],
    gameOver: false,
    victorious: false,
    votingIntention: 50,
    electionResults: null,
    pendingElection: false,
    pendingElectionOptions: [],
    legislativeResults: null,
    legislativeSupport: null,
    historicalPopularity: [],
    historicalBudget: [],
    completedActions: [],
    groupRelations,
    isAdminMode: false,
    stability: 50,
    pendingEffects: [],
    interestGroups,
    unlockedActions: [],
    notifications: [],
    actionUsageCount: {},
    actionCooldowns: {},
    debtCount: 0,
    debtServiceRatio: 0,
    legitimacy: 50,
    midtermStrategy: null,
    pendingMidtermStrategy: false,
    availableMidtermStrategies: [],
    audazTurnsCount: 0,
    demandPausedUntil: {},
    negotiationPending: {},
    temporarySupportBonuses: {},
    concessionsThisTerm: 0,
    interactionCountByGroup: {},
    lastRandomEventTurn: 0,
    lastEventFiredTurns: {},
    randomEventsThisTerm: 0,
    difficulty: 'normal',
    radicalConciliadorAxis: 0,
    populistaTecnicoAxis: 0,
    cerradoConvocanteAxis: 0,
    groupAgendas: [],
    groupMoods: [],
    abilityCooldowns: {},
    impeachmentConsecutiveTurns: 0,
    coupConsecutiveTurns: 0,
    defeatReason: null,
    causal,
    platformId: causal.platformId,
    lastInteractionMessage: null,
  };

  // Las pasivas NO se aplican acá: createNewGame las aplica una única vez.
  const synced = syncLegacy(state);
  synced.historicalPopularity = [synced.popularity];
  synced.historicalBudget = [synced.budget];
  return synced;
}

function cloneInterestGroups(): typeof interestGroups {
  // Clonación manual: preserva la referencia de `icon` (componente React).
  return interestGroups.map(group => ({
    ...group,
    subgroups: group.subgroups.map(subgroup => ({
      ...subgroup,
      icon: subgroup.icon,
      interests: [...subgroup.interests],
      demands: [...subgroup.demands],
      demandActionIds: [...subgroup.demandActionIds],
    })),
  }));
}

export function createNewGame(
  // MVP presidente-only: default alineado a STARTING_POSITION (careerRules).
  position: Position = STARTING_POSITION,
  archetype: Archetype,
  governorName: string,
  isAdminMode: boolean,
  avatar: string,
  difficulty: Difficulty = 'normal',
  platformId?: string,
  seed?: number,
): GameState {
  const base = getInitialGameState();
  const causal = newCausalForGame(archetype, platformId, seed);

  let state: GameState = {
    ...base,
    position,
    archetype,
    avatar,
    term: 1,
    termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    careerHistory: [
      { position, term: 1, startYear: 1, endYear: 1, result: 'victory', type: 'initial', votesPercentage: 50 },
    ],
    turnLog: [],
    governorName,
    isAdminMode,
    pendingElection: false,
    pendingElectionOptions: [],
    objectives: getPresidentialGoals(),
    interestGroups: cloneInterestGroups(),
    difficulty,
    causal,
    platformId: causal.platformId,
  };

  // Pasivas de arquetipo (acumuladores legacy + perfil de ejes narrativo).
  state = applyArchetypePassives(state);
  state = syncLegacy(state);
  state.historicalPopularity = [state.popularity];
  state.historicalBudget = [state.budget];
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
// Interacciones legacy (DEPRECADO: reemplazado por interactWithActor)
// Se conserva por compatibilidad con sus tests; la UI ya no lo usa.
// ===========================

export function applyInteraction(
  gameState: GameState,
  subgroupId: string,
  type: InteractionType
): GameState {
  if (gameState.actions <= 0) return gameState;

  const subgroup = interestGroups
    .flatMap(g => g.subgroups)
    .find(sg => sg.id === subgroupId);
  if (!subgroup) return gameState;

  if (type === 'conceder' && gameState.concessionsThisTerm >= 4) {
    return gameState;
  }

  if (type === 'conceder') {
    const prior = gameState.interactionCountByGroup[subgroupId] ?? { reuniones: 0, negociaciones: 0 };
    if (prior.reuniones === 0 && prior.negociaciones === 0) {
      return gameState;
    }
  }

  const budgetCost = calculateInteractionCost(type, subgroup, gameState);
  if (gameState.budget < budgetCost) return gameState;

  const supportGain = calculateSupportGain(type, subgroup, gameState);
  const commitment = getInteractionCommitment(type, subgroup);

  const newDemandPausedUntil = { ...gameState.demandPausedUntil };
  const newNegotiationPending = { ...gameState.negotiationPending };
  const newTemporarySupportBonuses = { ...gameState.temporarySupportBonuses };
  const newGroupRelations = { ...gameState.groupRelations };

  if (commitment.temporarySupport) {
    newTemporarySupportBonuses[subgroupId] = {
      bonus: commitment.temporarySupport.bonus,
      expiresAt: getGlobalTurn(gameState) + commitment.temporarySupport.duration,
      actionMultiplier: commitment.temporarySupport.actionMultiplier,
    };
  }

  if (commitment.demandPending) {
    const [minDelay, maxDelay] = commitment.demandPending.turnsRange;
    const resolveTurn =
      getGlobalTurn(gameState) + minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));
    newNegotiationPending[subgroupId] = resolveTurn;
  }

  if (commitment.demandPause) {
    newDemandPausedUntil[subgroupId] = getGlobalTurn(gameState) + commitment.demandPause;
  }

  newGroupRelations[subgroupId] = Math.min(
    100,
    Math.max(0, (newGroupRelations[subgroupId] || 0) + supportGain)
  );

  if (type === 'conceder') {
    const crossPenalty = Math.max(2, Math.round(subgroup.influence * 0.5));
    for (const [otherId, relation] of Object.entries(newGroupRelations)) {
      if (otherId === subgroupId) continue;
      newGroupRelations[otherId] = Math.max(0, relation - crossPenalty);
    }
  }

  const prevCount = gameState.interactionCountByGroup[subgroupId] ?? { reuniones: 0, negociaciones: 0 };
  const newInteractionCount = { ...gameState.interactionCountByGroup };
  if (type === 'reunion') {
    newInteractionCount[subgroupId] = { ...prevCount, reuniones: prevCount.reuniones + 1 };
  } else if (type === 'negociar') {
    newInteractionCount[subgroupId] = { ...prevCount, negociaciones: prevCount.negociaciones + 1 };
  }

  return {
    ...gameState,
    actions: gameState.actions - 1,
    budget: gameState.budget - budgetCost,
    groupRelations: newGroupRelations,
    interactionHistory: {
      ...gameState.interactionHistory,
      [subgroupId]: {
        lastInteraction: type,
        turnsLeft: 2
      }
    },
    demandPausedUntil: newDemandPausedUntil,
    negotiationPending: newNegotiationPending,
    temporarySupportBonuses: newTemporarySupportBonuses,
    concessionsThisTerm: type === 'conceder' ? gameState.concessionsThisTerm + 1 : gameState.concessionsThisTerm,
    interactionCountByGroup: newInteractionCount,
  };
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

// ============================================================
// Demandas de grupos (DEPRECADO: las demandas ahora las revela la reunión
// y se atienden ejecutando la acción pedida). Se conserva con sus tests.
// ============================================================

export function satisfyGroupDemand(state: GameState, agendaId: string): GameState {
  const agenda = state.groupAgendas?.find(a => a.id === agendaId);
  if (!agenda || agenda.satisfied) return state;

  if (state.actions <= 0) return state;

  let newState = { ...state, actions: state.actions - 1 };

  newState.groupAgendas = (state.groupAgendas || []).map(a =>
    a.id === agendaId ? { ...a, satisfied: true } : a
  );

  const supportGain = 5;
  if (agenda.groupId in (newState.groupRelations || {})) {
    newState.groupRelations = {
      ...state.groupRelations,
      [agenda.groupId]: clampValue((state.groupRelations?.[agenda.groupId] ?? 50) + supportGain),
    };
  }

  const antagonists = GROUP_ANTAGONISTS[agenda.groupId] ?? {};
  for (const [antagonistId, ratio] of Object.entries(antagonists)) {
    const penalty = Math.round(supportGain * ratio);
    if (penalty <= 0) continue;
    const current = newState.groupRelations[antagonistId] ?? 50;
    newState.groupRelations = {
      ...newState.groupRelations,
      [antagonistId]: clampValue(current - penalty),
    };
  }

  newState.groupMoods = (state.groupMoods || []).map(m =>
    m.groupId === agenda.groupId
      ? { ...m, mood: 'contento' as const, lastSatisfiedTurn: state.turn, ignoredTurns: 0 }
      : m
  );

  newState.popularity = clampValue(newState.popularity + 1);

  newState = addNotification(newState, {
    type: 'success',
    category: 'social',
    title: 'Demanda satisfecha',
    message: `Has respondido a la demanda del grupo: "${agenda.demand}".`,
    importance: 'success',
  });

  return newState;
}

/** Nombre legible de una acción del catálogo causal. */
export function actionName(actionId: string): string {
  return CAUSAL_ACTIONS_BY_ID[actionId]?.name ?? actionId;
}
