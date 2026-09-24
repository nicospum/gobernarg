import { INDICATOR_IDS, isIndicatorId, type ActorId, type IndicatorId } from '../../data/causal';
import type { DslContext } from './dsl';
import type { CausalState } from './types';

export const FOREVER = 9999;

export function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Suma de bonus activos sobre `target` en el cierre `closeRef`. */
export function bonusSum(state: CausalState, target: string, closeRef: number): number {
  let s = 0;
  for (const b of state.bonuses) {
    if (b.target === target && b.start <= closeRef && closeRef <= b.end) s += b.value;
  }
  return s;
}

/** Valor efectivo de un indicador (base + bonus activos), acotado 0-100. */
export function effective(state: CausalState, id: IndicatorId, closeRef: number): number {
  return clamp(state.base[id] + bonusSum(state, id, closeRef));
}

export function effectiveAll(state: CausalState, closeRef: number): Record<IndicatorId, number> {
  const out = {} as Record<IndicatorId, number>;
  for (const id of INDICATOR_IDS) out[id] = effective(state, id, closeRef);
  return out;
}

/** Referencia de cierre para lo que ve el jugador en la fase de decisión. */
export function viewRef(state: CausalState): number {
  return state.turn - 1;
}

export function effectiveLeg(state: CausalState, closeRef: number): number {
  return clamp(state.political.leg + bonusSum(state, 'LEG', closeRef));
}

export function flagValue(state: CausalState, name: string, decisionRef: number): number {
  const f = state.flags[name];
  if (!f) return 0;
  if (f.start > decisionRef) return 0;
  if (f.end !== null && f.end < decisionRef) return 0;
  return f.value;
}

export function result3(state: CausalState): number {
  const h = state.fiscalHistory.slice(-3);
  if (h.length === 0) return 0;
  return h.reduce((a, b) => a + b, 0) / h.length;
}

/**
 * Cantidad de ejecuciones de `action` en los últimos `window` turnos (incluye el
 * turno `currentTurn`). Soporta `reunion_<actor>`, `negociacion_<actor>`,
 * `acuerdo_<actor>` y `encuesta_<actor>` para acciones de sistema dirigidas.
 */
export function countExecutions(state: CausalState, action: string, window: number, currentTurn: number): number {
  let actionId = action;
  let actor: string | undefined;
  const m = /^(reunion|negociacion|acuerdo|encuesta)_(.+)$/.exec(action);
  if (m) {
    actionId = m[1];
    actor = m[2];
  }
  const from = currentTurn - window;
  let n = 0;
  for (const e of state.executions) {
    if (e.actionId !== actionId) continue;
    if (actor && e.actor !== actor) continue;
    if (e.turn > from && e.turn <= currentTurn) n++;
  }
  return n;
}

export interface ContextRefs {
  closeRef: number;
  decisionRef: number;
  currentTurn: number;
}

/** Contexto del DSL sobre el estado causal. */
export function dslContext(state: CausalState, refs: ContextRefs): DslContext {
  return {
    value(id: string): number {
      if (isIndicatorId(id)) return effective(state, id, refs.closeRef);
      switch (id) {
        case 'CAJA': return state.caja;
        case 'DEUDA': return state.deuda;
        case 'LEG': return effectiveLeg(state, refs.closeRef);
        case 'GOB': return state.political.gob;
        case 'APRO': return state.political.apro;
        case 'IV': return state.political.iv;
        case 'RESULT3': return result3(state);
        case 'TURN': return refs.currentTurn;
        case 'DESANCLAJE': return state.desanclaje;
        case 'GASTO_CORR': return state.gastoCorr;
        default:
          throw new Error(`DSL: identificador desconocido ${id}`);
      }
    },
    count(action: string, window: number): number {
      return countExecutions(state, action, window, refs.currentTurn);
    },
    flag(name: string): number {
      return flagValue(state, name, refs.decisionRef);
    },
    sat(actor: string): number {
      return state.actors[actor as ActorId]?.sat ?? 50;
    },
    rel(actor: string): number {
      return state.actors[actor as ActorId]?.rel ?? 0;
    },
  };
}

/** Contexto "de lo que ve el jugador" durante la fase de decisión. */
export function decisionContext(state: CausalState): DslContext {
  return dslContext(state, { closeRef: viewRef(state), decisionRef: state.turn, currentTurn: state.turn });
}
