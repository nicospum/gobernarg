import { describe, it, expect } from 'vitest';
import { calculateActionEffects } from '../utils/actionEffects';
import type { GameState, GameAction } from '../types/game';

function makeAction(overrides: Partial<GameAction> = {}): GameAction {
  return {
    id: 'test_action',
    title: 'Test Action',
    description: 'Una acción de prueba',
    icon: {} as any,
    category: 'economia',
    popularityChange: 10,
    budgetChange: -100,
    requirements: { minBudget: 0 },
    ...overrides,
  };
}

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    position: 'intendente',
    archetype: 'politico',
    popularity: 50,
    budget: 500,
    stability: 50,
    turn: 1,
    year: 1,
    advisors: [],
    actionUsageCount: {},
    actionCooldowns: {},
    pendingEffects: [],
    interestGroups: [],
    groupRelations: {},
    unlockedActions: ['test_action'],
    completedActions: [],
    midtermStrategy: null,
    ...overrides,
  } as GameState;
}

describe('calculateActionEffects', () => {
  it('calcula efectos básicos para una acción de economía', () => {
    const action = makeAction({ category: 'economia', popularityChange: 10, budgetChange: -100 });
    const state = baseState({ archetype: 'politico' });

    const result = calculateActionEffects(action, state);

    expect(result.immediateEffects.budgetChange).toBeLessThan(0);
    expect(result.immediateEffects.popularityChange).toBeGreaterThan(0);
    // 10 * 1.0 archetype * 1.0 advisor * 0.40 factor * 1.0 diminishing
    expect(result.immediateEffects.popularityChange).toBeCloseTo(4, 0);
  });

  it('aplica multiplicador de arquetipo empresario para economía', () => {
    const action = makeAction({ category: 'economia', popularityChange: 10, budgetChange: -100 });
    const state = baseState({ archetype: 'empresario' });

    const result = calculateActionEffects(action, state);

    // empresario: economía × 1.3
    expect(result.immediateEffects.popularityChange).toBeCloseTo(10 * 1.3 * 0.40, 0);
  });

  it('aplica rendimiento decreciente tras usos repetidos', () => {
    const action = makeAction({
      category: 'economia',
      popularityChange: 10,
      budgetChange: -100,
      diminishingFactor: 0.80
    });
    const state = baseState({
      actionUsageCount: { test_action: 3 },
    });

    const result = calculateActionEffects(action, state);

    // diminishing: 0.80^3 = 0.512
    const expectedPopularity = 10 * 1.0 * 0.40 * 0.512;
    expect(result.immediateEffects.popularityChange).toBeCloseTo(expectedPopularity, 1);
  });

  it('invierte popularidad positiva cuando se usa 5+ veces', () => {
    const action = makeAction({
      category: 'social',
      popularityChange: 5,
      budgetChange: -50,
      diminishingFactor: 0.80
    });
    const state = baseState({
      archetype: 'sindicalista',
      actionUsageCount: { test_action: 5 },
    });

    const result = calculateActionEffects(action, state);

    // popularidad se vuelve negativa
    expect(result.immediateEffects.popularityChange).toBeLessThan(0);
  });
});
