import { describe, it, expect } from 'vitest';
import { processElectionResults } from '../utils/electionSystem';
import type { GameState } from '../types/game';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    position: 'intendente',
    archetype: 'politico',
    popularity: 50,
    budget: 500,
    stability: 50,
    turn: 1,
    year: 1,
    term: 1,
    difficulty: 'normal',
    votingIntention: 45,
    historicalPopularity: [50],
    historicalBudget: [500],
    objectives: [],
    completedObjectives: [],
    groupRelations: {},
    careerHistory: [],
    advisors: [],
    ...overrides,
  } as GameState;
}

describe('processElectionResults', () => {
  it('intención de voto calculada ≥ 45% es victoria con popularidad alta', () => {
    const state = baseState({ votingIntention: 55, popularity: 80, budget: 1000 });
    const result = processElectionResults(state);
    expect(result.victory).toBe(true);
  });

  it('popularidad baja y déficit causan derrota', () => {
    const state = baseState({
      votingIntention: 20,
      popularity: 10,
      budget: 50,
      historicalPopularity: [10, 15, 12, 8],
      historicalBudget: [1000],
      groupRelations: { opositores: 10, aliados: 10 }
    });
    const result = processElectionResults(state);
    expect(result.victory).toBe(false);
  });

  it('intención borderline con popularidad = 60 gana', () => {
    const state = baseState({
      votingIntention: 45,
      popularity: 60,
      budget: 600,
      historicalPopularity: [60, 58, 62, 61],
      historicalBudget: [500],
      groupRelations: { aliados: 50 }
    });
    const result = processElectionResults(state);
    expect(result.victory).toBe(true);
  });
});
