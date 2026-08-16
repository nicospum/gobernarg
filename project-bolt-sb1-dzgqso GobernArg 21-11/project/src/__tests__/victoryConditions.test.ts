import { describe, it, expect } from 'vitest';
import { checkAllDefeatConditions } from '../utils/victoryConditions';
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
    votingIntention: 50,
    moneyPrintingCount: 0,
    consecutiveLowPopularity: 0,
    consecutiveNegativeBudget: 0,
    impeachmentConsecutiveTurns: 0,
    coupConsecutiveTurns: 0,
    groupRelations: {},
    advisors: [],
    ...overrides,
  } as GameState;
}

describe('checkAllDefeatConditions', () => {
  it('no hay derrota en estado normal', () => {
    const state = baseState();
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(false);
  });

  it('popularidad muy baja por 3 turnos seguidos causa derrota', () => {
    const state = baseState({ popularity: 5, consecutiveLowPopularity: 3 });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('low_popularity');
  });

  it('déficit por 3 turnos consecutivos causa derrota', () => {
    const state = baseState({ budget: -500, consecutiveNegativeBudget: 3 });
    const result = checkAllDefeatConditions(state);
    expect(result.defeated).toBe(true);
    expect(result.reason).toBe('negative_budget');
  });
});
