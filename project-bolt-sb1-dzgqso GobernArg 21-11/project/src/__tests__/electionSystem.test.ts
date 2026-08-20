import { describe, it, expect } from 'vitest';
import {
  processElectionResults,
  calculateVotingIntentionForOption,
  getAvailableElectionOptions,
  canRunForOption,
} from '../utils/electionSystem';
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
    turnLog: [],
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

  // Estado con margen amplio (~5 pts por encima del umbral de 45%).
  // El test anterior ganaba por solo 0.0875 pts (intención 45.0875),
  // lo que lo hacía frágil ante cualquier cambio de pesos en
  // calculateVotingIntention. Nota: processElectionResults NO lee
  // state.votingIntention; recalcula todo desde el estado.
  it('popularidad alta (70+) con presupuesto en crecimiento gana con margen claro', () => {
    const state = baseState({
      popularity: 75,
      budget: 600,
      historicalPopularity: [75, 74, 76, 75], // promedio 75
      historicalBudget: [500],
      groupRelations: { aliados: 50 }
    });
    const result = processElectionResults(state);
    expect(result.votesPercentage).toBeGreaterThanOrEqual(45);
    expect(result.victory).toBe(true);
  });
});

// Estado determinista para calculateVotingIntentionForOption:
// popularityImpact 50 (histórico [50]) + budgetImpact 50 (budget sin cambios) +
// groupsSupport 50 (sin grupos) + stability 50 + objectives 0 + activity 0
// → intención base 50*0.35 + 50*0.15 + 50*0.15 + 50*0.05 = 35
function deterministicElectionState(overrides: Partial<GameState> = {}): GameState {
  return baseState({
    popularity: 50,
    budget: 500,
    stability: 50,
    historicalPopularity: [50],
    historicalBudget: [500],
    groupRelations: {},
    objectives: [],
    turnLog: [],
    termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    ...overrides,
  } as GameState);
}

describe('calculateVotingIntentionForOption - penalización de ascenso', () => {
  it('intendente → gobernador: penaliza y la penalización baja con más mandatos (0/1/2)', () => {
    const state0 = deterministicElectionState({ position: 'intendente', termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 } });
    const state1 = deterministicElectionState({ position: 'intendente', termsByPosition: { intendente: 1, gobernador: 0, presidente: 0 } });
    const state2 = deterministicElectionState({ position: 'intendente', termsByPosition: { intendente: 2, gobernador: 0, presidente: 0 } });

    // tabla intendente->gobernador: [0.25, 0.15, 0.08] → (35 - 15) * (1 - penalidad)
    expect(calculateVotingIntentionForOption(state0, 'promote-governor')).toBeCloseTo(15, 5);
    expect(calculateVotingIntentionForOption(state1, 'promote-governor')).toBeCloseTo(17, 5);
    expect(calculateVotingIntentionForOption(state2, 'promote-governor')).toBeCloseTo(18.4, 5);
    expect(calculateVotingIntentionForOption(state2, 'promote-governor'))
      .toBeGreaterThan(calculateVotingIntentionForOption(state0, 'promote-governor'));
  });

  it('la reelección no tiene penalización de ascenso', () => {
    const state = deterministicElectionState({ position: 'intendente' });
    expect(calculateVotingIntentionForOption(state, 'reelection')).toBeCloseTo(40, 5); // 35 + 5
  });

  it('gobernador → presidente usa los mandatos del cargo actual', () => {
    // popularidad 100 e histórico [100] → popularityImpact 100:
    // base = 100*0.35 + 50*0.15 (budget sin cambios) + 50*0.15 (sin grupos) + 50*0.05 (estabilidad) = 52.5
    const rich = (terms: number) => deterministicElectionState({
      position: 'gobernador',
      popularity: 100,
      historicalPopularity: [100],
      termsByPosition: { intendente: 0, gobernador: terms, presidente: 0 },
    });

    // tabla gobernador->presidente: [0.15, 0.12, 0.05] → (52.5 - 40) * (1 - penalidad)
    expect(calculateVotingIntentionForOption(rich(0), 'promote-president')).toBeCloseTo(10.625, 4);
    expect(calculateVotingIntentionForOption(rich(2), 'promote-president')).toBeCloseTo(11.875, 4);
  });
});

describe('getAvailableElectionOptions', () => {
  it('intendente en mandato 1 → 3 opciones (reelección + ambos ascensos)', () => {
    const state = baseState({ position: 'intendente', term: 1 });
    const options = getAvailableElectionOptions(state);
    expect(options).toHaveLength(3);
    expect(options).toContain('reelection');
    expect(options).toContain('promote-governor');
    expect(options).toContain('promote-president');
  });

  it('presidente en mandato 2 → 0 opciones (fin de carrera)', () => {
    const state = baseState({ position: 'presidente', term: 2 });
    expect(getAvailableElectionOptions(state)).toHaveLength(0);
  });
});

describe('canRunForOption', () => {
  it('popularidad 44: reelección sí, ascensos no', () => {
    const state = baseState({ popularity: 44 });
    expect(canRunForOption(state, 'reelection')).toBe(true);
    expect(canRunForOption(state, 'promote-governor')).toBe(false); // mínimo 45
    expect(canRunForOption(state, 'promote-president')).toBe(false); // mínimo 75
  });

  it('popularidad 45 habilita el ascenso a gobernador', () => {
    expect(canRunForOption(baseState({ popularity: 45 }), 'promote-governor')).toBe(true);
  });

  it('popularidad 74 no habilita presidente; 75 sí', () => {
    expect(canRunForOption(baseState({ popularity: 74 }), 'promote-president')).toBe(false);
    expect(canRunForOption(baseState({ popularity: 75 }), 'promote-president')).toBe(true);
  });
});
