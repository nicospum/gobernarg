import type {
  GameState,
  GameAction,
  Position,
  TurnSummary,
  TurnLogEntry,
} from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { calculateActionEffects, processPendingEffects, getDefaultCooldown } from '../utils/actionEffects';
import { applyCrossGroupEffects } from '../utils/crossGroupEffects';
import { MIDTERM_STRATEGY_EFFECTS } from '../data/midtermStrategies';
import { getDifficultyModifiers } from './difficultyEngine';
import { calculateLegitimacyChange } from './legitimacyEngine';
import { applyAxisShift } from './axisEngine';
import { generateGroupAgendas, updateGroupMoods, applyGroupSatisfactionPenalty, resolvePendingNegotiations } from './groupAgendaEngine';
import { applyArchetypePassives } from './archetypeEngine';
import { getAvailableElectionOptions } from '../utils/electionSystem';
import { updateObjectives, checkAllDefeatConditions } from '../utils/victoryConditions';
import { addNotification, clampValue, recalcState, POSITION_INCOME, POSITION_MAINTENANCE, DEFEAT_POP_THRESHOLD } from './engineShared';
import { findActionById } from './actionEngine';
import { processCalendarEvents, resolveLegislativeConsequences, resolveRandomEvents, applyImmediateEventEffects } from './eventResolver';
import { finalizePresidentialCareer } from './electionEngine';
import { generateTurnIntro } from './narrativeEngine';

// ===========================
// Notificaciones de advertencia
// ===========================

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

// ===========================
// Verificación de derrota
// ===========================

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

// ===========================
// Verificación de elecciones
// ===========================

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

// ===========================
// Recompensas de objetivos
// ===========================

function applyObjectiveRewards(state: GameState): void {
  state.objectives.forEach(obj => {
    if (obj.completed && !state.completedObjectives.some(co => co.id === obj.id)) {
      state.completedObjectives.push(obj);
      if (obj.reward.popularity) state.popularity = Math.min(100, state.popularity + obj.reward.popularity);
      if (obj.reward.budget) state.budget += obj.reward.budget;
    }
  });
}

// ===========================
// Fase 2: Cooldowns e inflación
// ===========================

function updateActionCooldowns(state: GameState): GameState {
  const updated: Record<string, number> = {};
  for (const [actionId, turns] of Object.entries(state.actionCooldowns)) {
    if (turns > 1) {
      updated[actionId] = turns - 1;
    }
  }
  return { ...state, actionCooldowns: updated };
}

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

// ===========================
// Procesar fin de turno
// ===========================

export function processEndTurn(gameState: GameState): import('./engineShared').TurnResult {
  let state: GameState = {
    ...gameState,
    groupRelations: { ...gameState.groupRelations },
    groupAgendas: gameState.groupAgendas.map(a => ({ ...a })),
    groupMoods: gameState.groupMoods.map(m => ({ ...m })),
  };
  const events: string[] = [];
  const narrative = generateTurnIntro(state);

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
      triggeredEvents: [],
      narrative
    };
  }

  // 0. Procesar eventos de calendario político
  state = processCalendarEvents(state);

  // 0.5. Aplicar consecuencias post-legislativas
  state = resolveLegislativeConsequences(state);

  // 0.6. Aplicar pasivas de arquetipo
  state = applyArchetypePassives(state);

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
  let effectiveIncome = Math.round(baseIncome * debtMultiplier);

  // Sprint 2: Aplicar modificadores de ingreso por efectos diferidos activos
  const activeIncomeMods = state.pendingEffects
    .filter(pe => pe.activationTurn >= state.turn && pe.incomeModifier)
    .reduce((sum, pe) => sum + (pe.incomeModifier ?? 0), 0);
  if (activeIncomeMods > 0) {
    effectiveIncome = Math.round(effectiveIncome * (1 + activeIncomeMods));
  }

  // Aplicar bonus de income por pasiva de arquetipo
  const archetypeIncomeMultiplier = 1 + (state._archetypeIncomeBonus ?? 0);
  effectiveIncome = Math.round(effectiveIncome * archetypeIncomeMultiplier);

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
    intendente: 3,
    gobernador: 5,
    presidente: 6
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
  state = resolvePendingNegotiations(state);
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

  return { state, summary, triggeredEvents, narrative };
}
