import type { ElectionResults, GameState } from '../types/game';
import { processElectionResultsForOption } from '../utils/electionSystem';
import { ElectionOption, getNextPosition, PROMOTION_DIFFICULTY } from '../data/careerRules';
import { getPositionObjectives, checkVictoryConditions, updateObjectives } from '../utils/victoryConditions';
import { PARAMS } from '../data/causal';
import { recalcState, POSITION_STARTING_BUDGET } from './engineShared';
import { paForTurn, presidentialVote, syncLegacy } from './causalBridge';

function recordElectionOutcome(
  state: GameState,
  option: ElectionOption,
  votesPercentage: number,
  victory: boolean
): GameState {
  const lastIndex = state.careerHistory.length - 1;
  const lastMilestone = state.careerHistory[lastIndex];
  if (lastMilestone && lastMilestone.position === state.position && lastMilestone.term === state.term) {
    // 'promotion' si hubo ascenso de cargo, 'initial' solo para el primer
    // milestone de la carrera, 'reelection' en el resto.
    const isPromotion = getNextPosition(option, state.position) !== state.position;
    const milestoneType = isPromotion ? 'promotion' : lastIndex === 0 ? 'initial' : 'reelection';
    state.careerHistory = state.careerHistory.map((m, i) =>
      i === lastIndex
        ? {
            ...m,
            endYear: state.year,
            result: victory ? 'victory' : 'defeat',
            type: milestoneType,
            votesPercentage,
          }
        : m
    );
  }
  return state;
}

/**
 * Resultado electoral con el motor causal: IV (aprobación de actores +
 * estructura + imagen) más la ventaja/desventaja de la opción (reelección +5
 * por incumbencia). Umbral de victoria: 45%.
 */
function causalElectionResults(state: GameState, option: ElectionOption, kind: 'reelection' | 'succession'): ElectionResults {
  const { votes, breakdown } = presidentialVote(state.causal, 'succession');
  const bonus = kind === 'reelection' ? PROMOTION_DIFFICULTY[option] : 0;
  const votesPercentage = Math.min(100, Math.max(0, votes + bonus));
  return {
    votesPercentage,
    victory: votesPercentage >= PARAMS.VOTOS_PARA_GANAR,
    details: {
      popularityImpact: breakdown.apro,
      budgetImpact: 0,
      groupsSupport: breakdown.estructura,
      completedObjectivesImpact: 0,
      stabilityBonus: state.causal.political.gob,
    },
    causal: { ...breakdown, incumbencia: bonus },
    kind,
  };
}

export function resolvePendingElection(gameState: GameState, option: ElectionOption): GameState {
  // Anti doble-clic: si no hay elección pendiente (o ya fue resuelta), no-op.
  if (!gameState.pendingElection || gameState.electionResults) return gameState;

  let state: GameState = {
    ...gameState,
    careerHistory: gameState.careerHistory.map(m => ({ ...m })),
  };
  if (state.causal) state.causal = structuredClone(state.causal);
  const results = state.causal
    ? causalElectionResults(state, option, 'reelection')
    : processElectionResultsForOption(state, option);
  state.electionResults = results;
  state.votingIntention = results.votesPercentage;
  state.pendingElection = false;
  state.pendingElectionOptions = [];

  state = recordElectionOutcome(state, option, results.votesPercentage, results.victory);

  if (!results.victory) {
    state.gameOver = true;
    state.victorious = false;
    state.defeatReason = 'election_loss';
    return state.causal ? state : recalcState(state);
  }

  // MODO CAMPAÑA (RESERVADO POST-MVP): ascensos de cargo.
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

  state.careerHistory.push({
    position: state.position,
    term: state.term,
    startYear: 1,
    endYear: 1,
    result: 'victory',
    type: isPromotion ? 'promotion' : 'reelection',
    votesPercentage: 0
  });

  // Nuevo mandato: el calendario (año/trimestre) vuelve a empezar.
  state.year = 1;
  state.turn = 1;
  state.pendingEffects = [];
  state.interactionHistory = {};
  state.concessionsThisTerm = 0;
  state.interactionCountByGroup = {};
  state.lastRandomEventTurn = 0;
  state.randomEventsThisTerm = 0;
  state.lastEventFiredTurns = {};
  state.advisorActionUsed = false;
  state.consecutiveLowPopularity = 0;
  state.consecutiveNegativeBudget = 0;
  state.groupAgendas = [];
  state.midtermStrategy = null;
  state.pendingMidtermStrategy = false;
  state.availableMidtermStrategies = [];
  state.audazTurnsCount = 0;
  state.abilityCooldowns = {};
  state.impeachmentConsecutiveTurns = 0;
  state.coupConsecutiveTurns = 0;
  state.completedActions = [];

  if (state.causal) {
    // Decisión de diseño (usuario): PAÍS CONTINUO. No se reinician indicadores,
    // deuda, caja, relaciones, asesores ni efectos diferidos: el segundo
    // mandato hereda las consecuencias del primero. Empieza una nueva luna de
    // miel legislativa y se reinician las legislativas del nuevo mandato.
    state.causal.mandateStart = state.causal.turn;
    state.legislativeResults = null;
    state.baseActions = paForTurn(state.causal);
    state.actions = state.baseActions;
    return syncLegacy(state);
  }

  // Estado legacy (modo campaña sin motor causal).
  state.legislativeResults = null;
  state.legislativeSupport = null;
  state.popularity = Math.round(state.popularity * 0.7 + 30);
  state.budget = POSITION_STARTING_BUDGET[state.position] + Math.round(state.budget * 0.1);
  state.objectives = getPositionObjectives(state.position);
  state.advisors = [];
  state.moneyPrintingCount = 0;
  state.groupMoods = [];
  state.actionUsageCount = {};
  state.actionCooldowns = {};
  state.debtCount = 0;
  state.debtServiceRatio = 0;
  state.completedObjectives = [];
  state.historicalBudget = [state.budget];
  return recalcState(state);
}

/**
 * Fin del segundo mandato (sin reelección posible): elección de SUCESIÓN.
 * Victoria final si el espacio político del presidente retiene el gobierno
 * (IV ≥ 45, sin ventaja de incumbencia). Decisión del usuario.
 */
export function finalizePresidentialCareer(gameState: GameState): GameState {
  let state = { ...gameState };
  if (state.causal) {
    state.causal = structuredClone(state.causal);
    state = updateObjectives(state);
    const results = causalElectionResults(state, 'reelection', 'succession');
    state = recordElectionOutcome(state, 'reelection', results.votesPercentage, true);
    state.electionResults = results;
    state.gameOver = true;
    state.victorious = results.victory;
    state.defeatReason = results.victory ? null : 'election_loss';
    return syncLegacy(state);
  }
  // Estado legacy: victoria por objetivos (modo anterior).
  state = recordElectionOutcome(state, 'reelection', state.votingIntention, true);
  state.gameOver = true;
  state = updateObjectives(state);
  state.victorious = checkVictoryConditions(state);
  return state;
}
