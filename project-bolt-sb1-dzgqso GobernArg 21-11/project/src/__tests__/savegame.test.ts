import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameState } from '../types/game';
import { createNewGame, processEndTurn, resolvePendingElection, triggerMidtermStrategy } from '../engine/gameEngine';
import { nextRandom } from '../engine/causal';
import { SAVE_KEY, clearSavedGame, loadGame, rehydrate, saveGame } from '../lib/savegame';

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    const [v, next] = nextRandom(s);
    s = next;
    return v;
  };
}

/** Un turno "pasivo", resolviendo lo que la UI pediría al jugador. */
function step(state: GameState): GameState {
  if (state.pendingMidtermStrategy) state = triggerMidtermStrategy(state, state.availableMidtermStrategies[0]);
  if (state.pendingElection) state = { ...resolvePendingElection(state, 'reelection'), electionResults: null };
  if (state.gameOver) return state;
  return processEndTurn(state).state;
}

/** Guardar y cargar, como hace el juego. */
const roundTrip = (s: GameState): GameState => rehydrate(JSON.parse(JSON.stringify(s)));
/** Los ids y la hora de las notificaciones dependen del reloj y de la sesión. */
const stable = (s: GameState) => ({ ...s, notifications: s.notifications.map(({ id: _id, timestamp: _t, ...n }) => n) });

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Guardado automático', () => {
  it('la partida es JSON puro en todo el mandato: guardar y cargar no pierde nada', () => {
    vi.spyOn(Math, 'random').mockImplementation(seeded(7));
    let state = createNewGame('presidente', 'politico', 'Prueba', false, '', 'normal', undefined, 7, 'herencia_pesada');
    for (let i = 0; i < 40 && !state.gameOver; i++) {
      expect(roundTrip(state)).toEqual(state);
      state = step(state);
    }
    expect(roundTrip(state)).toEqual(state);
  });

  it('una partida cargada sigue exactamente igual que la original', () => {
    vi.spyOn(Math, 'random').mockImplementation(seeded(11));
    let state = createNewGame('presidente', 'politico', 'Prueba', false, '', 'normal', undefined, 11, 'viento_de_cola');
    for (let i = 0; i < 5; i++) state = step(state);
    const loaded = roundTrip(state);

    const play = (s: GameState) => {
      vi.spyOn(Math, 'random').mockImplementation(seeded(99));
      for (let i = 0; i < 6; i++) s = step(s);
      return s;
    };
    expect(stable(play(loaded))).toEqual(stable(play(state)));
  });

  it('entra holgado en el almacenamiento del navegador', () => {
    vi.spyOn(Math, 'random').mockImplementation(seeded(3));
    let state = createNewGame('presidente', 'politico', 'Prueba', false, '', 'normal', undefined, 3, 'pais_en_calma');
    for (let i = 0; i < 32 && !state.gameOver; i++) state = step(state);
    // localStorage suele dar 5 MB por sitio.
    expect(JSON.stringify(state).length).toBeLessThan(2_000_000);
  });

  it('guarda, carga y borra con el almacenamiento del navegador', () => {
    const storage = fakeStorage();
    vi.stubGlobal('window', { localStorage: storage });
    const state = createNewGame('presidente', 'politico', 'Laura', false, '', 'normal', undefined, 1, 'pais_en_calma');

    expect(loadGame()).toBeNull();
    expect(saveGame(state, [])).toBe(true);
    const saved = loadGame();
    expect(saved?.state.governorName).toBe('Laura');
    expect(saved?.state).toEqual(state);

    clearSavedGame();
    expect(loadGame()).toBeNull();
  });

  it('ignora guardados rotos o de otra versión', () => {
    const storage = fakeStorage();
    vi.stubGlobal('window', { localStorage: storage });
    storage.setItem(SAVE_KEY, '{no es json');
    expect(loadGame()).toBeNull();
    storage.setItem(SAVE_KEY, JSON.stringify({ v: 99, state: {} }));
    expect(loadGame()).toBeNull();
    storage.setItem(SAVE_KEY, JSON.stringify({ v: 1, state: { governorName: 'X' } }));
    expect(loadGame()).toBeNull();
  });

  it('sin almacenamiento disponible no rompe el juego', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new Error('bloqueado');
      },
    });
    const state = createNewGame('presidente', 'politico', 'Laura', false, '', 'normal', undefined, 1, 'pais_en_calma');
    expect(saveGame(state)).toBe(false);
    expect(loadGame()).toBeNull();
    expect(() => clearSavedGame()).not.toThrow();
  });
});
