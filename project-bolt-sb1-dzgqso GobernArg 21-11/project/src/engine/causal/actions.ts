import {
  CAUSAL_ACTIONS_BY_ID,
  EFFECTS_BY_ACTION,
  INFRA_DISCOUNT_ACTIONS,
  PARAMS,
  POLICY_ACTIONS,
  type CausalActionDef,
} from '../../data/causal';
import { evalCondition } from './dsl';
import { countExecutions, decisionContext, effectiveLeg, flagValue, viewRef } from './context';
import { projectCaja } from './fiscal';
import type { CausalState } from './types';

/** Una acción elegida en el turno. `viaDnu` = LEY habilitada por decreto. */
export interface Selection {
  actionId: string;
  viaDnu?: boolean;
  forced?: boolean;
}

/** Costo de caja real de ejecutar la acción ahora (negativo = gasto). */
export function cajaCost(state: CausalState, action: CausalActionDef): number {
  if (action.caja >= 0) return action.caja;
  let cost = action.caja;
  const decision = state.turn;
  const infra = state.costMult.infra;
  if (infra && INFRA_DISCOUNT_ACTIONS.includes(action.id) && infra.start <= decision && decision <= infra.end) {
    cost *= infra.value;
  }
  if (action.id === 'infraestructura_energetica' && flagValue(state, 'crisis_energetica', decision) && !flagValue(state, 'estudio_vigente', decision)) {
    cost *= 0.7;
  }
  if (action.tags.includes('AMBIENTAL') && state.actors.ambiente.sat < 35) cost *= 1.2;
  cost *= 1 - (state.perks.categoryCajaDiscount[action.category] ?? 0);
  return Math.round(cost);
}

/** Puntos de acción que cuesta (descuento de asesor en su área para acciones grandes). */
export function paCost(state: CausalState, action: CausalActionDef): number {
  if (action.paCost >= 2 && state.perks.paDiscountCategories.includes(action.category)) return action.paCost - 1;
  return action.paCost;
}

/** Apoyo legislativo disponible para leyes (incluye luna de miel en los primeros turnos de cada mandato). */
export function legForLaws(state: CausalState): number {
  const honeymoon = state.turn - state.mandateStart + 1 <= PARAMS.LUNA_MIEL ? PARAMS.LUNA_MIEL_LEG : 0;
  return effectiveLeg(state, viewRef(state)) + honeymoon;
}

export function lawThreshold(state: CausalState): number {
  return state.political.umbralLey;
}

export interface Availability {
  action: CausalActionDef;
  visible: boolean;
  available: boolean;
  reasons: string[];
  pa: number;
  caja: number;
  /** La acción es LEY y el Congreso no alcanza: sólo sale por DNU. */
  needsDnu: boolean;
  /** Aviso de uso reiterado (rendimientos decrecientes o castigo por repetición). */
  repetitionWarning: string | null;
  /**
   * Bloqueo estructural: cooldown, requisito sin cumplir o ley sin mayoría que
   * no admite DNU. No cuenta la falta de PA o de caja ni la ley que sale por DNU,
   * que dependen de lo elegido este turno.
   */
  blocked: boolean;
}

/** Ventana de repetición más cercana a dispararse para esta acción (si la próxima ejecución la activa). */
export function repetitionWarning(state: CausalState, actionId: string): string | null {
  const rows = (EFFECTS_BY_ACTION[actionId] ?? []).filter(r => r.kind === 'REPETITION' && r.repetition);
  for (const r of rows) {
    const m = /COUNT\((\w+),\s*(\d+)\)\s*>=\s*(\d+)/.exec(r.repetition!);
    if (!m) continue;
    const [, act, win, thr] = m;
    if (act !== actionId) continue;
    const n = countExecutions(state, actionId, Number(win), state.turn);
    if (n + 1 >= Number(thr)) return 'Uso reiterado: esta vez tendrá costos adicionales.';
  }
  return null;
}

/**
 * Disponibilidad de una acción de política en la fase de decisión, dado lo ya
 * seleccionado este turno (`selected`) y los PA restantes.
 */
export function getAvailability(
  state: CausalState,
  actionId: string,
  selected: Selection[],
  paLeft: number,
  opts: { loansAllowed?: boolean } = {},
): Availability {
  const action = CAUSAL_ACTIONS_BY_ID[actionId];
  const ctx = decisionContext(state);
  const reasons: string[] = [];
  let blocked = false;
  const pa = paCost(state, action);
  const caja = cajaCost(state, action);
  const isSelected = selected.some(s => s.actionId === actionId);

  const visible = !action.visibleWhen || evalCondition(action.visibleWhen, ctx) || isSelected;

  if (opts.loansAllowed === false && ['prestamo_internacional', 'prestamo_local'].includes(actionId)) {
    reasons.push('El modo de juego no permite préstamos.');
    blocked = true;
  }

  // Cooldown: no se puede repetir antes de N turnos (cooldown 1 = no dos veces por turno).
  if (action.cooldown > 0 && !isSelected) {
    const recent = state.executions.find(e => e.actionId === actionId && e.turn > state.turn - action.cooldown);
    if (recent) {
      const wait = recent.turn + action.cooldown - state.turn;
      reasons.push(wait <= 0 ? 'Ya se ejecutó este turno.' : `Disponible en ${wait} turno${wait === 1 ? '' : 's'}.`);
      blocked = true;
    }
  }

  for (const req of action.requirements) {
    if (!evalCondition(req.when, ctx)) {
      reasons.push(req.reason);
      blocked = true;
    }
  }

  // Caja: el total de lo seleccionado no puede superar la caja disponible.
  const otherCosts = selected
    .filter(s => s.actionId !== actionId)
    .reduce((acc, s) => acc + Math.min(0, cajaCost(state, CAUSAL_ACTIONS_BY_ID[s.actionId])), 0);
  if (caja < 0 && state.caja + otherCosts + caja < 0) reasons.push('No alcanza la caja.');

  // LEY: requiere mayoría (o DNU en el mismo turno, salvo que no lo admita).
  let needsDnu = false;
  if (action.ley && legForLaws(state) < lawThreshold(state)) {
    const dnuSelected = selected.some(s => s.actionId === 'dnu');
    const dnuUsed = selected.some(s => s.viaDnu && s.actionId !== actionId);
    if (action.leyNoDnu) {
      reasons.push('Es ley: requiere mayoría en el Congreso (no admite DNU).');
      blocked = true;
    } else if (!dnuSelected || dnuUsed) {
      needsDnu = true;
      reasons.push('Es ley: el Congreso no la aprueba. Podés firmar un DNU este turno para sacarla por decreto.');
    } else {
      needsDnu = true;
    }
  }

  if (!isSelected && pa > paLeft) reasons.push('No quedan puntos de acción.');

  return {
    action,
    visible,
    available: reasons.length === 0,
    reasons,
    pa,
    caja,
    needsDnu,
    repetitionWarning: repetitionWarning(state, actionId),
    blocked: blocked && !isSelected,
  };
}

export function listPolicyAvailability(state: CausalState, selected: Selection[], paLeft: number, opts: { loansAllowed?: boolean } = {}): Availability[] {
  return POLICY_ACTIONS.map(a => getAvailability(state, a.id, selected, paLeft, opts)).filter(a => a.visible);
}

/** Gasto corriente permanente que agrega una acción al ejecutarse (offset 0). */
export function immediateGastoDelta(actionId: string): number {
  return immediateDelta(actionId, 'GASTO_CORR');
}

function immediateDelta(actionId: string, target: string, maxOffset = 0): number {
  return (EFFECTS_BY_ACTION[actionId] ?? [])
    .filter(r => r.target === target && r.offset <= maxOffset && (r.kind === 'IMMEDIATE' || r.kind === 'DELAYED') && r.magnitude !== null)
    .reduce((a, r) => a + (r.magnitude as number), 0);
}

/**
 * Proyección de caja al cierre con la selección actual: incluye el costo, el
 * gasto permanente que agregan, los cambios de recaudación (alícuotas,
 * retenciones, exenciones, próximos 2 turnos) y los intereses de la deuda nueva.
 */
export function projectedCloseCaja(state: CausalState, selected: Selection[]): { caja: number; structural: number } {
  return projectCaja(state, selected, id => ({
    caja: cajaCost(state, CAUSAL_ACTIONS_BY_ID[id]),
    gasto: immediateDelta(id, 'GASTO_CORR'),
    ingresoMult: immediateDelta(id, 'INGRESO_MULT', 2),
    pres: immediateDelta(id, 'PRES', 1),
    deuda: immediateDelta(id, 'DEUDA'),
  }));
}
