import {
  CAUSAL_ACTIONS_BY_ID,
  EFFECTS_BY_ACTION,
  FINANCING_ACTION_IDS,
  INDICATORS,
  PARAMS,
  isActorId,
  isIndicatorId,
  type ActorId,
  type CausalActionDef,
} from '../../data/causal';
import type { EffectRow } from '../../data/causal/types';
import { evalCondition } from './dsl';
import { FOREVER, clamp, dslContext } from './context';
import type { AppliedEffectRecord, CausalState, ScheduledEffect } from './types';

/** Acciones de seguridad cuyo costo institucional puede mitigarse (07 derechos_cultura SAT>65, asesora de seguridad). */
const SECURITY_ACTIONS = ['seguridad_ciudadana', 'mano_dura', 'lucha_narcotrafico'];

export interface EffectAccumulator {
  /** Deltas de caja producidos por efectos (no financiamiento): entran al resultado fiscal. */
  cajaEffects: number;
  /** Ajustes de caja de acciones de financiamiento (no son resultado). */
  financingEffects: number;
  applied: AppliedEffectRecord[];
}

export function newAccumulator(): EffectAccumulator {
  return { cajaEffects: 0, financingEffects: 0, applied: [] };
}

function isBeneficial(indicator: string, magnitude: number): boolean {
  if (!isIndicatorId(indicator)) return false;
  const dir = INDICATORS[indicator].goodDirection;
  return dir !== 0 && Math.sign(magnitude) === dir;
}

/**
 * Multiplicador de eficacia de un efecto (06/07 canales + asesores + estrategia).
 * Sólo se aplica a efectos beneficiosos sobre indicadores y nunca a penalidades
 * por repetición.
 */
export function efficacyMultiplier(state: CausalState, action: CausalActionDef, row: EffectRow, turn: number): number {
  if (row.kind === 'REPETITION' || row.magnitude === null) return 1;
  if (!isBeneficial(row.target, row.magnitude)) return 1;
  let m = 1;
  const a = state.actors;
  if (action.tags.includes('FEDERAL')) {
    const g = a.gobernadores;
    const rel = g.rel ?? 50;
    if (g.sat < 35 || rel < 35) m *= 0.75;
    else if (g.sat > 65 && rel > 65) m *= 1.25;
  }
  if (row.target === 'EDUC' && a.docentes.sat > 65) m *= 1.25;
  if (row.target === 'CIEN' && a.cientificos.sat > 65) m *= 1.25;
  if (row.target === 'PSOC' && a.org_sociales.sat > 60 && (a.org_sociales.rel ?? 0) > 50) m *= 1.25;
  m *= state.perks.categoryEfficacy[action.category] ?? 1;
  for (const mod of state.modifiers) {
    if (mod.efficacy && mod.start <= turn && turn <= mod.end) m *= mod.efficacy;
  }
  return m;
}

/** Demora por judicialización/licencia social de proyectos AMBIENTALES (07 ambiente). */
function ambientalDelay(state: CausalState, action: CausalActionDef, row: EffectRow): number {
  if (!action.tags.includes('AMBIENTAL')) return 0;
  if (row.magnitude === null || !isBeneficial(row.target, row.magnitude)) return 0;
  const sat = state.actors.ambiente.sat;
  if (sat < 35) return 2;
  if (sat > 65 && row.offset > 0) return -1;
  return 0;
}

function resolveTarget(target: string, actor?: ActorId): string {
  return actor ? target.replace(/\[actor\]/g, actor) : target;
}

function durationEnd(start: number, duration: EffectRow['duration']): { end: number; whileCondition: boolean } {
  if (duration === 'PERM') return { end: FOREVER, whileCondition: false };
  if (duration === 'plazo') return { end: start + PARAMS.PLAZO_ACUERDO - 1, whileCondition: false };
  if (duration === 99) return { end: FOREVER, whileCondition: true };
  return { end: start + Math.max(1, duration) - 1, whileCondition: false };
}

/**
 * Interpretaciones explícitas de condiciones del Excel. COUNT incluye la
 * ejecución actual (regla T.2); para el "gesto de apertura" de la reunión
 * (reunion.02: "no hubo reunión en 4 turnos") hay que excluirla.
 */
const CONDITION_OVERRIDES: Record<string, string> = {
  'reunion.02': 'REL([actor])<40 and COUNT(reunion_[actor],4)<2',
};

let uidCounter = 0;

/**
 * T.2 — Programa los efectos de una acción ejecutada en el turno `turn`.
 * Las condiciones EXEC y reglas de repetición se evalúan sobre el estado que
 * vio el jugador (cierre anterior); COUNT incluye la ejecución actual.
 */
export function scheduleActionEffects(
  state: CausalState,
  actionId: string,
  turn: number,
  actor?: ActorId,
): ScheduledEffect[] {
  const action = CAUSAL_ACTIONS_BY_ID[actionId];
  const rows = EFFECTS_BY_ACTION[actionId] ?? [];
  const ctx = dslContext(state, { closeRef: turn - 1, decisionRef: turn, currentTurn: turn });
  const scheduled: ScheduledEffect[] = [];
  for (const row of rows) {
    if (row.magnitude === null) continue;
    const evalAtApply = (row.evalAt ?? '').toUpperCase() === 'APPLY';
    const condition = CONDITION_OVERRIDES[row.id] ?? row.condition;
    if (row.repetition && !evalCondition(row.repetition, ctx, actor)) continue;
    if (condition && !evalAtApply && !evalCondition(condition, ctx, actor)) continue;

    let magnitude = row.magnitude;
    const target = resolveTarget(row.target, actor);
    if (isIndicatorId(target)) {
      magnitude *= efficacyMultiplier(state, action, row, turn);
      // Mitigación del costo institucional de medidas de seguridad.
      if (target === 'INST' && magnitude < 0 && SECURITY_ACTIONS.includes(actionId)) {
        let mitig = state.perks.securityInstMitigation;
        if (state.actors.derechos_cultura.sat > 65) mitig += 1 / Math.max(1, Math.abs(magnitude));
        magnitude *= 1 - clamp(mitig, 0, 1);
      }
    }
    if (target === 'DEUDA' && magnitude > 0 && state.perks.loanDiscount > 0 && row.kind === 'IMMEDIATE') {
      magnitude *= 1 - state.perks.loanDiscount;
    }

    const start = turn + Math.max(0, row.offset + ambientalDelay(state, action, row));
    const { end, whileCondition } = durationEnd(start, row.duration);
    const mode = (row.mode ?? 'DELTA').toUpperCase() as ScheduledEffect['mode'];
    const multiTurn = end > start;
    const eff: ScheduledEffect = {
      uid: `${actionId}.${turn}.${++uidCounter}`,
      effectId: row.id,
      actionId,
      originTurn: turn,
      actor,
      target,
      mode,
      magnitude,
      start,
      end,
      everyTurn: mode === 'DELTA' && (row.kind === 'PERSISTENT' || multiTurn),
      applyCondition: evalAtApply ? row.condition ?? undefined : undefined,
      whileCondition,
      floor: row.cap?.floor,
      cumulativeCap: row.cap?.cumulative,
      appliedTotal: 0,
      explanation: row.explanation ?? '',
    };
    if (whileCondition && row.condition) eff.applyCondition = row.condition;
    scheduled.push(eff);
  }
  state.agenda.push(...scheduled);
  return scheduled;
}

function applyDelta(state: CausalState, eff: ScheduledEffect, value: number, acc: EffectAccumulator): number {
  const t = eff.target;
  if (isIndicatorId(t)) {
    const before = state.base[t];
    state.base[t] = clamp(before + value);
    return state.base[t] - before;
  }
  if (t.startsWith('REL:')) {
    const actor = t.slice(4);
    if (!isActorId(actor)) return 0;
    const st = state.actors[actor];
    if (st.rel === null) return 0;
    const before = st.rel;
    st.rel = clamp(before + value);
    return st.rel - before;
  }
  switch (t) {
    case 'CAJA':
      state.caja += value;
      if (FINANCING_ACTION_IDS.includes(eff.actionId)) acc.financingEffects += value;
      else acc.cajaEffects += value;
      return value;
    case 'GASTO_CORR':
      state.gastoCorr = Math.max(0, state.gastoCorr + value);
      return value;
    case 'DEUDA':
      state.deuda = Math.max(0, state.deuda + value);
      return value;
    case 'INGRESO_MULT':
      state.ingresoMult = Math.max(0.5, state.ingresoMult + value);
      return value;
    case 'DESANCLAJE': {
      const before = state.desanclaje;
      state.desanclaje = Math.max(eff.floor ?? 0, before + value);
      return state.desanclaje - before;
    }
    case 'LEG':
      state.political.legAdj += value;
      return value;
    default:
      return 0;
  }
}

/**
 * T.3 — Aplica los efectos cuyo turno llegó en el cierre `close`.
 * DELTA: suma permanente (una vez, o cada turno si everyTurn).
 * BONUS: se registra como modificador temporal [start, end].
 * SET: flags (rigen desde la decisión siguiente) y multiplicadores de costo.
 */
export function applyAgenda(state: CausalState, close: number, acc: EffectAccumulator): void {
  const ctx = dslContext(state, { closeRef: close - 1, decisionRef: close, currentTurn: close });
  const keep: ScheduledEffect[] = [];
  for (const eff of state.agenda) {
    if (eff.start > close) { keep.push(eff); continue; }
    if (eff.end < close) continue;

    const condOk = !eff.applyCondition || evalCondition(eff.applyCondition, ctx, eff.actor);
    if (!condOk) {
      // "Mientras se cumpla": al dejar de cumplirse, el efecto termina.
      if (eff.whileCondition) continue;
      if (eff.everyTurn && eff.end > close) keep.push(eff);
      continue;
    }

    if (eff.mode === 'BONUS') {
      state.bonuses.push({
        id: eff.uid,
        target: eff.target,
        value: eff.magnitude,
        start: close,
        end: eff.end,
        source: eff.actionId,
        label: eff.explanation,
      });
      record(acc, eff, eff.magnitude);
      continue; // un bonus se registra una sola vez
    }

    if (eff.mode === 'SET') {
      if (eff.target.startsWith('FLAG:')) {
        const name = eff.target.slice(5);
        state.flags[name] = {
          value: eff.magnitude,
          start: close + 1,
          end: eff.end >= FOREVER ? null : eff.end + 1,
          source: eff.actionId,
        };
      } else if (eff.target.startsWith('COSTO_MULT:')) {
        state.costMult[eff.target.slice(11)] = { value: eff.magnitude, start: close + 1, end: eff.end + 1 };
      }
      record(acc, eff, eff.magnitude);
      continue;
    }

    // DELTA
    if (!eff.everyTurn && eff.start !== close) continue;
    let value = eff.magnitude;
    if (eff.cumulativeCap !== undefined) {
      const room = eff.cumulativeCap - Math.abs(eff.appliedTotal);
      if (room <= 0) { continue; }
      if (Math.abs(value) > room) value = Math.sign(value) * room;
    }
    const applied = applyDelta(state, eff, value, acc);
    eff.appliedTotal += value;
    record(acc, eff, applied);
    if (eff.everyTurn && eff.end > close) keep.push(eff);
  }
  state.agenda = keep;
}

function record(acc: EffectAccumulator, eff: ScheduledEffect, delta: number): void {
  acc.applied.push({
    source: `action:${eff.actionId}`,
    actionId: eff.actionId,
    effectId: eff.effectId,
    originTurn: eff.originTurn,
    target: eff.target,
    delta,
    mode: eff.mode,
    explanation: eff.explanation,
  });
}

/**
 * Aplica efectos de una acción de ejecución inmediata (reunión, acuerdo) en la
 * fase de decisión: se programan y se resuelven en el acto.
 */
export function applyImmediateAction(state: CausalState, actionId: string, actor?: ActorId): AppliedEffectRecord[] {
  const turn = state.turn;
  const scheduled = scheduleActionEffects(state, actionId, turn, actor);
  const acc = newAccumulator();
  const ids = new Set(scheduled.map(s => s.uid));
  const others = state.agenda.filter(e => !ids.has(e.uid));
  state.agenda = scheduled;
  applyAgendaImmediate(state, turn, acc);
  state.agenda = [...others, ...state.agenda];
  return acc.applied;
}

/** Igual que applyAgenda pero los flags rigen desde el turno actual. */
function applyAgendaImmediate(state: CausalState, turn: number, acc: EffectAccumulator): void {
  const before = { ...state.flags };
  applyAgenda(state, turn, acc);
  for (const [name, f] of Object.entries(state.flags)) {
    if (before[name] !== f && f.start === turn + 1) {
      state.flags[name] = { ...f, start: turn, end: f.end === null ? null : f.end - 1 };
    }
  }
}
