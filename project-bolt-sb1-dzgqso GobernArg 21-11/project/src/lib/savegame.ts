import { PARAMS } from '../data/causal';
import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { interestGroups } from '../data/interestGroups';
import { ADVISOR_ROLES, ADVISOR_SALARY_VERSION, LEGACY_ADVISOR_SALARIES } from '../data/advisors';
import { validFullState, validPendingEvent, safeJsonTree } from './savegameValidation';
import { resumeNotificationSeq } from '../engine/engineShared';
import { migrateManagementActivity } from '../engine/causal/managementActivity';
import { recomputePolitical } from '../engine/causal/political';

/** Se conserva la clave de Full; el sobre v2 identifica la edición. */
export const SAVE_KEY = 'gobernarg.partida.v1';
export const BACKUP_KEY = `${SAVE_KEY}.backup`;
export interface SavedGame { v: number; edition: 'Full'; savedAt: string; state: GameState; pendingEvents: GameEvent[]; recoveredFromBackup?: boolean }

function storage(): Storage | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

/** Migra nómina y presión parcial anteriores; conserva deuda, programas y progreso. */
export function rehydrate(input: GameState): GameState {
  let state = input;
  let causal = migrateManagementActivity(state.causal);
  if (causal !== state.causal) {
    if (causal.managementActivity!.pressure < state.causal.managementActivity!.pressure) {
      // Proyecta GOB sin modificar votos, imagen, premios ni resultados históricos.
      const projection = { ...causal, political: { ...causal.political } };
      recomputePolitical(projection, Math.max(0, causal.turn - 1));
      causal = { ...causal, political: { ...causal.political, gob: projection.political.gob },
        govCrisisStreak: !state.gameOver && projection.political.gob >= PARAMS.GOB_CRISIS_UMBRAL ? 0 : causal.govCrisisStreak };
      state = { ...state, stability: Math.round(causal.political.gob * 10) / 10 };
    }
    state = { ...state, causal };
  }
  if (state.advisorSalaryVersion !== ADVISOR_SALARY_VERSION) {
    const difference = (state.advisors ?? []).filter(advisor => advisor.isActive).reduce((sum, advisor) => sum + (ADVISOR_ROLES[advisor.id]?.salary ?? 0) - (LEGACY_ADVISOR_SALARIES[advisor.id] ?? 0), 0);
    state = { ...state, advisorSalaryVersion: ADVISOR_SALARY_VERSION, causal: { ...state.causal, gastoCorr: Math.max(0, state.causal.gastoCorr + difference) } };
  }
  resumeNotificationSeq(state.notifications ?? []);
  if (!state.interestGroups) return state;
  const icons = new Map(interestGroups.flatMap(group => group.subgroups.map(sub => [sub.id, sub.icon] as const)));
  return { ...state, interestGroups: state.interestGroups.map(group => ({ ...group, subgroups: group.subgroups.map(sub => ({ ...sub, icon: icons.get(sub.id) ?? sub.icon })) })) };
}

export function encodeSavedGame(state: GameState, pendingEvents: GameEvent[] = []): string {
  return JSON.stringify({ v: 2, edition: 'Full', savedAt: new Date().toISOString(), state, pendingEvents });
}

/** Valida antes de continuar/importar y admite sobres v1 de Full sin borrar datos. */
export function parseSavedGame(raw: string): SavedGame | null {
  try {
    if (raw.length > 4_000_000) return null;
    const data = JSON.parse(raw) as Partial<SavedGame>;
    if (!safeJsonTree(data)) return null;
    if (!data || (data.v !== 1 && data.v !== 2) || (data.v === 2 && data.edition !== 'Full') || (data.edition !== undefined && data.edition !== 'Full')) return null;
    const state = data.state;
    if (!validFullState(state)) return null;
    if (data.pendingEvents !== undefined && (!Array.isArray(data.pendingEvents) || !data.pendingEvents.every(validPendingEvent))) return null;
    return { v: 2, edition: 'Full', savedAt: typeof data.savedAt === 'string' ? data.savedAt : '', state, pendingEvents: data.pendingEvents ?? [] };
  } catch { return null; }
}

export function saveGame(state: GameState, pendingEvents: GameEvent[] = []): boolean {
  const target = storage(); if (!target) return false;
  try {
    const previous = target.getItem(SAVE_KEY);
    target.setItem(SAVE_KEY, encodeSavedGame(state, pendingEvents));
    // La copia anterior es auxiliar: una cuota llena no invalida un guardado principal exitoso.
    if (previous && parseSavedGame(previous)) { try { target.setItem(BACKUP_KEY, previous); } catch { /* Conserva el principal. */ } }
    return true;
  } catch { return false; }
}

export function loadGame(): SavedGame | null {
  const target = storage(); if (!target) return null;
  try {
    const current = target.getItem(SAVE_KEY); const parsed = current ? parseSavedGame(current) : null;
    if (parsed) return { ...parsed, state: rehydrate(parsed.state) };
    const previous = target.getItem(BACKUP_KEY); const backup = previous ? parseSavedGame(previous) : null;
    return backup ? { ...backup, state: rehydrate(backup.state), recoveredFromBackup: true } : null;
  } catch { return null; }
}

export function clearSavedGame(): void {
  try { const target = storage(); target?.removeItem(SAVE_KEY); target?.removeItem(BACKUP_KEY); } catch { /* No elimina progreso ni otras ediciones. */ }
}
