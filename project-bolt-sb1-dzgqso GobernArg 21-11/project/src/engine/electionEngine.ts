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
    state.careerHistory = state.careerHistory.map((m, i) =>
      i === lastIndex
        ? {
            ...m,
            endYear: state.year,
            result: victory ? 'victory' : 'defeat',
            type: state.term === 1 ? 'initial' : option === 'reelection' ? 'reelection' : 'promotion',
            votesPercentage,
          }
        : m
    );
  }
  return state;
}

export function resolvePendingElection(gameState: GameState, option: ElectionOption): GameState {
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
  state.scheduledEvents = [];
  state.interactionHistory = {};
  state.concessionsThisTerm = 0;
  state.interactionCountByGroup = {};
  state.lastRandomEventTurn = 0;
  state.randomEventsThisTerm = 0;
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

  return recalcState(state);
}

export function finalizePresidentialCareer(gameState: GameState): GameState {
  let state = { ...gameState };
  state = recordElectionOutcome(state, 'reelection', state.votingIntention, true);
  state.gameOver = true;
  state.victorious = checkVictoryConditions(state);
  return state;
}
