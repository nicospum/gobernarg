import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { resumeNotificationSeq } from '../engine/engineShared';
import { LEGACY_CALENDAR_ID, calendarFor } from './calendar';
import { safeJsonTree, validGameState, validPendingEvents } from './savegameValidation';

export const SAVE_KEY = 'gobernarg.lite.partida';
export const SAVE_VERSION = 2;
export interface SavedGame {
  v: number;
  edition: 'Light';
  savedAt: string;
  state: GameState;
  pendingEvents: GameEvent[];
  /** Sólo metadato de lectura para avisar que una importación mantiene 16 turnos. */
  migratedFrom?: 1;
}
function storage(): Storage | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

/** Serialización pura: no guarda ni modifica el estado o el progreso. */
export function encodeSavedGame(state: GameState, pendingEvents: GameEvent[] = []): string {
  const marked = { ...state, causal: { ...state.causal, calendar: calendarFor(state).id } };
  return JSON.stringify({ v: SAVE_VERSION, edition: 'Light', savedAt: new Date().toISOString(), state: marked, pendingEvents });
}

/** Parseo puro y validado; nunca sobrescribe la partida actual ni el progreso. */
export function parseSavedGame(raw: string): SavedGame | null {
  try {
    if (raw.length > 10000000) return null;
    const data = JSON.parse(raw) as Partial<SavedGame>;
    if (!data || typeof data !== 'object' || !safeJsonTree(data) || (data.v !== 1 && data.v !== SAVE_VERSION)) return null;
    if (data.edition !== undefined && data.edition !== 'Light') return null;
    if (data.v === SAVE_VERSION && data.edition !== 'Light') return null;
    const original = data.state;
    if (!original || typeof original !== 'object' || !original.causal || typeof original.causal !== 'object') return null;
    // Los v1 de Full tenían gabinete/plataforma: no se importan como una partida Light.
    if ('advisors' in original || 'platformId' in original.causal) return null;
    if (data.v === 1 && original.causal.calendar && original.causal.calendar !== LEGACY_CALENDAR_ID) return null;
    if (data.v === SAVE_VERSION && !original.causal.calendar) return null;
    const state = data.v === 1 ? { ...original, causal: { ...original.causal, calendar: LEGACY_CALENDAR_ID } } : original;
    const pendingEvents = data.pendingEvents;
    if (!validGameState(state) || !validPendingEvents(pendingEvents)) return null;
    return { v: SAVE_VERSION, edition: 'Light', savedAt: typeof data.savedAt === 'string' ? data.savedAt : '', state, pendingEvents, ...(data.v === 1 ? { migratedFrom: 1 as const } : {}) };
  } catch { return null; }
}

export function saveGame(state: GameState, pendingEvents: GameEvent[] = []): boolean {
  try {
    const s = storage(); if (!s) return false;
    s.setItem(SAVE_KEY, encodeSavedGame(state, pendingEvents)); return true;
  } catch { return false; }
}
/** Sólo al aplicar un estado ya validado se reanuda la secuencia de notificaciones. */
export function rehydrate(state: GameState): GameState {
  resumeNotificationSeq(state.notifications ?? []);
  return state;
}
export function loadGame(): SavedGame | null {
  try {
    const raw = storage()?.getItem(SAVE_KEY); if (!raw) return null;
    const saved = parseSavedGame(raw);
    return saved ? { ...saved, state: rehydrate(saved.state) } : null;
  } catch { return null; }
}
export function clearSavedGame(): void {
  try { storage()?.removeItem(SAVE_KEY); } catch { /* Conserva el juego usable sin storage. */ }
}
