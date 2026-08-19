import type {
  GameState,
  Position,
  Archetype,
  Advisor,
  AdvisorWithStatus,
  InteractionType,
  Difficulty,
} from '../types/game';
import { actionCategories } from '../data/actionCategories';
import { interestGroups } from '../data/interestGroups';
import { GROUP_ANTAGONISTS } from '../data/groupAntagonists';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';
import { calculateInteractionCost, calculateSupportGain, getInteractionCommitment } from '../utils/interactionCosts';
import { getPositionObjectives } from '../utils/victoryConditions';
import { calculateAvailableActions } from '../utils/actionCalculator';
import { applyArchetypePassives } from './archetypeEngine';
import {
  clampValue,
  addNotification,
  getGlobalTurn,
  POSITION_STARTING_BUDGET,
  ARCHETYPE_STARTING_POPULARITY,
} from './engineShared';
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
// Funciones core (no movidas)
// ===========================

export function getInitialGameState(): GameState {
  const groupRelations: Record<string, number> = {};
  interestGroups.forEach(group => {
    group.subgroups.forEach(subgroup => {
      groupRelations[subgroup.id] = subgroup.baseSupport;
    });
  });

  const state: GameState = {
    position: 'presidente',
    archetype: 'politico',
    avatar: '',
    term: 1,
    termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    careerHistory: [],
    turnLog: [],
    popularity: 50,
    popularidadGrupos: 50,
    popularidadPolitica: 50,
    budget: 3500,
    turn: 1,
    year: 1,
    actions: 5,
    baseActions: 5,
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
    historicalPopularity: [50],
    historicalBudget: [3500],
    completedActions: [],
    groupRelations,
    isAdminMode: false,
    stability: 50,
    pendingEffects: [],
    scheduledEvents: [],
    interestGroups,
    unlockedActions: getAllActionIds(),
    notifications: [],
    // Fase 2: Memoria de decisiones
    actionUsageCount: {},
    actionCooldowns: {},
    debtCount: 0,
    debtServiceRatio: 0,
    legitimacy: 60,
    // Fase 3: Estrategia y política
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
    randomEventsThisTerm: 0,
    // Fase 4: Profundidad
    difficulty: 'normal',
    radicalConciliadorAxis: 0,
    populistaTecnicoAxis: 0,
    cerradoConvocanteAxis: 0,
    groupAgendas: [],
    groupMoods: [],
    abilityCooldowns: {},
    impeachmentConsecutiveTurns: 0,
    coupConsecutiveTurns: 0,
    defeatReason: null
  };

  return applyArchetypePassives(state);
}

function getAllActionIds(): string[] {
  return actionCategories.flatMap(category => category.actions.map(action => action.id));
}

function cloneInterestGroups(): typeof interestGroups {
  // structuredClone no funciona con componentes React (símbolos)
  return JSON.parse(JSON.stringify(interestGroups));
}

export function createNewGame(
  position: Position = 'presidente',
  archetype: Archetype,
  governorName: string,
  isAdminMode: boolean,
  avatar: string,
  difficulty: Difficulty = 'normal'
): GameState {
  const base = getInitialGameState();
  const groupRelations: Record<string, number> = {};
  interestGroups.forEach(group => {
    group.subgroups.forEach(subgroup => {
      groupRelations[subgroup.id] = subgroup.baseSupport;
    });
  });

  const state: GameState = {
    ...base,
    position,
    archetype,
    avatar,
    term: 1,
    termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    careerHistory: [
      {
        position,
        term: 1,
        startYear: 1,
        endYear: 1,
        result: 'victory',
        type: 'initial',
        votesPercentage: 50
      }
    ],
    turnLog: [],
    governorName,
    isAdminMode,
    popularity: ARCHETYPE_STARTING_POPULARITY[archetype],
    budget: POSITION_STARTING_BUDGET[position] + (archetype === 'empresario' ? 500 : 0),
    pendingElection: false,
    pendingElectionOptions: [],
    objectives: getPositionObjectives(position),
    groupRelations,
    interestGroups: cloneInterestGroups(),
    // Fase 4
    difficulty,
    groupMoods: (interestGroups ?? []).flatMap(g =>
      g.subgroups.map(sg => ({
        groupId: sg.id,
        mood: 'neutral' as const,
        ignoredTurns: 0,
        lastSatisfiedTurn: 0,
      }))
    )
  };

  state.historicalPopularity = [state.popularity];
  state.historicalBudget = [state.budget];
  state.baseActions = calculateAvailableActions({ ...state, actions: 0, selectedActions: [] });
  state.actions = state.baseActions;

  return state;
}

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

  // Regla de diseño: concesiones limitadas a 4 por mandato
  if (type === 'conceder' && gameState.concessionsThisTerm >= 4) {
    return gameState;
  }

  // Regla de diseño: concesión requiere trabajo previo con el grupo
  // (al menos 1 reunión o 1 negociación en el mandato actual)
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

  // Preparar mutaciones de estado
  const newDemandPausedUntil = { ...gameState.demandPausedUntil };
  const newNegotiationPending = { ...gameState.negotiationPending };
  const newTemporarySupportBonuses = { ...gameState.temporarySupportBonuses };
  const newGroupRelations = { ...gameState.groupRelations };

  // Aplicar el compromiso según el tipo de interacción
  if (commitment.temporarySupport) {
    // reunirse: bono temporal de apoyo + multiplicador en acciones del grupo
    newTemporarySupportBonuses[subgroupId] = {
      bonus: commitment.temporarySupport.bonus,
      expiresAt: getGlobalTurn(gameState) + commitment.temporarySupport.duration,
      actionMultiplier: commitment.temporarySupport.actionMultiplier,
    };
  }

  if (commitment.demandPending) {
    // negociar: el grupo genera una demanda concreta en N turnos
    const [minDelay, maxDelay] = commitment.demandPending.turnsRange;
    const resolveTurn =
      getGlobalTurn(gameState) + minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));
    newNegotiationPending[subgroupId] = resolveTurn;
  }

  if (commitment.demandPause) {
    // conceder: el grupo no genera demandas por N turnos
    newDemandPausedUntil[subgroupId] = getGlobalTurn(gameState) + commitment.demandPause;
  }

  // Aplicar ganancia de apoyo al grupo objetivo
  newGroupRelations[subgroupId] = Math.min(
    100,
    Math.max(0, (newGroupRelations[subgroupId] || 0) + supportGain)
  );

  // Costo cruzado: conceder genera rechazo en otros grupos
  if (type === 'conceder') {
    const crossPenalty = Math.max(2, Math.round(subgroup.influence * 0.5));
    for (const [otherId, relation] of Object.entries(newGroupRelations)) {
      if (otherId === subgroupId) continue;
      newGroupRelations[otherId] = Math.max(0, relation - crossPenalty);
    }
  }

  // Actualizar contadores de interacción
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

export function hireAdvisors(
  gameState: GameState,
  advisors: Advisor[]
): GameState {
  if (gameState.advisorActionUsed) return gameState;
  const totalCost = advisors.reduce((sum, a) => sum + a.cost, 0);
  if (gameState.budget < totalCost) return gameState;

  const withStatus: AdvisorWithStatus[] = advisors.map(a => ({
    ...a,
    isActive: true,
    turnsInactive: 0
  }));

  return {
    ...gameState,
    advisors: [...gameState.advisors, ...withStatus],
    budget: gameState.budget - totalCost,
    advisorActionUsed: true
  };
}

export function dismissAdvisor(
  gameState: GameState,
  advisorId: string
): GameState {
  if (gameState.advisorActionUsed) return gameState;
  return {
    ...gameState,
    advisors: gameState.advisors.filter(a => a.id !== advisorId),
    advisorActionUsed: true
  };
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
// Fase 4: Habilidad especial de arquetipo
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
  if (ability.cost.budget && state.budget < ability.cost.budget) return state;

  const newState = { ...state };

  if (ability.effects.popularityChange) {
    newState.popularity = clampValue(newState.popularity + ability.effects.popularityChange);
  }
  if (ability.effects.budgetChange) {
    newState.budget += ability.effects.budgetChange;
  }
  if (ability.effects.stabilityChange) {
    newState.stability = clampValue(newState.stability + ability.effects.stabilityChange);
  }
  if (ability.effects.legitimacyChange) {
    newState.legitimacy = clampValue(newState.legitimacy + ability.effects.legitimacyChange);
  }

  ability.effects.groupEffects?.forEach(ge => {
    newState.groupRelations[ge.groupId] = clampValue(
      (newState.groupRelations[ge.groupId] ?? 50) + ge.supportChange
    );
  });

  newState.actions -= actionCost;
  if (ability.cost.budget) newState.budget -= ability.cost.budget;
  if (ability.cost.popularity) {
    newState.popularity = clampValue(newState.popularity + ability.cost.popularity);
  }
  if (ability.cost.legitimacy) {
    newState.legitimacy = clampValue(newState.legitimacy + ability.cost.legitimacy);
  }

  newState.abilityCooldowns = {
    ...newState.abilityCooldowns,
    [ability.id]: ability.cooldown,
  };

  return newState;
}

// ============================================================
// Fase 4: Satisfacer demandas de grupos de interés
// ============================================================

export function satisfyGroupDemand(state: GameState, agendaId: string): GameState {
  const agenda = state.groupAgendas?.find(a => a.id === agendaId);
  if (!agenda || agenda.satisfied) return state;

  // Regla de economía de acciones: satisfacer una demanda consume 1 acción
  if (state.actions <= 0) return state;

  let newState = { ...state, actions: state.actions - 1 };

  // Marcar como satisfecha
  newState.groupAgendas = (state.groupAgendas || []).map(a =>
    a.id === agendaId ? { ...a, satisfied: true } : a
  );

  // +5 apoyo al grupo (antes +10)
  const supportGain = 5;
  if (agenda.groupId in (newState.groupRelations || {})) {
    newState.groupRelations = {
      ...state.groupRelations,
      [agenda.groupId]: clampValue((state.groupRelations?.[agenda.groupId] ?? 50) + supportGain),
    };
  }

  // Impacto cruzado obligatorio: los antagonistas del grupo satisfecho pierden apoyo
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

  // Resetear mood del grupo
  newState.groupMoods = (state.groupMoods || []).map(m =>
    m.groupId === agenda.groupId
      ? { ...m, mood: 'contento' as const, lastSatisfiedTurn: state.turn, ignoredTurns: 0 }
      : m
  );

  // +1 popularidad general (antes +2)
  newState.popularity = clampValue(newState.popularity + 1);

  // Notificación
  newState = addNotification(newState, {
    type: 'success',
    category: 'social',
    title: 'Demanda satisfecha',
    message: `Has respondido a la demanda del grupo: "${agenda.demand}".`,
    importance: 'success',
  });

  return newState;
}
