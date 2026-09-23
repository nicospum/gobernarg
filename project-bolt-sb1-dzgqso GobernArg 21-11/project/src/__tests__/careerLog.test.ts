import { describe, it, expect } from 'vitest';
import { generateLegacyStats } from '../utils/careerLog';
import { getInitialGameState } from '../engine/gameEngine';
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

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...getInitialGameState(), ...overrides };
}

function statValue(stats: { label: string; value: string }[], label: string): string {
  return stats.find(s => s.label === label)!.value;
}

describe('generateLegacyStats — cargos ocupados', () => {
  it('presidente con 1 milestone muestra "Presidente", no "Ninguno"', () => {
    // FIX: antes se derivaba de termsByPosition (solo incrementa al GANAR una
    // elección), así que un presidente que perdía la reelección mostraba
    // "Ninguno" tras 4 años de gobierno.
    const state = stateWith({
      careerHistory: [milestone({ endYear: 4, result: 'defeat' })],
      termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    });

    const stats = generateLegacyStats(state);

    expect(statValue(stats, 'Cargos ocupados')).toBe('Presidente');
  });
});

describe('generateLegacyStats — años en el poder', () => {
  it('un mandato completo (año 4) cuenta 4 años', () => {
    const state = stateWith({
      careerHistory: [milestone()],
      year: 4,
    });

    expect(statValue(generateLegacyStats(state), 'Años en el poder')).toBe('4');
  });

  it('dos mandatos completos (año 4 del 2º) cuentan 8 años', () => {
    const state = stateWith({
      careerHistory: [milestone(), milestone({ term: 2, type: 'reelection' })],
      year: 4,
    });

    expect(statValue(generateLegacyStats(state), 'Años en el poder')).toBe('8');
  });

  it('año 2 del primer mandato cuenta 2 años', () => {
    const state = stateWith({
      careerHistory: [milestone()],
      year: 2,
    });

    expect(statValue(generateLegacyStats(state), 'Años en el poder')).toBe('2');
  });
});
