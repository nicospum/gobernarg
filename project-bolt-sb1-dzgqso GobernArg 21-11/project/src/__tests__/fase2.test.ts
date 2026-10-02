import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameState } from '../types/game';
import { createNewGame, processEndTurn, retireFromReelection, triggerMidtermStrategy } from '../engine/gameEngine';
import { nextRandom } from '../engine/causal';
import { getEnabledPendingEvents } from '../data/events/pendingEvents';
import { CHANNEL_GAME_EVENTS, EVENT_CAUSAL } from '../data/events/causalEvents';

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    const [v, next] = nextRandom(s);
    s = next;
    return v;
  };
}

afterEach(() => vi.restoreAllMocks());

const newGame = (seed: number) =>
  createNewGame({ archetype: 'politico', governorName: 'Prueba', seed, scenarioId: 'pais_en_calma' });

describe('Legislativas: resultado y estrategia en el mismo turno', () => {
  it('el turno de la elección ya pide la estrategia para la segunda mitad', () => {
    vi.spyOn(Math, 'random').mockImplementation(seeded(5));
    let state: GameState = newGame(5);
    for (let i = 0; i < 12 && !state.legislativeResults && !state.gameOver; i++) state = processEndTurn(state).state;
    expect(state.legislativeResults).not.toBeNull();
    expect(state.pendingMidtermStrategy).toBe(true);
    expect(state.availableMidtermStrategies).toContain('negociar');

    // Elegida la estrategia, el turno siguiente no la vuelve a pedir.
    state = triggerMidtermStrategy(state, 'negociar');
    state = processEndTurn(state).state;
    expect(state.pendingMidtermStrategy).toBe(false);
    expect(state.midtermStrategy).toBe('negociar');
  });
});

describe('Eventos con decisión', () => {
  const withChoices = [
    ...getEnabledPendingEvents(),
    ...Object.values(CHANNEL_GAME_EVENTS),
  ].filter(e => e.choices && e.choices.length > 0);

  it('ningún evento con decisión tiene una sola opción', () => {
    const single = withChoices.filter(e => e.choices!.length < 2).map(e => e.id);
    expect(single).toEqual([]);
  });

  it('cada opción tiene su efecto en el motor causal', () => {
    for (const e of withChoices) {
      const causal = 'causal' in e ? (e as { causal: { choices?: Record<string, unknown> } }).causal : EVENT_CAUSAL[e.id];
      if (!causal) continue;
      for (const c of e.choices!) expect(causal.choices, `${e.id}.${c.id}`).toHaveProperty(c.id);
    }
  });
});

describe('No presentarse a la reelección', () => {
  it('compite otro candidato del espacio y la partida termina', () => {
    const state = { ...newGame(1), pendingElection: true, pendingElectionOptions: ['reelection' as const] };
    const out = retireFromReelection(state);
    expect(out.gameOver).toBe(true);
    expect(out.pendingElection).toBe(false);
    expect(out.electionResults?.kind).toBe('succession');
  });

  it('sin elección pendiente no hace nada', () => {
    const state = newGame(1);
    expect(retireFromReelection(state)).toBe(state);
  });
});
