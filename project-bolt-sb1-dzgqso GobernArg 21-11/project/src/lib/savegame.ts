import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { resumeNotificationSeq } from '../engine/engineShared';

/**
 * Guardado automático de la partida en el navegador. Se guarda el estado
 * completo (es JSON puro) más los eventos que quedaron sin responder, así
 * recargar la página o cerrar la pestaña no borra el mandato.
 */
export const SAVE_KEY = 'gobernarg.partida.v1';
const SAVE_VERSION = 1;

export interface SavedGame {
  v: number;
  savedAt: string;
  state: GameState;
  pendingEvents: GameEvent[];
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState, pendingEvents: GameEvent[] = []): boolean {
  const s = storage();
  if (!s) return false;
  const data: SavedGame = { v: SAVE_VERSION, savedAt: new Date().toISOString(), state, pendingEvents };
  try {
    s.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Al cargar, la secuencia de ids de notificaciones sigue desde la última usada. */
export function rehydrate(state: GameState): GameState {
  resumeNotificationSeq(state.notifications ?? []);
  return state;
}

/** La partida guardada, o null si no hay o no se puede leer. */
export function loadGame(): SavedGame | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SavedGame>;
    const st = data?.state;
    if (data?.v !== SAVE_VERSION || !st || typeof st !== 'object') return null;
    if (!st.causal || typeof st.governorName !== 'string' || typeof st.year !== 'number') return null;
    return {
      v: SAVE_VERSION,
      savedAt: typeof data.savedAt === 'string' ? data.savedAt : '',
      state: rehydrate(st),
      pendingEvents: Array.isArray(data.pendingEvents) ? data.pendingEvents : [],
    };
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    storage()?.removeItem(SAVE_KEY);
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar.
  }
}
