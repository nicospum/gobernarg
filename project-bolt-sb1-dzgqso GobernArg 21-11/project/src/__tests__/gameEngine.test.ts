import { describe, it, expect } from 'vitest';
import { getInitialGameState, resolvePendingElection } from '../engine/gameEngine';
import type { GameState } from '../types/game';

// getInitialGameState() devuelve un estado completo (arquetipo 'politico') sin
// aleatoriedad, con el motor causal inicializado con semilla fija.
// `budget` se traduce a la caja del motor (fuente de verdad).
function stateWith(overrides: Partial<GameState> = {}): GameState {
  const base = getInitialGameState();
  const causal = structuredClone(base.causal);
  if (overrides.budget !== undefined) causal.caja = overrides.budget;
  return { ...base, ...overrides, causal };
}

// ===== Regresión: pasivas de arquetipo no duplicadas (Punto 13) =====

describe('getInitialGameState — pasivas de arquetipo', () => {
  it('no aplica las pasivas del arquetipo default: las aplica createNewGame una sola vez', () => {
    const state = getInitialGameState();
    // Si aplicara las pasivas de 'politico' (default): retención 0.10 y
    // shifts de ejes +2/+1. El estado base debe venir sin ellas.
    expect(state.causal.perks.structureMult).toBe(1);
    expect(state.radicalConciliadorAxis).toBe(0);
    expect(state.cerradoConvocanteAxis).toBe(0);
  });
});

// ===== Regresión: anti doble-clic electoral (Punto 2) =====

describe('resolvePendingElection — anti doble-clic', () => {
  it('es no-op si ya hay resultados electorales (evita doble reset de mandato)', () => {
    const state = stateWith({
      pendingElection: true,
      electionResults: { victory: false, votesPercentage: 30 } as any,
    });

    const result = resolvePendingElection(state);

    expect(result).toBe(state);
  });

  it('es no-op si no hay elección pendiente', () => {
    const state = stateWith({ pendingElection: false });

    const result = resolvePendingElection(state);

    expect(result).toBe(state);
  });
});


// ===== Decisión de diseño: país continuo entre mandatos =====

describe('reelección con país continuo', () => {
  it('al ganar la reelección no se reinician caja, deuda ni indicadores', () => {
    const state = stateWith({ pendingElection: true, electionResults: null });
    state.causal.political.iv = 70;
    state.causal.turn = 17;
    state.causal.caja = 321;
    state.causal.deuda = 4500;
    state.causal.base.INFL = 77;

    const result = resolvePendingElection(state);

    expect(result.electionResults?.victory).toBe(true);
    expect(result.term).toBe(2);
    expect(result.year).toBe(1);
    expect(result.causal.caja).toBe(321);
    expect(result.causal.deuda).toBe(4500);
    expect(result.causal.base.INFL).toBe(77);
    // Nueva luna de miel legislativa: el mandato empieza en el turno actual.
    expect(result.causal.mandateStart).toBe(17);
  });
});


// ===== Tipo de milestone en la reelección =====

describe('resolvePendingElection — tipo de milestone', () => {
  it('ganar la reelección cierra el mandato inicial y abre uno de reelección', () => {
    const state = stateWith({
      pendingElection: true,
      electionResults: null,
      careerHistory: [
        { position: 'presidente', term: 1, startYear: 1, endYear: 1, result: 'victory', type: 'initial', votesPercentage: 50 },
      ],
    });
    state.causal.political.iv = 90;

    const result = resolvePendingElection(state);

    expect(result.electionResults?.victory).toBe(true);
    expect(result.careerHistory[0].type).toBe('initial');
    expect(result.careerHistory[0].result).toBe('victory');
    expect(result.careerHistory[1]).toMatchObject({ term: 2, type: 'reelection' });
  });
});
