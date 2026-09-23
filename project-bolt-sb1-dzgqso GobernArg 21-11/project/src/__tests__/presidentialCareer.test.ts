import { afterEach, describe, it, expect, vi } from 'vitest';
import { finalizePresidentialCareer } from '../engine/electionEngine';
import { processEndTurn } from '../engine/turnProcessor';
import { getInitialGameState } from '../engine/gameEngine';
import { getAvailableElectionOptions } from '../utils/electionSystem';
import { getPositionObjectives } from '../utils/victoryConditions';
import { interestGroups } from '../data/interestGroups';
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

  it('objetivo cumplido exactamente en el último turno del 2º mandato: victoria final (off-by-one)', () => {
    // random = 0.999 → sin eventos aleatorios: corrida determinística.
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    // Relaciones en 0 → la popularidad recalculada queda igual a la política
    // (mismo truco que el test de advertencia de popularidad crítica).
    const zeroRelations = Object.fromEntries(
      interestGroups.flatMap(g => g.subgroups).map(sg => [sg.id, 0])
    );
    const state = secondTermState({
      year: 4,
      turn: 4,
      popularity: 85, // 85 - 10 (decay presidente) = 75: cumple el objetivo Y el umbral de victoria (60)
      budget: 5000,   // +150 neto de caja → sigue > 0
      groupRelations: zeroRelations,
      // Objetivo que NO estaba completo antes del turno: se cumple recién con
      // la popularidad post-decay de ESTE último turno.
      objectives: [
        {
          id: 'obj-ultimo-turno',
          title: 'Cierre en alto',
          description: 'Terminar con al menos 65 de popularidad',
          requirements: { popularity: 65 },
          reward: {},
          completed: false,
          progress: 0,
        },
      ],
    });

    const result = processEndTurn(state);

    expect(result.state.gameOver).toBe(true);
    // Antes del fix, finalizePresidentialCareer (paso 5) evaluaba la victoria
    // con los objetivos PRE-turno (updateObjectives corre en el paso 10):
    // un objetivo cumplido en el último turno nunca contaba y victorious
    // quedaba en false.
    expect(result.state.victorious).toBe(true);
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
