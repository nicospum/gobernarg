import { GameState, ElectionResults, Position } from '../types/game';
import {
  MAX_TERMS,
  PROMOTION_DIFFICULTY,
  PROMOTION_MIN_POPULARITY,
  getOptionLabel,
  getOptionDescription,
  getNextPosition
} from '../data/careerRules';
import type { ElectionOption } from '../data/careerRules';
import { calculatePromotionPenalty } from './ascensionPenalty';

export type { ElectionOption };
export { getOptionLabel, getOptionDescription, getNextPosition };

const ELECTION_CONSTANTS = {
  TURNS_PER_YEAR: 4,
  TOTAL_YEARS: 4,
  TOTAL_TURNS: 16,
  MIN_VOTES_TO_WIN: 45,
  WEIGHTS: {
    POPULARITY: 0.35,
    BUDGET: 0.20,
    GROUPS_SUPPORT: 0.25,
    OBJECTIVES: 0.15,
    STABILITY: 0.05
  }
};

export function isElectionTurn(gameState: GameState): boolean {
  return gameState.turn === ELECTION_CONSTANTS.TURNS_PER_YEAR &&
         gameState.year === ELECTION_CONSTANTS.TOTAL_YEARS;
}

export function isMidTermElectionTurn(gameState: GameState): boolean {
  return gameState.turn === ELECTION_CONSTANTS.TURNS_PER_YEAR &&
         gameState.year === ELECTION_CONSTANTS.TOTAL_YEARS / 2;
}

export function getAvailableElectionOptions(gameState: GameState): ElectionOption[] {
  const options: ElectionOption[] = [];
  const { position, term } = gameState;

  // Reelección si no se alcanzó el máximo de mandatos
  if (term < MAX_TERMS[position]) {
    options.push('reelection');
  }

  // Ascenso a gobernador solo desde intendente
  if (position === 'intendente') {
    options.push('promote-governor');
  }

  // Ascenso a presidente desde gobernador (o intendente con requisitos altos)
  if (position === 'gobernador' || position === 'intendente') {
    options.push('promote-president');
  }

  return options;
}

export function canRunForOption(gameState: GameState, option: ElectionOption): boolean {
  const minPop = PROMOTION_MIN_POPULARITY[option];
  return gameState.popularity >= minPop;
}

export function calculateVotingIntentionForOption(
  gameState: GameState,
  option: ElectionOption
): number {
  const base = calculateVotingIntention(gameState);
  const difficulty = PROMOTION_DIFFICULTY[option];

  // Fase 3: Penalización por ascenso según mandatos completados
  let ascensionMultiplier = 1.0;
  if (option === 'promote-governor' && gameState.position === 'intendente') {
    const completed = gameState.termsByPosition?.['intendente'] || 0;
    ascensionMultiplier = 1 - calculatePromotionPenalty('intendente', 'gobernador', completed);
  } else if (option === 'promote-president' && gameState.position !== 'presidente') {
    const completed = gameState.termsByPosition?.[gameState.position] || 0;
    ascensionMultiplier = 1 - calculatePromotionPenalty(gameState.position, 'presidente', completed);
  }

  const adjusted = (base + difficulty) * ascensionMultiplier;
  return Math.min(100, Math.max(0, adjusted));
}

export function processElectionResultsForOption(
  gameState: GameState,
  option: ElectionOption
): ElectionResults {
  const votesPercentage = calculateVotingIntentionForOption(gameState, option);
  const victory = votesPercentage >= ELECTION_CONSTANTS.MIN_VOTES_TO_WIN;

  return {
    votesPercentage,
    victory,
    details: {
      popularityImpact: calculatePopularityImpact(gameState),
      budgetImpact: calculateBudgetImpact(gameState),
      groupsSupport: calculateGroupsSupport(gameState),
      completedObjectivesImpact: calculateObjectivesImpact(gameState),
      stabilityBonus: calculateStabilityBonus(gameState)
    }
  };
}

export function processElectionResults(gameState: GameState): ElectionResults {
  // Reelección por defecto para compatibilidad con llamadas antiguas
  return processElectionResultsForOption(gameState, 'reelection');
}

export function calculateVotingIntention(gameState: GameState): number {
  const popularityImpact = calculatePopularityImpact(gameState);
  const budgetImpact = calculateBudgetImpact(gameState);
  const groupsSupport = calculateGroupsSupport(gameState);
  const objectivesImpact = calculateObjectivesImpact(gameState);
  const stabilityBonus = calculateStabilityBonus(gameState);

  const votingIntention = (
    (popularityImpact * ELECTION_CONSTANTS.WEIGHTS.POPULARITY) +
    (budgetImpact * ELECTION_CONSTANTS.WEIGHTS.BUDGET) +
    (groupsSupport * ELECTION_CONSTANTS.WEIGHTS.GROUPS_SUPPORT) +
    (objectivesImpact * ELECTION_CONSTANTS.WEIGHTS.OBJECTIVES) +
    (stabilityBonus * ELECTION_CONSTANTS.WEIGHTS.STABILITY)
  );

  return Math.min(100, Math.max(0, votingIntention));
}

function calculatePopularityImpact(gameState: GameState): number {
  const recentPopularity = gameState.historicalPopularity.slice(-4);
  const avgPopularity = recentPopularity.reduce((a, b) => a + b, 0) / recentPopularity.length;
  return avgPopularity;
}

function calculateBudgetImpact(gameState: GameState): number {
  const initialBudget = gameState.historicalBudget[0];
  const currentBudget = gameState.budget;

  if (initialBudget <= 0) return 50;

  const growthRate = ((currentBudget - initialBudget) / initialBudget) * 100;
  return Math.min(100, Math.max(0, 50 + (growthRate / 2)));
}

function calculateGroupsSupport(gameState: GameState): number {
  const groupScores = Object.values(gameState.groupRelations);
  if (groupScores.length === 0) return 50;
  return groupScores.reduce((a, b) => a + b, 0) / groupScores.length;
}

function calculateObjectivesImpact(gameState: GameState): number {
  const totalObjectives = gameState.objectives.length;
  if (totalObjectives === 0) return 0;
  const completedCount = gameState.completedObjectives.length;
  return (completedCount / totalObjectives) * 100;
}

function calculateStabilityBonus(gameState: GameState): number {
  if (gameState.consecutiveLowPopularity > 0 || gameState.consecutiveNegativeBudget > 0) {
    return 0;
  }
  return 100;
}

export function updateGameStateForElections(gameState: GameState): GameState {
  // Función legacy: ahora el flujo de elecciones generales se maneja con pendingElection
  if (!isElectionTurn(gameState)) {
    return gameState;
  }

  const electionResults = processElectionResults(gameState);

  return {
    ...gameState,
    electionResults,
    votingIntention: electionResults.votesPercentage
  };
}
