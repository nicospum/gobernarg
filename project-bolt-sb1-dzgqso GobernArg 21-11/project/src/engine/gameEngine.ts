import type {
  GameState,
  GameAction,
  Position,
  Archetype,
  Advisor,
  AdvisorWithStatus,
  TurnSummary,
  InteractionType,
  LegislativeResults,
  CalendarEvent,
  Notification,
  ActionCategory,
  Difficulty,
  MidtermStrategy
} from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { actionCategories } from '../data/actionCategories';
import { interestGroups } from '../data/interestGroups';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';
import { getAllEvents } from '../data/events';
import { getCalendarEventForTurn } from '../data/calendar';
import { oppositionEvents, overconfidenceEvents } from '../data/events/legislativeConsequences';
import { calculateAvailableActions } from '../utils/actionCalculator';
import { calculateActionEffects, processPendingEffects, getDefaultCooldown } from '../utils/actionEffects';
import { calculatePopularidad } from '../utils/popularidad';
import { updateObjectives, getPositionObjectives, checkDefeatConditions, checkAllDefeatConditions } from '../utils/victoryConditions';
import { calculateInteractionCost, calculateSupportGain } from '../utils/interactionCosts';
import { applyCrossGroupEffects } from '../utils/crossGroupEffects';
import { MIDTERM_STRATEGY_EFFECTS } from '../data/midtermStrategies';
import { getDifficultyModifiers } from './difficultyEngine';
import { calculateLegitimacyChange } from './legitimacyEngine';
import { applyAxisShift } from './axisEngine';
import { generateGroupAgendas, updateGroupMoods, applyGroupSatisfactionPenalty } from './groupAgendaEngine';
import {
  processElectionResults,
  processElectionResultsForOption,
  getAvailableElectionOptions
} from '../utils/electionSystem';
import { MAX_TERMS, ElectionOption, getNextPosition } from '../data/careerRules';

// Constantes de balance
const POSITION_INCOME: Record<Position, number> = {
  intendente: 200,
  gobernador: 350,
  presidente: 500
};

const POSITION_MAINTENANCE: Record<Position, number> = {
  intendente: 120,
  gobernador: 200,
  presidente: 350
};

const POSITION_STARTING_BUDGET: Record<Position, number> = {
  intendente: 800,
  gobernador: 2000,
  presidente: 3500
};

const ARCHETYPE_STARTING_POPULARITY: Record<Archetype, number> = {
  politico: 50,
  empresario: 50,
  sindicalista: 50,
  comunicador: 70
};

// Acciones no disponibles según cargo
const POSITION_ACTION_EXCLUSIONS: Record<Position, string[]> = {
  intendente: ['tratado_comercio', 'cooperacion_internacional', 'participacion_cumbres', 'mediacion_conflictos'],
  gobernador: ['participacion_cumbres', 'mediacion_conflictos'],
  presidente: []
};

export function getInitialGameState(): GameState {
  const groupRelations: Record<string, number> = {};
  interestGroups.forEach(group => {
    group.subgroups.forEach(subgroup => {
      groupRelations[subgroup.id] = subgroup.baseSupport;
    });
  });

  return {
    position: 'intendente',
    archetype: 'politico',
    avatar: '',
    term: 1,
    termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    careerHistory: [],
    turnLog: [],
    popularity: 50,
    popularidadGrupos: 50,
    popularidadPolitica: 50,
    budget: 1000,
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
    historicalBudget: [1000],
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
}

function getAllActionIds(): string[] {
  return actionCategories.flatMap(category => category.actions.map(action => action.id));
}

function cloneInterestGroups(): typeof interestGroups {
  // structuredClone no funciona con componentes React (símbolos)
  return JSON.parse(JSON.stringify(interestGroups));
}

export function createNewGame(
  position: Position,
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

export function findActionById(actionId: string): GameAction | undefined {
  return actionCategories.flatMap(category => category.actions).find(action => action.id === actionId);
}

const REFORM_CATEGORIES: ActionCategory[] = ['economia', 'infraestructura'];

function isReformAction(action: GameAction): boolean {
  return REFORM_CATEGORIES.includes(action.category) || Math.abs(action.budgetChange) >= 200;
}

function getLegislativePenalty(legislativeSupport: number | null): number {
  if (legislativeSupport === null) return 0;
  if (legislativeSupport >= 45) return -1; // mayoría aplastante: reformas más baratas
  if (legislativeSupport >= 38) return 0;  // quorum propio: costo normal
  if (legislativeSupport >= 35) return 1;  // paridad de tercios: +1 acción
  return 2;                                 // derrota: +2 acciones
}

export function getAvailableActionsForState(gameState: GameState): GameAction[] {
  const excluded = POSITION_ACTION_EXCLUSIONS[gameState.position] || [];
  const penalty = getLegislativePenalty(gameState.legislativeSupport);

  return actionCategories
    .flatMap(category => category.actions)
    .filter(action => {
      if (excluded.includes(action.id)) return false;
      // Fase 1: filtrar por cargo
      if (action.availableForPositions && !action.availableForPositions.includes(gameState.position)) return false;
      // Fase 2: filtrar por cooldown
      if ((gameState.actionCooldowns[action.id] || 0) > 0) return false;
      // Fase 3: filtrar por prerequisites
      if (action.prerequisites) {
        if (action.prerequisites.requiredActions) {
          const allDone = action.prerequisites.requiredActions.every(
            reqId => gameState.completedActions.includes(reqId)
          );
          if (!allDone) return false;
        }
        if (action.prerequisites.minLegislativeSupport !== undefined) {
          if ((gameState.legislativeSupport ?? 0) < action.prerequisites.minLegislativeSupport) return false;
        }
        if (action.prerequisites.minLegitimacy !== undefined) {
          if ((gameState.legitimacy ?? 50) < action.prerequisites.minLegitimacy) return false;
        }
        if (action.prerequisites.minGroupSupport) {
          const meets = Object.entries(action.prerequisites.minGroupSupport).every(
            ([groupId, min]) => (gameState.groupRelations[groupId] || 0) >= min
          );
          if (!meets) return false;
        }
      }
      if (gameState.budget < action.requirements.minBudget) return false;
      if (action.requirements.minPopularity && gameState.popularity < action.requirements.minPopularity) return false;
      return true;
    })
    .map(action => {
      const reform = isReformAction(action);
      const baseCost = 1;
      const actionCost = reform
        ? Math.max(1, baseCost + penalty)
        : baseCost;

      return {
        ...action,
        isReform: reform,
        actionCost
      };
    });
}

export function toggleActionSelection(gameState: GameState, actionId: string): GameState {
  const action = findActionById(actionId);
  const availableAction = action ? getAvailableActionsForState(gameState).find(a => a.id === actionId) : undefined;
  const actionCost = availableAction?.actionCost ?? 1;

  const isSelected = gameState.selectedActions.includes(actionId);
  if (isSelected) {
    return {
      ...gameState,
      selectedActions: gameState.selectedActions.filter(id => id !== actionId),
      actions: gameState.actions + actionCost
    };
  }
  if (gameState.actions < actionCost) return gameState;
  return {
    ...gameState,
    selectedActions: [...gameState.selectedActions, actionId],
    actions: gameState.actions - actionCost
  };
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

  const cost = calculateInteractionCost(type, subgroup.influence);
  if (gameState.budget < cost) return gameState;

  const supportGain = calculateSupportGain(type, subgroup.influence);

  return {
    ...gameState,
    actions: gameState.actions - 1,
    budget: gameState.budget - cost,
    groupRelations: {
      ...gameState.groupRelations,
      [subgroupId]: Math.min(100, Math.max(0, (gameState.groupRelations[subgroupId] || 0) + supportGain))
    },
    interactionHistory: {
      ...gameState.interactionHistory,
      [subgroupId]: {
        lastInteraction: type,
        turnsLeft: 2
      }
    }
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

export interface TurnResult {
  state: GameState;
  summary: TurnSummary;
  triggeredEvents: GameEvent[];
}

// ===========================
// Calendario político
// ===========================

function addNotification(
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

function addWarningNotifications(state: GameState): GameState {
  if (state.popularity < 20) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Popularidad crítica',
      message: 'Tu popularidad está muy baja. Tres turnos consecutivos así y podrías perder el gobierno.',
      importance: 'critical'
    });
  }

  if (state.budget < 0) {
    state = addNotification(state, {
      type: 'warning',
      category: 'economy',
      title: 'Déficit fiscal',
      message: 'El presupuesto está en negativo. Si se prolonga, perderás estabilidad y legitimidad.',
      importance: 'critical'
    });
  }

  if (state.stability < 25) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Inestabilidad política',
      message: 'La estabilidad del país es muy baja. Eventos negativos serán más frecuentes.',
      importance: 'high'
    });
  }

  if (state.moneyPrintingCount >= 3) {
    state = addNotification(state, {
      type: 'warning',
      category: 'economy',
      title: 'Riesgo inflacionario',
      message: 'Has emitido dinero varias veces. La inflación puede descontrolarse.',
      importance: 'high'
    });
  }

  // Ejes contradictorios extremos
  if (state.radicalConciliadorAxis <= -80) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Gobierno radicalizado',
      message: 'Tus políticas se inclinan fuertemente hacia posiciones radicales. Los sectores moderados se están distanciando.',
      importance: 'high'
    });
  } else if (state.radicalConciliadorAxis >= 80) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Conciliación excesiva',
      message: 'Tu gobierno es extremadamente conciliador. Los sectores que esperan firmeza están perdiendo la paciencia.',
      importance: 'high'
    });
  }

  if (state.populistaTecnicoAxis <= -80) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Populismo extremo',
      message: 'Tus decisiones son puramente populares pero carecen de sustento técnico. Los mercados y organismos internacionales lo notan.',
      importance: 'high'
    });
  } else if (state.populistaTecnicoAxis >= 80) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Tecnocracia distante',
      message: 'Tu enfoque puramente técnico te está alejando de las demandas populares y la calle.',
      importance: 'medium'
    });
  }

  if (state.cerradoConvocanteAxis <= -80) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Aislamiento político',
      message: 'Tu gestión cerrada genera descontento en todos los sectores. Convocá al diálogo antes de que sea tarde.',
      importance: 'high'
    });
  } else if (state.cerradoConvocanteAxis >= 80) {
    state = addNotification(state, {
      type: 'warning',
      category: 'political',
      title: 'Apertura total',
      message: 'Tu extrema apertura al diálogo puede ser percibida como falta de rumbo. Definí una posición clara.',
      importance: 'medium'
    });
  }

  return state;
}

function addEventNotifications(state: GameState, triggeredEvents: GameEvent[]): GameState {
  triggeredEvents.forEach(event => {
    state = addNotification(state, {
      type: event.type === 'crisis' ? 'crisis' : 'event',
      category: event.category === 'political' ? 'political' : 'system',
      title: event.title,
      message: event.description,
      importance: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : 'medium'
    });
  });
  return state;
}

export function processEndTurn(gameState: GameState): TurnResult {
  let state: GameState = { ...gameState };
  const events: string[] = [];

  // Bloquear avance si hay estrategia midterm pendiente
  if (state.pendingMidtermStrategy) {
    return {
      state,
      summary: {
        year: state.year,
        quarter: state.turn,
        events: ['Definición de estrategia post-legislativa pendiente.'],
        popularityChange: 0,
        budgetChange: 0,
        inflationEvent: { triggered: false, count: state.moneyPrintingCount },
        immediateEffects: { popularityChange: 0, budgetChange: 0 }
      },
      triggeredEvents: []
    };
  }

  // 0. Procesar eventos de calendario político
  state = processCalendarEvents(state);

  // 0.5. Aplicar consecuencias post-legislativas
  state = resolveLegislativeConsequences(state);

  // 1. Aplicar efectos de acciones seleccionadas
  let totalPopularityChange = 0;
  let totalBudgetChange = 0;

  state.selectedActions.forEach(actionId => {
    const action = findActionById(actionId);
    if (!action) return;

    const effect = calculateActionEffects(action, state);
    totalPopularityChange += effect.immediateEffects.popularityChange;
    totalBudgetChange += effect.immediateEffects.budgetChange;

    state.budget += effect.immediateEffects.budgetChange;
    state.popularity += effect.immediateEffects.popularityChange;

    // Fase 2: Aplicar efectos multidimensionales
    state.stability = clampValue(state.stability + effect.immediateEffects.stabilityChange);
    state.legitimacy = clampValue(state.legitimacy + effect.immediateEffects.legitimacyChange);
    state.votingIntention = clampValue(state.votingIntention + effect.immediateEffects.votingIntentionChange);

    effect.immediateEffects.groupEffects.forEach(ge => {
      state.groupRelations[ge.groupId] = Math.min(100, Math.max(0,
        (state.groupRelations[ge.groupId] || 0) + ge.supportChange
      ));
    });

    effect.pendingEffects.forEach(pe => {
      state.pendingEffects.push({
        ...pe,
        id: `${action.id}_${state.turn}_${Math.random().toString(36).slice(2, 8)}`
      });
    });

    if (!state.completedActions.includes(actionId)) {
      state.completedActions.push(actionId);
    }

    if (actionId === 'emitir_dinero') {
      state.moneyPrintingCount += 1;
    }

    // Fase 2: Tracking de uso, cooldowns y deuda
    state.actionUsageCount[actionId] = (state.actionUsageCount[actionId] || 0) + 1;
    const cooldown = action.cooldown ?? getDefaultCooldown(action);
    state.actionCooldowns[actionId] = cooldown;
    if (action.isLoan) {
      state.debtCount = Math.min(3, (state.debtCount || 0) + 1);
      state.debtServiceRatio = state.debtCount * 0.10;
    }
    // Fase 4: Aplicar legitimidad y ejes contradictorios
    const legitChange = calculateLegitimacyChange(action, state);
    state.legitimacy = clampValue(state.legitimacy + legitChange);
    state = applyAxisShift(action, state);
  });

  // 1.5. Fase 3: Aplicar impactos cruzados entre grupos antagónicos
  const groupChanges: Record<string, number> = {};
  state.selectedActions.forEach(actionId => {
    const action = findActionById(actionId);
    if (!action) return;
    const effect = calculateActionEffects(action, state);
    effect.immediateEffects.groupEffects.forEach(ge => {
      groupChanges[ge.groupId] = (groupChanges[ge.groupId] || 0) + ge.supportChange;
    });
  });
  if (Object.keys(groupChanges).length > 0) {
    state = applyCrossGroupEffects(state, groupChanges);
  }

  // 2. Procesar efectos pendientes que activan este turno
  state = processPendingEffects(state);

  // 3. Ingreso base por cargo y gastos fijos de gobierno (con servicio de deuda Fase 2)
  const baseIncome = POSITION_INCOME[state.position];
  const maintenance = POSITION_MAINTENANCE[state.position];
  const debtMultiplier = 1 - (state.debtServiceRatio || 0);
  const effectiveIncome = Math.round(baseIncome * debtMultiplier);
  const netIncome = effectiveIncome - maintenance;
  state.budget += netIncome;
  totalBudgetChange += netIncome;
  const debtNote = state.debtServiceRatio > 0 ? ` (servicio de deuda: -${Math.round(state.debtServiceRatio * 100)}%)` : '';
  events.push(`Ingresos fiscales: +$${effectiveIncome}M • Gastos de gobierno: -$${maintenance}M${debtNote}`);

  // 3.5. Fase 3: Aplicar efectos pasivos de la estrategia post-legislativa
  if (state.midtermStrategy && state.year >= 3) {
    const strategyEffect = MIDTERM_STRATEGY_EFFECTS[state.midtermStrategy];
    state.stability = clampValue(state.stability + strategyEffect.stabilityPerTurn);
    state.popularity = clampValue(state.popularity + strategyEffect.popularityPerTurn);
    if (state.midtermStrategy === 'jugada_audaz') {
      state.audazTurnsCount = (state.audazTurnsCount ?? 0) + 1;
      if (state.audazTurnsCount >= 2) {
        state.midtermStrategy = 'negociar';
        state.audazTurnsCount = 0;
        state = addNotification(state, {
          type: 'warning',
          category: 'political',
          title: 'Fin de la Jugada Audaz',
          message: 'Los efectos de tu movida arriesgada se agotaron. Ahora deberás negociar.',
          importance: 'high'
        });
      }
    }
    if (state.midtermStrategy === 'abrirse') {
      state.groupRelations['aliados'] = Math.max(0, (state.groupRelations['aliados'] || 70) - 2);
    }
  }

  // 4. Desgaste natural de popularidad (inercia política, por cargo)
  const POPULARITY_DECAY: Record<Position, number> = {
    intendente: 5,
    gobernador: 7,
    presidente: 10
  };
  const naturalDecay = POPULARITY_DECAY[state.position] ?? 5;
  // Fase 4: Modificador de dificultad
  const difficultyMods = getDifficultyModifiers(state.difficulty);
  const adjustedDecay = naturalDecay * difficultyMods.popularityDecayMultiplier;
  state.popularity = Math.max(0, state.popularity - adjustedDecay);
  totalPopularityChange -= adjustedDecay;

  // 4. Eventos aleatorios y crisis
  const triggeredEvents = resolveRandomEvents(state);
  const eventsWithChoices: GameEvent[] = [];

  triggeredEvents.forEach(event => {
    if (event.choices && event.choices.length > 0) {
      eventsWithChoices.push(event);
    } else {
      applyImmediateEventEffects(state, event);
    }
    events.push(event.title);
  });

  // 4.1 Notificaciones de eventos
  state = addEventNotifications(state, triggeredEvents);

  // 4.2 Preparar datos para el registro histórico del turno
  const actionTitles = state.selectedActions
    .map(id => findActionById(id)?.title ?? id);
  const projectActions = state.selectedActions
    .filter(id => {
      const action = findActionById(id);
      return action && (action.category === 'infraestructura' || id.includes('vivienda') || id.includes('hospital') || id.includes('obra'));
    })
    .map(id => findActionById(id)?.title ?? id);
  const crisisEvents = triggeredEvents
    .filter(e => e.severity === 'high' || e.severity === 'critical')
    .map(e => e.title);

  // 5. Verificar fin de mandato (elección general)
  const isEndOfTerm = state.year === 4 && state.turn === 4;

  if (isEndOfTerm) {
    state.pendingElection = true;
    state.pendingElectionOptions = getAvailableElectionOptions(state);

    // Si es presidente en su último mandato, no hay opción: fin de carrera
    if (state.position === 'presidente' && state.pendingElectionOptions.length === 0) {
      state.pendingElection = false;
      state.pendingElectionOptions = [];
      state = finalizePresidentialCareer(state);
    }
  }

  // 6. Avanzar turno/año solo si no hay elección pendiente
  if (!state.pendingElection) {
    state.turn += 1;
    if (state.turn > 4) {
      state.turn = 1;
      state.year += 1;
    }
  }

  // 7. Actualizar cooldowns de interacciones
  const updatedHistory: GameState['interactionHistory'] = {};
  for (const [key, record] of Object.entries(state.interactionHistory)) {
    if (record.turnsLeft > 1) {
      updatedHistory[key] = { ...record, turnsLeft: record.turnsLeft - 1 };
    }
  }
  state.interactionHistory = updatedHistory;

  // 7.1 Actualizar cooldowns de acciones (Fase 2)
  state = updateActionCooldowns(state);

  // 7.2 Aplicar inflación por emisión monetaria (Fase 2)
  state = processInflation(state);

  // 7.3 Fase 4: Agendas y estados de ánimo de grupos
  state = updateGroupMoods(state);
  const newAgendas = generateGroupAgendas(state);
  state.groupAgendas = [...state.groupAgendas, ...newAgendas];
  state = applyGroupSatisfactionPenalty(state);

  // 7.4 Fase 4: Decrementar cooldowns de habilidades
  const updatedAbilityCooldowns: Record<string, number> = {};
  for (const [id, cd] of Object.entries(state.abilityCooldowns)) {
    if (cd > 1) updatedAbilityCooldowns[id] = cd - 1;
  }
  state.abilityCooldowns = updatedAbilityCooldowns;

  // 8. Recalcular popularidad y acciones
  state = recalcState(state);

  // 9. Verificar derrota
  state = checkDefeat(state);

  // 9.1 Notificaciones de advertencia
  state = addWarningNotifications(state);

  // 9.2 Verificar elecciones de medio término y victoria/derrota general
  state = checkElectionOrVictory(state, events);

  // 10. Actualizar objetivos y recompensas
  const previouslyCompleted = new Set(state.completedObjectives.map(o => o.id));
  state = updateObjectives(state);
  applyObjectiveRewards(state);

  // 10.1 Notificar objetivos recién completados
  state.objectives.forEach(obj => {
    if (obj.completed && !previouslyCompleted.has(obj.id)) {
      state = addNotification(state, {
        type: 'success',
        category: 'political',
        title: 'Objetivo cumplido',
        message: `${obj.title}. ${obj.description}`,
        importance: 'success'
      });
    }
  });

  // Historiales
  state.historicalPopularity.push(state.popularity);
  state.historicalBudget.push(state.budget);

  // Registro detallado del turno
  const turnLogEntry: TurnLogEntry = {
    year: gameState.year,
    turn: gameState.turn,
    position: gameState.position,
    term: gameState.term,
    actionsTaken: actionTitles,
    events: triggeredEvents.map(e => e.title),
    decisions: [], // se completan externamente cuando el jugador elige en eventos
    popularityChange: totalPopularityChange,
    budgetChange: totalBudgetChange,
    projectsCompleted: projectActions,
    crisesFaced: crisisEvents
  };
  state.turnLog.push(turnLogEntry);

  // Resetear selección y flags
  state.selectedActions = [];
  state.advisorActionUsed = false;

  const summary: TurnSummary = {
    year: state.year,
    quarter: state.turn,
    events: events.length > 0 ? events : ['El trimestre transcurrió sin novedades destacadas.'],
    popularityChange: totalPopularityChange,
    budgetChange: totalBudgetChange,
    inflationEvent: {
      triggered: state.moneyPrintingCount >= 3,
      count: state.moneyPrintingCount
    },
    immediateEffects: {
      popularityChange: totalPopularityChange,
      budgetChange: totalBudgetChange
    }
  };

  return { state, summary, triggeredEvents };
}

function recalcState(state: GameState): GameState {
  const { popularidadTotal, popularidadGrupos, popularidadPolitica } = calculatePopularidad(state);
  state.popularity = popularidadTotal;
  state.popularidadGrupos = popularidadGrupos;
  state.popularidadPolitica = popularidadPolitica;

  state.baseActions = calculateAvailableActions({ ...state, actions: 0, selectedActions: [] });
  state.actions = state.baseActions;

  state.votingIntention = calculateVotingIntention(state);
  return state;
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

function checkDefeat(state: GameState): GameState {
  if (state.gameOver) return state;

  let consecutiveLowPopularity = state.consecutiveLowPopularity;
  let consecutiveNegativeBudget = state.consecutiveNegativeBudget;

  const popThreshold = DEFEAT_POP_THRESHOLD[state.position] ?? 20;
  if (state.popularity < popThreshold) {
    consecutiveLowPopularity += 1;
  } else {
    consecutiveLowPopularity = 0;
  }

  if (state.budget < 0) {
    consecutiveNegativeBudget += 1;
  } else {
    consecutiveNegativeBudget = 0;
  }

  state.consecutiveLowPopularity = consecutiveLowPopularity;
  state.consecutiveNegativeBudget = consecutiveNegativeBudget;

  // Fase 4: Tracking de impeachment y golpe
  if (state.popularity < 10 && state.stability < 20) {
    state.impeachmentConsecutiveTurns += 1;
  } else {
    state.impeachmentConsecutiveTurns = 0;
  }
  if (state.stability < 10 && (state.legislativeSupport ?? 100) < 25) {
    state.coupConsecutiveTurns += 1;
  } else {
    state.coupConsecutiveTurns = 0;
  }

  // Fase 4: Verificar todas las vías de derrota
  const defeatResult = checkAllDefeatConditions(state);
  if (defeatResult.defeated) {
    state.gameOver = true;
    state.victorious = false;
    state.defeatReason = defeatResult.reason;
  }

  return state;
}

const DEFEAT_POP_THRESHOLD: Record<Position, number> = {
  intendente: 20,
  gobernador: 25,
  presidente: 30
};

function checkElectionOrVictory(state: GameState, eventsLog: string[]): GameState {
  if (state.gameOver) return state;

  // Elección de medio término: consecuencias legislativas ya se procesan en resolveLegislativeConsequences.
  // Acá solo registramos un mensaje informativo si corresponde.
  if (state.year === 2 && state.turn === 4 && state.legislativeResults === null) {
    // La lógica de medio término se dispara desde resolveLegislativeConsequences en el año 2, turno 4.
    // No se modifica gameOver.
  }

  return state;
}

function applyObjectiveRewards(state: GameState): void {
  state.objectives.forEach(obj => {
    if (obj.completed && !state.completedObjectives.some(co => co.id === obj.id)) {
      state.completedObjectives.push(obj);
      if (obj.reward.popularity) state.popularity = Math.min(100, state.popularity + obj.reward.popularity);
      if (obj.reward.budget) state.budget += obj.reward.budget;
    }
  });
}

function resolveRandomEvents(state: GameState): GameEvent[] {
  const triggered: GameEvent[] = [];
  const allEvents = getAllEvents();

  // Crisis primero
  for (const event of allEvents) {
    if (event.type !== 'crisis') continue;
    if (checkEventConditions(event, state)) {
      const roll = Math.random();
      const prob = event.conditions?.probability ?? event.probability ?? 0;
      if (roll < prob) {
        triggered.push(event);
        break;
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
        break;
      }
    }
  }

  return triggered;
}

function checkEventConditions(event: GameEvent, state: GameState): boolean {
  const cond = event.conditions;
  if (cond.minPopularity !== undefined && state.popularity < cond.minPopularity) return false;
  if (cond.maxPopularity !== undefined && state.popularity > cond.maxPopularity) return false;
  if (cond.minBudget !== undefined && state.budget < cond.minBudget) return false;
  if (cond.maxBudget !== undefined && state.budget > cond.maxBudget) return false;
  if (cond.minStability !== undefined && state.stability < cond.minStability) return false;
  if (cond.maxStability !== undefined && state.stability > cond.maxStability) return false;
  if (cond.minMoneyPrinting !== undefined && state.moneyPrintingCount < cond.minMoneyPrinting) return false;

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
        activationTurn: state.turn + (effect.turnsUntil || 1),
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
  if (effect.target === 'popularity') {
    state.popularity = Math.min(100, Math.max(0, state.popularity + effect.value));
  } else if (effect.target === 'budget') {
    state.budget += effect.value;
  } else if (effect.target === 'stability') {
    state.stability = Math.min(100, Math.max(0, state.stability + effect.value));
  } else if (effect.target.startsWith('group_')) {
    const groupId = effect.target.replace('group_', '');
    state.groupRelations[groupId] = Math.min(100, Math.max(0,
      (state.groupRelations[groupId] || 0) + effect.value
    ));
  }
}

export function resolvePendingElection(gameState: GameState, option: ElectionOption): GameState {
  let state: GameState = { ...gameState };
  const results = processElectionResultsForOption(state, option);
  state.electionResults = results;
  state.votingIntention = results.votesPercentage;
  state.pendingElection = false;
  state.pendingElectionOptions = [];

  // Actualizar el milestone del mandato que termina
  state = recordElectionOutcome(state, option, results.votesPercentage, results.victory);

  if (!results.victory) {
    state.gameOver = true;
    state.victorious = false;
    state.defeatReason = 'election_loss';
    return recalcState(state);
  }

  // Victoria: definir nuevo cargo/mandato
  const previousPosition = state.position;
  const nextPosition = getNextPosition(option, state.position);
  const isPromotion = nextPosition !== previousPosition;

  if (isPromotion) {
    state.position = nextPosition;
    state.term = 1;
  } else {
    state.term += 1;
  }

  state.termsByPosition = {
    ...state.termsByPosition,
    [previousPosition]: (state.termsByPosition[previousPosition] || 0) + 1
  };

  // Crear milestone para el nuevo mandato
  state.careerHistory.push({
    position: state.position,
    term: state.term,
    startYear: 1,
    endYear: 1,
    result: 'victory',
    type: isPromotion ? 'promotion' : 'reelection',
    votesPercentage: 0
  });

  // Reset de mandato
  state.year = 1;
  state.turn = 1;
  state.legislativeResults = null;
  state.legislativeSupport = null;
  state.popularity = Math.round(state.popularity * 0.7 + 30);
  state.budget = POSITION_STARTING_BUDGET[state.position] + Math.round(state.budget * 0.1);
  state.objectives = getPositionObjectives(state.position);
  state.completedActions = [];
  state.pendingEffects = [];
  state.scheduledEvents = [];
  state.interactionHistory = {};
  state.advisors = [];
  state.advisorActionUsed = false;
  state.moneyPrintingCount = 0;
  state.consecutiveLowPopularity = 0;
  state.consecutiveNegativeBudget = 0;

  return recalcState(state);
}

function recordElectionOutcome(
  state: GameState,
  option: ElectionOption,
  votesPercentage: number,
  victory: boolean
): GameState {
  const lastMilestone = state.careerHistory[state.careerHistory.length - 1];
  if (lastMilestone && lastMilestone.position === state.position && lastMilestone.term === state.term) {
    lastMilestone.endYear = state.year;
    lastMilestone.result = victory ? 'victory' : 'defeat';
    lastMilestone.type = state.term === 1 ? 'initial' : option === 'reelection' ? 'reelection' : 'promotion';
    lastMilestone.votesPercentage = votesPercentage;
  }
  return state;
}

export function finalizePresidentialCareer(gameState: GameState): GameState {
  let state = { ...gameState };
  state = recordElectionOutcome(state, 'reelection', state.votingIntention, true);
  state.gameOver = true;
  state.victorious = true;
  return state;
}

// ============================================================
// Fase 2: Funciones nuevas — Memoria de decisiones
// ============================================================

function clampValue(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** Decrementa cooldowns de acciones en 1 cada turno, elimina los que llegan a 0 */
function updateActionCooldowns(state: GameState): GameState {
  const updated: Record<string, number> = {};
  for (const [actionId, turns] of Object.entries(state.actionCooldowns)) {
    if (turns > 1) {
      updated[actionId] = turns - 1;
    }
  }
  return { ...state, actionCooldowns: updated };
}

/** Aplica inflación real por emisión monetaria excesiva */
function processInflation(state: GameState): GameState {
  const count = state.moneyPrintingCount;
  if (count >= 5) {
    // Crisis inflacionaria: -20 popularidad, -300 presupuesto
    state.popularity = Math.max(0, state.popularity - 20);
    state.budget -= 300;
    state = addNotification(state, {
      type: 'crisis',
      category: 'economic',
      title: 'Crisis inflacionaria',
      message: `La emisión descontrolada (${count} emisiones) provocó una crisis de inflación.`,
      importance: 'critical'
    });
  } else if (count >= 3) {
    // Inflación moderada: -5 popularidad/turno, -50 presupuesto/turno
    state.popularity = Math.max(0, state.popularity - 5);
    state.budget -= 50;
    if (count === 3) {
      state = addNotification(state, {
        type: 'warning',
        category: 'economic',
        title: 'Presión inflacionaria',
        message: `La emisión monetaria recurrente (${count} emisiones) está generando inflación.`,
        importance: 'high'
      });
    }
  }
  return state;
}

// ============================================================
// Fase 4: Habilidad especial de arquetipo
// ============================================================

export function useSpecialAbility(state: GameState): GameState {
  const ability = ARCHETYPE_ABILITIES[state.archetype];
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
  const agenda = state.groupAgendas.find(a => a.id === agendaId);
  if (!agenda || agenda.satisfied) return state;

  const newState = { ...state };

  // Marcar como satisfecha
  newState.groupAgendas = state.groupAgendas.map(a =>
    a.id === agendaId ? { ...a, satisfied: true } : a
  );

  // +10 apoyo al grupo
  if (agenda.groupId in newState.groupRelations) {
    newState.groupRelations = {
      ...state.groupRelations,
      [agenda.groupId]: clampValue((state.groupRelations[agenda.groupId] ?? 50) + 10),
    };
  }

  // Resetear mood del grupo
  newState.groupMoods = state.groupMoods.map(m =>
    m.groupId === agenda.groupId
      ? { ...m, mood: 'contento' as const, lastSatisfiedTurn: state.turn, ignoredTurns: 0 }
      : m
  );

  // +2 popularidad general
  newState.popularity = clampValue(newState.popularity + 2);

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

// ============================================================
// Fase 3: Estrategias post-legislativas
// ============================================================

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
