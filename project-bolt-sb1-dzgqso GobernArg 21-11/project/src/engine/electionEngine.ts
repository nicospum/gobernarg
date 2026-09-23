import type { GameState } from '../types/game';
import { processElectionResultsForOption } from '../utils/electionSystem';
import { ElectionOption, getNextPosition } from '../data/careerRules';
import { getPositionObjectives, checkVictoryConditions } from '../utils/victoryConditions';
import { recalcState, POSITION_STARTING_BUDGET } from './engineShared';

function recordElectionOutcome(
  state: GameState,
  option: ElectionOption,
  votesPercentage: number,
  victory: boolean
): GameState {
  const lastIndex = state.careerHistory.length - 1;
  const lastMilestone = state.careerHistory[lastIndex];
  if (lastMilestone && lastMilestone.position === state.position && lastMilestone.term === state.term) {
    // FIX (Punto 11): el tipo debe reflejar lo resuelto en la elección. Antes
    // `state.term === 1` pisaba cualquier ascenso en el primer mandato (un
    // intendente que ascendía a gobernador quedaba como 'initial' y el legacy
    // no contaba el salto). Ahora: 'promotion' si hubo ascenso de cargo,
    // 'initial' solo para el primer milestone de la carrera, 'reelection' en
    // el resto (incluido el primer mandato después de un ascenso).
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

export function resolvePendingElection(gameState: GameState, option: ElectionOption): GameState {
  // Anti doble-clic: si no hay elección pendiente (o ya fue resuelta), no-op.
  // Sin esta guarda, un segundo clic aplicaba el reset de mandato dos veces.
  if (!gameState.pendingElection || gameState.electionResults) return gameState;

  let state: GameState = {
    ...gameState,
    careerHistory: gameState.careerHistory.map(m => ({ ...m })),
  };
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
  state.interactionHistory = {};
  state.concessionsThisTerm = 0;
  state.interactionCountByGroup = {};
  state.lastRandomEventTurn = 0;
  state.randomEventsThisTerm = 0;
  // El turno global se reinicia por mandato: los cooldowns por evento también.
  state.lastEventFiredTurns = {};
  state.advisors = [];
  state.advisorActionUsed = false;
  state.moneyPrintingCount = 0;
  state.consecutiveLowPopularity = 0;
  state.consecutiveNegativeBudget = 0;
  // Reset de features del mandato anterior
  state.groupAgendas = [];
  state.groupMoods = [];
  state.actionUsageCount = {};
  state.actionCooldowns = {};
  state.debtCount = 0;
  state.debtServiceRatio = 0;
  state.completedObjectives = [];
  state.midtermStrategy = null;
  state.pendingMidtermStrategy = false;
  state.availableMidtermStrategies = [];
  state.audazTurnsCount = 0;
  state.abilityCooldowns = {};
  state.impeachmentConsecutiveTurns = 0;
  state.coupConsecutiveTurns = 0;
  // Punto 14: el crecimiento presupuestario se mide contra el inicio del
  // mandato actual, no contra el arranque de la carrera (historicalBudget[0]
  // quedaba congelado y distorsionaba el budgetImpact de las elecciones).
  state.historicalBudget = [state.budget];

  return recalcState(state);
}

export function finalizePresidentialCareer(gameState: GameState): GameState {
  let state = { ...gameState };
  state = recordElectionOutcome(state, 'reelection', state.votingIntention, true);
  state.gameOver = true;
  state.victorious = checkVictoryConditions(state);
  return state;
}
