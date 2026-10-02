import type {
  GameState,
  TurnSummary,
  Notification,
  MidtermStrategy
} from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { applyMidtermStrategy, syncLegacy } from './causalBridge';

// ===========================
// Interface compartida
// ===========================

export interface TurnResult {
  state: GameState;
  summary: TurnSummary;
  // FIX (Punto 20): era any[] — el tipo real es el GameEvent del sistema de
  // eventos (mismo que devuelve resolveRandomEvents y consume App.tsx).
  triggeredEvents: GameEvent[];
}

// ===========================
// Utilidades compartidas
// ===========================

/**
 * Turno global absoluto (1, 2, 3, ...) que NO se reinicia al cambiar de año
 * (cada año tiene 4 turnos). Es la única aritmética válida para deadlines,
 * cooldowns y activationTurn que pueden cruzar el límite anual:
 * `state.turn` es cíclico 1-4, por lo que `turn + N` y `turn >= deadline`
 * nunca se cumplen cuando el deadline cae en otro año.
 */
export function getGlobalTurn(state: { year: number; turn: number }): number {
  return (state.year - 1) * 4 + state.turn;
}

// Secuencia local para los ids: no consume Math.random, así agregar o quitar
// una notificación no altera los eventos aleatorios (partidas con semilla).
let notificationSeq = 0;

/**
 * Al cargar una partida guardada, la secuencia sigue desde la más alta ya
 * usada: si volviera a 0 repetiría ids de notificaciones del mismo turno.
 */
export function resumeNotificationSeq(notifications: Notification[]): void {
  for (const n of notifications) {
    const seq = parseInt(n.id.split('_')[2] ?? '', 36);
    if (Number.isFinite(seq) && seq > notificationSeq) notificationSeq = seq;
  }
}

export function addNotification(
  state: GameState,
  notification: Omit<Notification, 'id' | 'timestamp'>
): GameState {
  const newNotification: Notification = {
    ...notification,
    id: `${state.year}_${state.turn}_${(++notificationSeq).toString(36)}`,
    timestamp: Date.now(),
    // FIX (Punto 13): congelar el año/turno de creación. El centro de
    // notificaciones mostraba el turno vivo del estado, así una notificación
    // vieja parecía recién emitida.
    year: state.year,
    turn: state.turn
  };
  return {
    ...state,
    notifications: [newNotification, ...state.notifications].slice(0, 50)
  };
}

// ===========================
// Estrategias post-legislativas (compartidas entre gameEngine y eventResolver)
// ===========================

export function filterAvailableMidtermStrategies(state: GameState): MidtermStrategy[] {
  const available: MidtermStrategy[] = ['negociar'];
  const support = state.legislativeSupport ?? 0;

  if (support > 42) {
    available.push('acelerar');
  }

  const highSupportGroups = Object.values(state.groupRelations).filter(v => v > 50).length;
  if (highSupportGroups >= 3) {
    available.push('abrirse');
  }

  if (state.archetype === 'comunicador' || state.archetype === 'politico' || state.popularity > 65) {
    available.push('jugada_audaz');
  }

  return available;
}

export function triggerMidtermStrategy(state: GameState, strategy: MidtermStrategy): GameState {
  const causal = structuredClone(state.causal);
  applyMidtermStrategy(causal, strategy);
  return syncLegacy({
    ...state,
    causal,
    midtermStrategy: strategy,
    pendingMidtermStrategy: false,
    availableMidtermStrategies: [],
  });
}
