import { afterEach, describe, it, expect, vi } from 'vitest';
import { finalizePresidentialCareer } from '../engine/electionEngine';
import { processEndTurn } from '../engine/turnProcessor';
import { getInitialGameState } from '../engine/gameEngine';
import { getAvailableElectionOptions } from '../utils/electionSystem';
import { getPositionObjectives } from '../utils/victoryConditions';
import type { CareerMilestone, GameState } from '../types/game';

function milestone(overrides: Partial<CareerMilestone> = {}): CareerMilestone {
  return {
    position: 'presidente',
    term: 1,
    startYear: 1,
    endYear: 1,
    result: 'victory',
    type: 'initial',
    votesPercentage: 50,
    ...overrides,
  };
}

// Presidente en su segundo mandato, con los dos milestones registrados.
function secondTermState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...getInitialGameState(),
    position: 'presidente',
    term: 2,
    careerHistory: [milestone(), milestone({ term: 2, type: 'reelection' })],
    objectives: getPositionObjectives('presidente'),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('finalizePresidentialCareer (path MVP: fin del 2º mandato)', () => {
  it('con objetivos completados + popularidad >= 60 + presupuesto > 0: gameOver y victoria', () => {
    const state = secondTermState({
      popularity: 80,
      budget: 5000,
      objectives: getPositionObjectives('presidente').map(o => ({
        ...o,
        completed: true,
        progress: 100,
      })),
    });

    const result = finalizePresidentialCareer(state);

    expect(result.gameOver).toBe(true);
    expect(result.victorious).toBe(true);
  });

  it('con objetivos incompletos: gameOver pero sin victoria', () => {
    const state = secondTermState({
      popularity: 80,
      budget: 5000,
      // Objetivos intactos (completed: false) → victoria imposible.
    });

    const result = finalizePresidentialCareer(state);

    expect(result.gameOver).toBe(true);
    expect(result.victorious).toBe(false);
  });
});

describe('processEndTurn — cierre al terminar el 2º mandato (path MVP)', () => {
  it('presidente en año 4 turno 4 del mandato 2: gameOver sin elección pendiente', () => {
    // random = 0.999 → sin eventos aleatorios: corrida determinística.
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    const state = secondTermState({
      year: 4,
      turn: 4,
      popularity: 85,
      budget: 5000,
      objectives: getPositionObjectives('presidente').map(o => ({
        ...o,
        completed: true,
        progress: 100,
      })),
    });

    const result = processEndTurn(state);

    expect(result.state.gameOver).toBe(true);
    // Sin pendingElectionOptions desde presidente en último mandato → no hay
    // elección: el cierre es directo.
    expect(result.state.pendingElection).toBe(false);
    expect(result.state.pendingElectionOptions).toEqual([]);
  });
});

describe('getAvailableElectionOptions (path MVP presidente-only)', () => {
  it('presidente en mandato 1: solo reelección', () => {
    const state = { ...getInitialGameState(), position: 'presidente' as const, term: 1 };

    expect(getAvailableElectionOptions(state)).toEqual(['reelection']);
  });

  it('presidente en mandato 2: sin opciones (fin de carrera presidencial)', () => {
    const state = { ...getInitialGameState(), position: 'presidente' as const, term: 2 };

    expect(getAvailableElectionOptions(state)).toEqual([]);
  });
});
