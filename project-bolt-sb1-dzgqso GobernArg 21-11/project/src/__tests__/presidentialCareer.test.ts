import { afterEach, describe, it, expect, vi } from 'vitest';
import { finalizePresidentialCareer } from '../engine/electionEngine';
import { processEndTurn } from '../engine/turnProcessor';
import { getInitialGameState } from '../engine/gameEngine';
import { getAvailableElectionOptions } from '../utils/electionSystem';
import { getPresidentialGoals } from '../utils/victoryConditions';
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
    objectives: getPresidentialGoals(),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

// Decisión de diseño (usuario, motor causal): al terminar el 2º mandato hay una
// elección de SUCESIÓN. Victoria final si el espacio del presidente retiene el
// gobierno (intención de voto ≥ 45, sin ventaja de incumbencia).
describe('finalizePresidentialCareer (fin del 2º mandato: elección de sucesión)', () => {
  it('con intención de voto alta: gameOver y victoria', () => {
    const state = secondTermState();
    state.causal = structuredClone(state.causal);
    state.causal.political.iv = 70;

    const result = finalizePresidentialCareer(state);

    expect(result.gameOver).toBe(true);
    expect(result.victorious).toBe(true);
    expect(result.electionResults?.kind).toBe('succession');
    expect(result.electionResults?.causal?.incumbencia).toBe(0);
  });

  it('con intención de voto baja: gameOver sin victoria (derrota electoral del sucesor)', () => {
    const state = secondTermState();
    state.causal = structuredClone(state.causal);
    state.causal.political.iv = 30;

    const result = finalizePresidentialCareer(state);

    expect(result.gameOver).toBe(true);
    expect(result.victorious).toBe(false);
    expect(result.defeatReason).toBe('election_loss');
  });
});

describe('processEndTurn — cierre al terminar el 2º mandato (path MVP)', () => {
  it('presidente en año 4 turno 4 del mandato 2: gameOver sin elección pendiente', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    const state = secondTermState({ year: 4, turn: 4 });

    const result = processEndTurn(state);

    expect(result.state.gameOver).toBe(true);
    expect(result.state.pendingElection).toBe(false);
    expect(result.state.pendingElectionOptions).toEqual([]);
  });

  it('la sucesión se decide con el país tal como quedó tras el último turno', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    // Electorado muy conforme al llegar al último cierre → retiene el gobierno.
    const happy = secondTermState({ year: 4, turn: 4 });
    happy.causal = structuredClone(happy.causal);
    for (const a of ['clase_media', 'sectores_populares', 'sindicatos', 'pymes'] as const) happy.causal.actors[a].sat = 90;
    happy.causal.political.imagen = 80;
    const won = processEndTurn(happy);
    expect(won.state.gameOver).toBe(true);
    expect(won.state.victorious).toBe(true);

    // Mismo turno con el electorado furioso → pierde la sucesión.
    const angry = secondTermState({ year: 4, turn: 4 });
    angry.causal = structuredClone(angry.causal);
    for (const a of ['clase_media', 'sectores_populares', 'sindicatos', 'pymes'] as const) angry.causal.actors[a].sat = 5;
    const lost = processEndTurn(angry);
    expect(lost.state.gameOver).toBe(true);
    expect(lost.state.victorious).toBe(false);
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
